import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CircleDollarSign, AlertCircle } from 'lucide-react';
import { getClients } from '@/data/mockData';

const AdminDashboard = () => {
  const clients = getClients();
  const totalClients = clients.length;
  const totalPaid = clients.filter(c => c.billingStatus === 'paid').length;
  const totalDue = clients.filter(c => c.billingStatus === 'due').length;

  const stats = [
    { label: 'Total Clients', value: totalClients, icon: Users, color: 'text-primary bg-primary/10' },
    { label: 'Paid (This Month)', value: totalPaid, icon: CircleDollarSign, color: 'text-success bg-success/10' },
    { label: 'Due (This Month)', value: totalDue, icon: AlertCircle, color: 'text-destructive bg-destructive/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your billing system</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(s => (
          <Card key={s.label} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <div className={`rounded-lg p-2 ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
