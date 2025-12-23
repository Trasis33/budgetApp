import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { RecurringTemplate, Category, User } from '../types';
import { formatCurrency } from '../lib/utils';
import { Trash2, Edit2, Plus, Calendar, CreditCard, Info } from 'lucide-react';
import { recurringExpenseService } from '../api/services/recurringExpenseService';
import { categoryService } from '../api/services/categoryService';
import { userService } from '../api/services/userService';
import { toast } from 'sonner';

interface EditingForm {
  id?: number;
  description: string;
  default_amount: number;
  category_id: number;
  paid_by_user_id: number;
  split_type: '50/50' | 'custom' | 'personal' | 'bill';
  split_ratio_user1?: number;
  split_ratio_user2?: number;
  recurring_type: 'bill' | 'subscription';
  is_shared: boolean;
  notes?: string;
  day_of_month: number;
}

export function RecurringExpenses() {
  const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingForm, setEditingForm] = useState<EditingForm | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, categoriesData, usersData] = await Promise.all([
        recurringExpenseService.getTemplates(true), // Include inactive for management
        categoryService.getCategories(),
        userService.getUsers()
      ]);
      setTemplates(templatesData);
      setCategories(categoriesData);
      setUsers(usersData);
    } catch (error) {
      toast.error('Failed to load recurring expenses');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: RecurringTemplate) => {
    setEditingForm({
      id: template.id,
      description: template.description,
      default_amount: template.default_amount,
      category_id: template.category_id,
      paid_by_user_id: template.paid_by_user_id,
      split_type: template.split_type,
      split_ratio_user1: template.split_ratio_user1,
      split_ratio_user2: template.split_ratio_user2,
      recurring_type: template.recurring_type || 'bill',
      is_shared: template.is_shared ?? true,
      notes: template.notes || '',
      day_of_month: template.day_of_month || 1
    });
  };

  const handleSave = async () => {
    if (!editingForm) return;

    if (!editingForm.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (editingForm.default_amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        description: editingForm.description,
        default_amount: editingForm.default_amount,
        category_id: editingForm.category_id,
        paid_by_user_id: editingForm.paid_by_user_id,
        split_type: editingForm.split_type,
        split_ratio_user1: editingForm.split_ratio_user1,
        split_ratio_user2: editingForm.split_ratio_user2,
        recurring_type: editingForm.recurring_type,
        is_shared: editingForm.is_shared,
        notes: editingForm.notes,
        day_of_month: editingForm.day_of_month
      };

      if (editingForm.id) {
        await recurringExpenseService.updateTemplate(editingForm.id, payload);
        toast.success('Updated successfully');
      } else {
        await recurringExpenseService.createTemplate(payload);
        toast.success('Created successfully');
      }
      
      setEditingForm(null);
      loadData();
    } catch (error) {
      toast.error('Failed to save');
      console.error('Error saving:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsSubmitting(true);
      await recurringExpenseService.permanentlyDeleteTemplate(id);
      toast.success('Permanently deleted');
      setDeleteId(null);
      loadData();
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (template: RecurringTemplate) => {
    try {
      if (template.is_active) {
        await recurringExpenseService.deactivateTemplate(template.id);
        toast.success('Deactivated');
      } else {
        await recurringExpenseService.reactivateTemplate(template.id);
        toast.success('Reactivated');
      }
      loadData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'Unknown';
  const getUserName = (id: number) => users.find(u => u.id === id)?.name || 'Unknown';

  const renderTemplateList = (type: 'bill' | 'subscription') => {
    const filtered = templates.filter(t => (t.recurring_type || 'bill') === type);
    
    if (filtered.length === 0) {
      return (
        <div className="py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No recurring {type}s found.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(template => (
          <Card key={template.id} className={!template.is_active ? 'opacity-60 grayscale' : ''}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{template.description}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {getCategoryName(template.category_id)}
                    </Badge>
                    {!template.is_shared && (
                      <Badge variant="outline" className="text-[10px] border-theme-amber text-theme-amber">
                        Personal
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-indigo-600">
                    {formatCurrency(template.default_amount)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Day {template.day_of_month || 1}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {template.notes && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 bg-muted/30 p-2 rounded italic">
                  "{template.notes}"
                </p>
              )}
              <div className="flex justify-between items-center mt-2">
                <div className="text-[10px] text-muted-foreground">
                  By {getUserName(template.paid_by_user_id)} • {template.split_type}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(template)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => setDeleteId(template.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Switch 
                    checked={template.is_active} 
                    onCheckedChange={() => toggleActive(template)} 
                    className="scale-75"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bills & Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage recurring monthly expenses. Indigo for bills, Violet for subscriptions.
          </p>
        </div>
        <Button onClick={() => setEditingForm({
          description: '',
          default_amount: 0,
          category_id: categories[0]?.id || 1,
          paid_by_user_id: users[0]?.id || 1,
          split_type: '50/50',
          recurring_type: 'bill',
          is_shared: true,
          day_of_month: 1
        })}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Recurring
        </Button>
      </div>

      <Tabs defaultValue="bill" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="bill" className="gap-2">
            <Calendar className="h-4 w-4" />
            Bills
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Subscriptions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="bill" className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-indigo-700 flex items-center gap-2">
              Monthly Bills
              <Info className="h-4 w-4 text-muted-foreground" />
            </h2>
            <p className="text-sm text-muted-foreground">Fixed or fluctuating core household costs.</p>
          </div>
          {loading ? <div className="py-12 text-center">Loading...</div> : renderTemplateList('bill')}
        </TabsContent>
        <TabsContent value="subscription" className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-violet-700 flex items-center gap-2">
              Subscriptions
              <Info className="h-4 w-4 text-muted-foreground" />
            </h2>
            <p className="text-sm text-muted-foreground">Monthly services, streaming, and memberships.</p>
          </div>
          {loading ? <div className="py-12 text-center">Loading...</div> : renderTemplateList('subscription')}
        </TabsContent>
      </Tabs>

      {/* Edit/Create Dialog */}
      <Dialog open={editingForm !== null} onOpenChange={(open) => !open && setEditingForm(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingForm?.id ? 'Edit' : 'New'} Recurring Expense</DialogTitle>
            <DialogDescription>
              Set up a template that generates an expense automatically each month.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <div className="col-span-3 flex gap-4">
                <Button 
                  type="button"
                  variant={editingForm?.recurring_type === 'bill' ? 'default' : 'outline'}
                  className={editingForm?.recurring_type === 'bill' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                  onClick={() => setEditingForm(prev => prev ? { ...prev, recurring_type: 'bill' } : null)}
                >
                  Bill
                </Button>
                <Button 
                  type="button"
                  variant={editingForm?.recurring_type === 'subscription' ? 'default' : 'outline'}
                  className={editingForm?.recurring_type === 'subscription' ? 'bg-violet-600 hover:bg-violet-700' : ''}
                  onClick={() => setEditingForm(prev => prev ? { ...prev, recurring_type: 'subscription' } : null)}
                >
                  Subscription
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="desc" className="text-right">Description</Label>
              <Input
                id="desc"
                className="col-span-3"
                value={editingForm?.description || ''}
                onChange={(e) => setEditingForm(prev => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="e.g., Rent, Netflix, Electricity"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Default Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                className="col-span-3"
                value={editingForm?.default_amount || ''}
                onChange={(e) => setEditingForm(prev => prev ? { ...prev, default_amount: parseFloat(e.target.value) } : null)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="day" className="text-right">Day of Month</Label>
              <Input
                id="day"
                type="number"
                min="1"
                max="28"
                className="col-span-3"
                value={editingForm?.day_of_month || 1}
                onChange={(e) => setEditingForm(prev => prev ? { ...prev, day_of_month: parseInt(e.target.value) } : null)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select
                value={editingForm?.category_id.toString()}
                onValueChange={(val) => setEditingForm(prev => prev ? { ...prev, category_id: parseInt(val) } : null)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shared" className="text-right">Shared Expense?</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Switch 
                  id="shared"
                  checked={editingForm?.is_shared}
                  onCheckedChange={(val) => setEditingForm(prev => prev ? { ...prev, is_shared: val, split_type: val ? '50/50' : 'personal' } : null)}
                />
                <span className="text-sm text-muted-foreground">
                  {editingForm?.is_shared ? 'Shared with partner' : 'Personal expense'}
                </span>
              </div>
            </div>

            {editingForm?.is_shared && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="split" className="text-right">Split Type</Label>
                <Select
                  value={editingForm?.split_type}
                  onValueChange={(val: any) => setEditingForm(prev => prev ? { ...prev, split_type: val } : null)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50/50">50/50 Split</SelectItem>
                    <SelectItem value="custom">Custom Percentage</SelectItem>
                    <SelectItem value="bill">Special Partner Split</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payer" className="text-right">Paid By</Label>
              <Select
                value={editingForm?.paid_by_user_id.toString()}
                onValueChange={(val) => setEditingForm(prev => prev ? { ...prev, paid_by_user_id: parseInt(val) } : null)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">Notes</Label>
              <Textarea
                id="notes"
                className="col-span-3"
                value={editingForm?.notes || ''}
                onChange={(e) => setEditingForm(prev => prev ? { ...prev, notes: e.target.value } : null)}
                placeholder="Optional notes or details"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingForm(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Recurring'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the recurring template. Past generated expenses will be kept but unlinked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
