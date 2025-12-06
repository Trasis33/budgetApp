import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { AlertCircle, CalendarIcon, CreditCard, RefreshCw, Trash2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { recurringExpenseService } from '../../api/services/recurringExpenseService';
import { categoryService } from '../../api/services/categoryService';
import { authService } from '../../api/services/authService';
import type { Category, RecurringTemplate, User } from '../../types';
import { toast } from 'sonner';

export function RecurringBillsSection() {
  const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | 'new' | null>(null);
  const [showDeactivated, setShowDeactivated] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<RecurringTemplate | null>(null);
  const [deleteExpenses, setDeleteExpenses] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState<{
    id?: number;
    description: string;
    default_amount: string;
    category_id: number | null;
    paid_by_user_id: number | null;
    bill_managed: boolean;
  }>({
    description: '',
    default_amount: '',
    category_id: null,
    paid_by_user_id: null,
    bill_managed: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [tpls, cats, usersData] = await Promise.all([
          recurringExpenseService.getTemplates(true), // Include inactive
          categoryService.getCategories(),
          authService.getUsers(),
        ]);
        setTemplates(tpls);
        setCategories(cats);
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to load recurring bills', error);
        toast.error('Failed to load recurring bills');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const resetForm = () => {
    setFormData({
      id: undefined,
      description: '',
      default_amount: '',
      category_id: null,
      paid_by_user_id: users[0]?.id ?? null,
      bill_managed: true,
    });
  };

  const openNewForm = () => {
    resetForm();
    setShowNewForm(true);
  };

  const openEditForm = (tpl: RecurringTemplate) => {
    setFormData({
      id: tpl.id,
      description: tpl.description,
      default_amount: String(tpl.default_amount ?? ''),
      category_id: tpl.category_id,
      paid_by_user_id: tpl.paid_by_user_id,
      bill_managed: Boolean(tpl.bill_managed),
    });
    setShowNewForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim() || !formData.default_amount || !formData.category_id || !formData.paid_by_user_id) {
      toast.error('Please fill in description, amount, category, and who pays');
      return;
    }

    const amount = parseFloat(formData.default_amount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Bill amount must be a positive number');
      return;
    }

    const payload = {
      description: formData.description.trim(),
      default_amount: amount,
      category_id: formData.category_id!,
      paid_by_user_id: formData.paid_by_user_id!,
      // keep split_type and ratios defaulted for now; these can be edited elsewhere
      split_type: '50/50' as const,
      bill_managed: formData.bill_managed,
    };

    try {
      if (formData.id) {
        setSavingId(formData.id);
        const updated = await recurringExpenseService.updateTemplate(formData.id, payload);
        setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        toast.success('Bill updated');
      } else {
        setSavingId('new');
        const created = await recurringExpenseService.createTemplate(payload);
        setTemplates((prev) => [...prev, created]);
        toast.success('Bill created');
      }
      setShowNewForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save bill', error);
      toast.error('Failed to save bill');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await recurringExpenseService.deactivateTemplate(id);
      setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, is_active: false } : t)));
      toast.success('Bill deactivated');
    } catch (error) {
      console.error('Failed to deactivate bill', error);
      toast.error('Failed to deactivate bill');
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      const updated = await recurringExpenseService.reactivateTemplate(id);
      setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success('Bill reactivated');
    } catch (error) {
      console.error('Failed to reactivate bill', error);
      toast.error('Failed to reactivate bill');
    }
  };

  const openDeleteDialog = (tpl: RecurringTemplate) => {
    setTemplateToDelete(tpl);
    setDeleteExpenses(false);
    setDeleteDialogOpen(true);
  };

  const handlePermanentDelete = async () => {
    if (!templateToDelete) return;

    try {
      setDeleting(true);
      const result = await recurringExpenseService.permanentlyDeleteTemplate(templateToDelete.id, deleteExpenses);
      setTemplates((prev) => prev.filter((t) => t.id !== templateToDelete.id));
      
      if (deleteExpenses && result.linkedExpenseCount > 0) {
        toast.success(`Bill deleted along with ${result.linkedExpenseCount} linked expense(s)`);
      } else if (result.linkedExpenseCount > 0) {
        toast.success(`Bill deleted. ${result.linkedExpenseCount} expense(s) were kept but unlinked.`);
      } else {
        toast.success('Bill deleted');
      }
    } catch (error) {
      console.error('Failed to delete bill', error);
      toast.error('Failed to delete bill');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const activeBillTemplates = templates.filter((t) => t.bill_managed && t.is_active);
  const deactivatedBillTemplates = templates.filter((t) => t.bill_managed && !t.is_active);

  const renderBillItem = (tpl: RecurringTemplate, isDeactivated: boolean) => {
    const category = categories.find((c) => c.id === tpl.category_id);
    const payer = users.find((u) => u.id === tpl.paid_by_user_id);
    
    return (
      <div
        key={tpl.id}
        className={`flex items-center justify-between rounded-lg border p-3 text-sm transition-colors ${
          isDeactivated 
            ? 'bg-muted/50 border-muted opacity-60' 
            : ''
        }`}
      >
        <div className="space-y-0.5">
          <div className="font-medium flex items-center gap-2">
            {tpl.description}
            {category && (
              <span className="text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                {category.name}
              </span>
            )}
            {isDeactivated && (
              <span className="text-xs rounded-full bg-destructive/10 text-destructive px-2 py-0.5">
                Deactivated
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
            <span>
              Amount: <span className="font-medium">kr {Number(tpl.default_amount).toFixed(0)}</span>
            </span>
            {payer && <span>Paid by: {payer.name}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDeactivated ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReactivate(tpl.id)}
                className="gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reactivate
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openDeleteDialog(tpl)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openEditForm(tpl)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeactivate(tpl.id)}
              >
                Deactivate
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Recurring Bills
              </CardTitle>
              <CardDescription>
                Manage fixed monthly bills that should be pre-filled as expenses each month.
              </CardDescription>
            </div>
            <Button size="sm" onClick={openNewForm}>
              Add Bill
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading bills...
            </div>
          )}

          {!loading && activeBillTemplates.length === 0 && !showNewForm && (
            <div className="flex items-start gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">No recurring bills yet</p>
                <p>
                  Create templates for mortgage, car lease, daycare and other required monthly bills. They
                  will be generated as expenses each month.
                </p>
              </div>
            </div>
          )}

          {/* Active bills list */}
          {activeBillTemplates.length > 0 && (
            <div className="space-y-2">
              {activeBillTemplates.map((tpl) => renderBillItem(tpl, false))}
            </div>
          )}

          {/* Deactivated bills section */}
          {deactivatedBillTemplates.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDeactivated(!showDeactivated)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                {showDeactivated ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span>
                  {deactivatedBillTemplates.length} deactivated bill{deactivatedBillTemplates.length !== 1 ? 's' : ''}
                </span>
              </button>
              
              {showDeactivated && (
                <div className="space-y-2 mt-3">
                  {deactivatedBillTemplates.map((tpl) => renderBillItem(tpl, true))}
                </div>
              )}
            </div>
          )}

          {/* New / edit bill form */}
          {showNewForm && (
            <form onSubmit={handleSave} className="space-y-4 border-t pt-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bill-description">Bill name</Label>
                  <Input
                    id="bill-description"
                    placeholder="e.g., Mortgage, Car lease"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bill-amount">Monthly amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      kr
                    </span>
                    <Input
                      id="bill-amount"
                      type="number"
                      min="0"
                      step="1"
                      className="pl-7"
                      value={formData.default_amount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, default_amount: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bill-category">Category</Label>
                  <Select
                    value={formData.category_id ? String(formData.category_id) : ''}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({ ...prev, category_id: Number(value) }))
                    }
                  >
                    <SelectTrigger id="bill-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c.is_fixed && c.spending_role === 'need')
                        .map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Only fixed "Need" categories are shown (e.g., Mortgage, Car Lease, Daycare).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bill-payer">Paid by</Label>
                  <Select
                    value={formData.paid_by_user_id ? String(formData.paid_by_user_id) : ''}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({ ...prev, paid_by_user_id: Number(value) }))
                    }
                  >
                    <SelectTrigger id="bill-payer">
                      <SelectValue placeholder="Select payer" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Used as the payer when the monthly bill expense is generated.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>Pre-fill as bill each month</Label>
                  <p className="text-xs text-muted-foreground">
                    When enabled, this template is treated as a core bill in the budget wizard.
                  </p>
                </div>
                <Switch
                  checked={formData.bill_managed}
                  onCheckedChange={(checked: any) =>
                    setFormData((prev) => ({ ...prev, bill_managed: checked }))
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={savingId !== null}>
                  {savingId ? 'Saving…' : formData.id ? 'Save changes' : 'Create bill'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete recurring bill</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Are you sure you want to permanently delete <strong>"{templateToDelete?.description}"</strong>?
                </p>
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Also delete linked expenses</p>
                      <p className="text-xs text-muted-foreground">
                        If enabled, all expenses generated from this bill will be permanently deleted.
                        Otherwise, they will be kept but unlinked from this template.
                      </p>
                    </div>
                    <Switch
                      checked={deleteExpenses}
                      onCheckedChange={setDeleteExpenses}
                    />
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Delete permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
