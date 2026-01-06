import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
import { getCategoryIconStyle } from '../lib/iconUtils';
import { getCategoryColor } from '../lib/categoryColors';
import { getIconByName } from '../lib/categoryIcons';
import { Trash2, Edit2, Plus, Calendar, CreditCard, Info, Tag, Search, Filter, RefreshCw, CalendarClock, Loader2 } from 'lucide-react';
import { recurringExpenseService } from '../api/services/recurringExpenseService';
import { expenseService } from '../api/services/expenseService';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [pendingCount, setPendingCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, categoriesData, usersData, expensesData] = await Promise.all([
        recurringExpenseService.getTemplates(true), // Include inactive for management
        categoryService.getCategories(),
        userService.getUsers(),
        expenseService.getExpenses('all')
      ]);
      setTemplates(templatesData);
      setCategories(categoriesData);
      setUsers(usersData);

      // Check for pending templates for this month
      const monthlyExpenses = expensesData.filter((e: any) => {
        const d = new Date(e.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });
      
      const generatedTemplateIds = new Set(
        monthlyExpenses
          .filter((e: any) => e.recurring_expense_id)
          .map((e: any) => e.recurring_expense_id)
      );
      
      const pending = templatesData.filter(t => t.is_active && !generatedTemplateIds.has(t.id));
      setPendingCount(pending.length);

    } catch (error) {
      toast.error('Failed to load recurring expenses');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const result = await recurringExpenseService.generate({
        year: currentYear,
        month: currentMonth + 1
      });
      
      if (result.generatedCount > 0) {
        toast.success(`Generated ${result.generatedCount} expenses for ${now.toLocaleDateString('en-US', { month: 'long' })}`);
        loadData();
      } else {
        toast.info('All expenses for this month are already generated.');
      }
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
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

  const getUserName = (id: number) => users.find(u => u.id === id)?.name || 'Unknown';

  const renderTemplateList = (type: 'bill' | 'subscription') => {
    const filtered = templates
      .filter(t => (t.recurring_type || 'bill') === type)
      .filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterCategory === 'all' || t.category_id.toString() === filterCategory)
      )
      .sort((a, b) => (a.day_of_month || 1) - (b.day_of_month || 1));
    
    if (filtered.length === 0) {
      return (
        <div className="py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No recurring {type}s found matching your filters.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(template => {
          const category = categories.find(c => c.id === template.category_id);
          const CategoryIcon = getIconByName(category?.icon);
          const categoryColor = category?.color || 'var(--theme-indigo)';
          const accentColor = type === 'bill' ? 'text-[oklch(var(--theme-indigo))]' : 'text-[oklch(var(--theme-gold))]';

          return (
            <Card 
              key={template.id} 
              className={`shadow-sm hover:shadow-md transition-all border-t-4 gap-0 overflow-hidden ${!template.is_active ? 'opacity-60 grayscale' : ''}`}
              style={{ borderTopColor: categoryColor }}
            >
              <CardHeader className="pb-3 pt-5 px-4 bg-card">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/10"
                      style={{ 
                        backgroundColor: `color-mix(in oklch, ${categoryColor} 15%, white)`,
                        color: categoryColor
                      }}
                    >
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-base font-bold leading-tight text-foreground">{template.description}</CardTitle>
                      <div className="flex flex-wrap gap-1.5">
                        {category && (() => {
                        const categoryColor = getCategoryColor({ color: category.color });
                        return (
                          <div 
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] h-5 rounded-full border border-transparent transition-colors" 
                            style={getCategoryIconStyle(categoryColor, false, 0.08)}
                          >
                            <span className="text-xs font-semibold">{category.name}</span>
                          </div>
                        );
                      })()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${accentColor} tracking-tight`}>
                      {formatCurrency(template.default_amount)}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
                      Day {template.day_of_month || 1}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2 px-4 pb-4 bg-card">
                {template.notes && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mb-4 bg-muted/30 p-2.5 rounded-lg italic border border-border/30">
                    {template.notes}
                  </p>
                )}
                <div className="flex justify-between items-center mt-2 border-t pt-3 border-border/50">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground">
                      Payer: <span className="font-medium text-foreground">{getUserName(template.paid_by_user_id)}</span>
                    </span>
                    <span className="text-[9px] font-bold text-[oklch(var(--theme-teal)/0.7)] uppercase tracking-widest">
                      {template.split_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted rounded-full" onClick={() => handleEdit(template)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-[oklch(var(--theme-coral))] hover:text-[oklch(var(--theme-coral))] hover:bg-[oklch(var(--theme-coral)/0.1)] rounded-full" onClick={() => setDeleteId(template.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <div className="w-px h-4 bg-border/60 mx-1" />
                    <Switch 
                      checked={template.is_active} 
                      onCheckedChange={() => toggleActive(template)} 
                      className="scale-75"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[oklch(var(--theme-indigo)/0.1)]">
            <CalendarClock className="h-6 w-6 text-[oklch(var(--theme-indigo))]" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-semibold tracking-tight">Bills & Subscriptions</h1>
              {pendingCount > 0 && (
                <Badge variant="warning" className="animate-pulse">
                  {pendingCount} Pending
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Manage recurring monthly expenses. Indigo for bills, Violet for subscriptions.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Button 
              variant="outline" 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="border-[oklch(var(--theme-indigo)/0.3)] text-[oklch(var(--theme-indigo))] hover:bg-[oklch(var(--theme-indigo)/0.05)] gap-2"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Sync {now.toLocaleDateString('en-US', { month: 'short' })}
            </Button>
          )}
          <Button variant="teal" onClick={() => setEditingForm({
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
            Add New
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search descriptions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-background border-border/50 focus-visible:ring-[oklch(var(--theme-teal)/0.3)]"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[200px] h-10 bg-background border-border/50 focus:ring-[oklch(var(--theme-teal)/0.3)]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            <h2 className="text-xl font-semibold text-[oklch(var(--theme-teal))] flex items-center gap-2">
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
                  className={editingForm?.recurring_type === 'bill' ? 'bg-[oklch(var(--theme-teal))] hover:bg-[oklch(var(--theme-teal)/0.9)]' : ''}
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
                onValueChange={(val: string) => setEditingForm(prev => prev ? { ...prev, category_id: parseInt(val) } : null)}
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
                  onCheckedChange={(val: boolean) => setEditingForm(prev => prev ? { ...prev, is_shared: val, split_type: val ? '50/50' : 'personal' } : null)}
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

            {editingForm?.is_shared && editingForm?.split_type === 'custom' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ratio" className="text-right text-xs">Your Share (%)</Label>
                <div className="col-span-3 flex items-center gap-4">
                  <Input
                    id="ratio"
                    type="number"
                    min="0"
                    max="100"
                    value={editingForm?.split_ratio_user1 || 50}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      const clamped = Math.min(100, Math.max(0, val));
                      setEditingForm(prev => prev ? { ...prev, split_ratio_user1: clamped, split_ratio_user2: 100 - clamped } : null);
                    }}
                    className="w-20"
                  />
                  <div className="text-sm text-muted-foreground flex-1">
                    Partner: <span className="font-medium text-foreground">{100 - (editingForm?.split_ratio_user1 || 50)}%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payer" className="text-right">Paid By</Label>
              <Select
                value={editingForm?.paid_by_user_id.toString()}
                onValueChange={(val: string) => setEditingForm(prev => prev ? { ...prev, paid_by_user_id: parseInt(val) } : null)}
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
      <AlertDialog open={deleteId !== null} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
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
              className="bg-[oklch(var(--theme-coral))] hover:bg-[oklch(var(--theme-coral)/0.9)]"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
