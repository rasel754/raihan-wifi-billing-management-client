import { useState, useEffect } from 'react';
import { ClientService, IClient, CreateClientData } from '@/services/client.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 8;

const AdminClients = () => {
  const [clients, setClients] = useState<IClient[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<IClient | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', holding: '', cardNumber: '', billingStatus: 'due', billingMonth: '2026-03' });
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      const result = await ClientService.getAllClients({ searchTerm: search, page, limit: ITEMS_PER_PAGE });
      setClients(result.data || []);
      setTotal(result.meta?.total || 0);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch clients', variant: 'destructive' });
    }
  };

  // Fetch clients when search or page changes
  useEffect(() => {
    // Add a small debounce to search if needed, but for now simple fetch is okay
    const delayDebounceFn = setTimeout(() => {
      fetchClients();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, page]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const getLatestStatus = (client: IClient) => {
    if (!client.billingMonths || client.billingMonths.length === 0) return 'due';
    return client.billingMonths[client.billingMonths.length - 1].status;
  };

  const openAdd = () => {
    setEditingClient(null);
    setForm({ name: '', phone: '', holding: '', cardNumber: '', billingStatus: 'due', billingMonth: '2026-03' });
    setDialogOpen(true);
  };

  const openEdit = (c: IClient) => {
    setEditingClient(c);
    const latestStatus = getLatestStatus(c);
    const latestMonth = c.billingMonths && c.billingMonths.length > 0 ? c.billingMonths[c.billingMonths.length - 1].month : '2026-03';
    setForm({ name: c.name, phone: c.phone, holding: c.holding, cardNumber: c.cardNumber, billingStatus: latestStatus, billingMonth: latestMonth });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: 'Error', description: 'Name and phone are required.', variant: 'destructive' });
      return;
    }
    
    try {
      if (editingClient) {
        await ClientService.updateClient(editingClient._id, {
          name: form.name,
          phone: form.phone,
          holding: form.holding,
          cardNumber: form.cardNumber,
        });
        toast({ title: 'Updated', description: 'Client updated successfully.' });
      } else {
        const payload: CreateClientData = {
          name: form.name,
          phone: form.phone,
          holding: form.holding,
          cardNumber: form.cardNumber,
          billingMonths: [{ month: form.billingMonth, status: form.billingStatus }]
        };
        await ClientService.createClient(payload);
        toast({ title: 'Added', description: 'Client added successfully.' });
      }
      fetchClients();
      setDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Operation failed', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await ClientService.deleteClient(deleteId);
        toast({ title: 'Deleted', description: 'Client deleted.' });
        setDeleteId(null);
        // If we delete the last item on a page, we might want to go back a page
        if (clients.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchClients();
        }
      } catch (error: any) {
        toast({ title: 'Error', description: error.response?.data?.message || 'Failed to delete client', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">{total} total clients</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add Client</Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or phone..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="h-10 w-10 mb-2" />
              <p>No clients found</p>
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map(c => {
                    const status = getLatestStatus(c);
                    return (
                    <TableRow key={c._id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell className="hidden md:table-cell">{c.holding}</TableCell>
                      <TableCell className="hidden md:table-cell">{c.cardNumber}</TableCell>
                      <TableCell>
                        <Badge variant={status === 'paid' ? 'default' : 'destructive'} className={status === 'paid' ? 'bg-success hover:bg-success/90' : ''}>
                          {status === 'paid' ? 'Paid' : 'Due'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(c._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Edit Client' : 'Add Client'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Holding</Label><Input value={form.holding} onChange={e => setForm(f => ({ ...f, holding: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Card Number</Label><Input value={form.cardNumber} onChange={e => setForm(f => ({ ...f, cardNumber: e.target.value }))} /></div>
            </div>
            {!editingClient && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Initial Month</Label><Input value={form.billingMonth} onChange={e => setForm(f => ({ ...f, billingMonth: e.target.value }))} /></div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.billingStatus} onValueChange={(v: 'paid' | 'due') => setForm(f => ({ ...f, billingStatus: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="due">Due</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <DialogHeader>
           {editingClient && <p className="text-xs text-muted-foreground">Note: Billing status can be managed from the Billing page.</p>}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingClient ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminClients;
