import { useState, useMemo, useEffect } from 'react';
import { ClientService, IClient } from '@/services/client.service';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Receipt, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmployeeBilling = () => {
  const [clients, setClients] = useState<IClient[]>([]);
  const [search, setSearch] = useState('');
  
  // Default to current year-month YYYY-MM
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      // Fetch a large limit for simple client-side search in billing dashboard
      // Or we can rely backend search. Using limit 1000 for simplicity similar to mock
      const res = await ClientService.getAllClients({ limit: 1000 });
      setClients(res.data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch clients', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }, [clients, search]);

  const handleStatusChange = async (clientId: string, newStatus: string, hasExistingBill: boolean) => {
    try {
      if (hasExistingBill) {
        await ClientService.updateBillingStatus(clientId, selectedMonth, { status: newStatus });
        toast({ title: 'Updated', description: `Billing status updated to ${newStatus}.` });
      } else {
        await ClientService.addBillingMonth(clientId, { month: selectedMonth, status: newStatus });
        toast({ title: 'Generated', description: `Bill generated and set to ${newStatus}.` });
      }
      fetchClients();
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update billing', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground">Manage monthly billing status</p>
        </div>
        <div className="flex items-center gap-2 bg-card p-1 rounded-md border shadow-sm px-3">
          <Calendar className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium mr-2">Target Month:</span>
          <Input 
            type="month" 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)} 
            className="w-40 border-none shadow-none focus-visible:ring-0 px-0 h-8" 
          />
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Receipt className="h-10 w-10 mb-2" /><p>No clients found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Card No.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(c => {
                    const bill = c.billingMonths?.find(b => b.month === selectedMonth);
                    const hasExistingBill = !!bill;
                    const status = bill ? bill.status : 'due';

                    return (
                      <TableRow key={c._id}>
                        <TableCell className="font-medium">
                          {c.name}
                          <div className="text-xs text-muted-foreground font-normal">{c.phone}</div>
                        </TableCell>
                        <TableCell>{c.cardNumber}</TableCell>
                        <TableCell>
                          <Badge variant={status === 'paid' ? 'default' : 'destructive'} className={status === 'paid' ? 'bg-success hover:bg-success/90' : ''}>
                            {status === 'paid' ? 'Paid' : 'Due'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={status} 
                            onValueChange={(v) => handleStatusChange(c._id, v, hasExistingBill)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Set Status..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paid">Mark Paid</SelectItem>
                              <SelectItem value="due">Mark Due</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeBilling;
