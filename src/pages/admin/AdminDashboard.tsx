import { useState, useEffect } from 'react';
import { DashboardService, DashboardStats, MonthlySummary } from '@/services/dashboard.service';
import { ClientService, IClient } from '@/services/client.service';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  CircleDollarSign,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Wifi,
  RefreshCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

const formatMonth = (m: string) => {
  if (!m) return m;
  const [year, month] = m.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
};

const currentMonthKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${mo}`;
};

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: string;
  trendUp?: boolean;
  loading?: boolean;
}

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, trend, trendUp, loading }: StatCardProps) => (
  <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      <div className={`rounded-xl p-2.5 ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="h-9 w-20 rounded-md bg-muted animate-pulse" />
      ) : (
        <p className="text-4xl font-extrabold tracking-tight">{value}</p>
      )}
      {trend && (
        <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-success' : 'text-destructive'}`}>
          {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trend}
        </p>
      )}
    </CardContent>
  </Card>
);

// ── Mini bar chart ──────────────────────────────────────────────────────────
const MiniBarChart = ({ data }: { data: MonthlySummary[] }) => {
  const slice = data.slice(0, 6).reverse();
  const maxVal = Math.max(...slice.flatMap((d) => [d.totalPaid, d.totalDue]), 1);

  return (
    <div className="flex items-end gap-2 h-32 w-full">
      {slice.map((d) => {
        const paidPct = (d.totalPaid / maxVal) * 100;
        const duePct = (d.totalDue / maxVal) * 100;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-0.5 h-24 w-full">
              <div
                style={{ height: `${paidPct}%` }}
                className="flex-1 rounded-t-sm bg-success/80 transition-all duration-500 min-h-[2px]"
                title={`Paid: ${d.totalPaid}`}
              />
              <div
                style={{ height: `${duePct}%` }}
                className="flex-1 rounded-t-sm bg-destructive/70 transition-all duration-500 min-h-[2px]"
                title={`Due: ${d.totalDue}`}
              />
            </div>
            <span className="text-[9px] text-muted-foreground leading-none">{formatMonth(d.month)}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── Donut / radial summary ──────────────────────────────────────────────────
const DonutSummary = ({ paid, due }: { paid: number; due: number }) => {
  const total = paid + due || 1;
  const paidPct = (paid / total) * 100;
  const circumference = 2 * Math.PI * 36; // r=36
  const paidDash = (paidPct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="36" fill="none" stroke="hsl(var(--destructive)/0.2)" strokeWidth="12" />
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke="hsl(var(--success))"
          strokeWidth="12"
          strokeDasharray={`${paidDash} ${circumference - paidDash}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
        <text x="50" y="55" textAnchor="middle" className="font-bold" style={{ fontSize: 18, fill: 'currentColor' }}>
          {Math.round(paidPct)}%
        </text>
      </svg>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-success" /> Paid ({paid})
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-destructive" /> Due ({due})
        </span>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentClients, setRecentClients] = useState<IClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, clientRes] = await Promise.all([
        DashboardService.getStats(),
        ClientService.getAllClients({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
      ]);
      setStats(dashRes.data);
      setRecentClients(clientRes.data || []);
    } catch {
      setError('Failed to load dashboard data. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Derive current-month stats
  const thisMonth = currentMonthKey();
  const currentMonthData = stats?.monthlySummary?.find((m) => m.month === thisMonth);
  const totalPaidThisMonth = currentMonthData?.totalPaid ?? 0;
  const totalDueThisMonth = currentMonthData?.totalDue ?? 0;

  // All-time totals
  const allTimePaid = stats?.monthlySummary?.reduce((s, m) => s + m.totalPaid, 0) ?? 0;
  const allTimeDue = stats?.monthlySummary?.reduce((s, m) => s + m.totalDue, 0) ?? 0;

  const statCards = [
    {
      label: 'Total Clients',
      value: stats?.totalClients ?? 0,
      icon: Users,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'Paid This Month',
      value: totalPaidThisMonth,
      icon: CircleDollarSign,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      trend: totalPaidThisMonth > 0 ? `${formatMonth(thisMonth)}` : undefined,
      trendUp: true,
    },
    {
      label: 'Due This Month',
      value: totalDueThisMonth,
      icon: AlertCircle,
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      trend: totalDueThisMonth > 0 ? 'Needs attention' : undefined,
      trendUp: false,
    },
    {
      label: 'Billing Months Tracked',
      value: stats?.monthlySummary?.length ?? 0,
      icon: CalendarDays,
      iconBg: 'bg-accent',
      iconColor: 'text-accent-foreground',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>. Here's your billing overview.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2 self-start sm:self-auto">
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Monthly Bar Chart */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Monthly Billing Overview</CardTitle>
            <CardDescription className="text-xs">Paid vs Due per month (last 6 months)</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {loading ? (
              <div className="h-32 w-full rounded-md bg-muted animate-pulse" />
            ) : stats?.monthlySummary && stats.monthlySummary.length > 0 ? (
              <>
                <MiniBarChart data={stats.monthlySummary} />
                <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-success/80" /> Paid
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-destructive/70" /> Due
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2">
                <CalendarDays className="h-8 w-8 opacity-40" />
                No billing data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donut Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">All-Time Summary</CardTitle>
            <CardDescription className="text-xs">Paid vs Due across all months</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center pt-4">
            {loading ? (
              <div className="h-28 w-28 rounded-full bg-muted animate-pulse" />
            ) : (
              <DonutSummary paid={allTimePaid} due={allTimeDue} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Monthly Summary Table ── */}
      {stats?.monthlySummary && stats.monthlySummary.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Billing by Month</CardTitle>
            <CardDescription className="text-xs">Detailed breakdown per billing cycle</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Month</th>
                    <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Paid</th>
                    <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Due</th>
                    <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Total</th>
                    <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Collection Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.monthlySummary.map((row, idx) => {
                    const total = row.totalPaid + row.totalDue;
                    const rate = total > 0 ? Math.round((row.totalPaid / total) * 100) : 0;
                    const isCurrentMonth = row.month === thisMonth;
                    return (
                      <tr
                        key={row.month}
                        className={`border-b transition-colors ${idx % 2 === 0 ? '' : 'bg-muted/20'} hover:bg-accent/30`}
                      >
                        <td className="px-4 py-3 font-medium flex items-center gap-2">
                          {formatMonth(row.month)}
                          {isCurrentMonth && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary">
                              Current
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold text-success">{row.totalPaid}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold text-destructive">{row.totalDue}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{total}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="hidden sm:block w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-success transition-all duration-500"
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${rate >= 80 ? 'text-success' : rate >= 50 ? 'text-warning' : 'text-destructive'}`}>
                              {rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Recent Clients ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Recent Clients</CardTitle>
            <CardDescription className="text-xs">Last 5 clients added to the system</CardDescription>
          </div>
          <Wifi className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 w-full rounded-md bg-muted animate-pulse" />
              ))}
            </div>
          ) : recentClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm gap-2">
              <Users className="h-8 w-8 opacity-40" />
              No clients yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground hidden sm:table-cell">Phone</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground hidden md:table-cell">Holding</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Latest Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClients.map((c, idx) => {
                    const latestBilling = c.billingMonths?.[c.billingMonths.length - 1];
                    const status = latestBilling?.status ?? 'due';
                    return (
                      <tr
                        key={c._id}
                        className={`border-b transition-colors hover:bg-accent/30 ${idx % 2 === 0 ? '' : 'bg-muted/20'}`}
                      >
                        <td className="px-4 py-3 font-medium">{c.name}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.phone}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.holding || '—'}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={status === 'paid' ? 'default' : 'destructive'}
                            className={`text-xs ${status === 'paid' ? 'bg-success hover:bg-success/90 text-white' : ''}`}
                          >
                            {status === 'paid' ? 'Paid' : 'Due'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
