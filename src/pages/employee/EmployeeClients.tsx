import { useState, useMemo } from 'react';
import { getClients, updateClient } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmployeeClients = () => {
  const [clients, setClients] = useState(getClients);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }, [clients, search]);

  const toggleStatus = (id: string, status: 'paid' | 'due') => {
    updateClient(id, { billingStatus: status });
    setClients(getClients());
    toast({ title: 'Updated', description: `Status set to ${status}.` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <p className="text-sm text-muted-foreground">View clients and update billing status</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or phone..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="h-10 w-10 mb-2" /><p>No clients found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="hidden md:table-cell">Holding</TableHead>
                    <TableHead className="hidden md:table-cell">Card No.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell className="hidden md:table-cell">{c.holding}</TableCell>
                      <TableCell className="hidden md:table-cell">{c.cardNumber}</TableCell>
                      <TableCell>
                        <Badge variant={c.billingStatus === 'paid' ? 'default' : 'destructive'} className={c.billingStatus === 'paid' ? 'bg-success hover:bg-success/90' : ''}>
                          {c.billingStatus === 'paid' ? 'Paid' : 'Due'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select value={c.billingStatus} onValueChange={(v: 'paid' | 'due') => toggleStatus(c.id, v)}>
                          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="due">Due</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeClients;
