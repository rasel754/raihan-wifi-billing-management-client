import { useState, useEffect } from 'react';
import { ClientService, IClient } from '@/services/client.service';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  CircleDollarSign,
  AlertCircle,
  RefreshCcw,
  Wifi,
} from 'lucide-react';

const currentMonthKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${mo}`;
};

const formatMonth = (m: string) => {
  if (!m) return m;
  const [year, month] = m.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<IClient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const thisMonth = currentMonthKey();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ClientService.getAllClients({ limit: 100 });
      const data = res.data || [];
      setClients(data);
      setTotal(res.meta?.total ?? data.length);
    } catch {
      setError('Failed to load client data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Derive stats from current month
  const getLatestStatus = (c: IClient) => {
    if (!c.billingMonths || c.billingMonths.length === 0) return 'due';
    return c.billingMonths[c.billingMonths.length - 1].status;
  };

  const paidThisMonth = clients.filter((c) => {
    const bm = c.billingMonths?.find((b) => b.month === thisMonth);
    return bm?.status === 'paid';
  }).length;

  const dueThisMonth = clients.filter((c) => {
    const bm = c.billingMonths?.find((b) => b.month === thisMonth);
    return !bm || bm.status !== 'paid';
  }).length;

  const statCards = [
    {
      label: 'Total Clients',
      value: total,
      icon: Users,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      desc: 'Registered in the system',
    },
    {
      label: 'Paid This Month',
      value: paidThisMonth,
      icon: CircleDollarSign,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      desc: formatMonth(thisMonth),
    },
    {
      label: 'Due This Month',
      value: dueThisMonth,
      icon: AlertCircle,
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      desc: 'Needs follow-up',
    },
  ];

  const recentClients = clients.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome, <span className="font-semibold text-foreground">{user?.name}</span>. Here's your overview.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2 self-start sm:self-auto">
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.label} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <div className={`rounded-xl p-2.5 ${s.iconBg}`}>
                <s.icon className={`h-5 w-5 ${s.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-9 w-20 rounded-md bg-muted animate-pulse" />
              ) : (
                <p className="text-4xl font-extrabold tracking-tight">{s.value}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress bar summary */}
      {!loading && total > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Collection Progress — {formatMonth(thisMonth)}</CardTitle>
            <CardDescription className="text-xs">
              {paidThisMonth} of {total} clients have paid this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-success transition-all duration-700"
                style={{ width: `${total > 0 ? (paidThisMonth / total) * 100 : 0}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span className="text-success font-medium">{total > 0 ? Math.round((paidThisMonth / total) * 100) : 0}% collected</span>
              <span>{dueThisMonth} remaining</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Clients Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Client Status</CardTitle>
            <CardDescription className="text-xs">Latest billing status per client</CardDescription>
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
              No clients found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground hidden sm:table-cell">Phone</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground hidden md:table-cell">Holding</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClients.map((c, idx) => {
                    const status = getLatestStatus(c);
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

export default EmployeeDashboard;
