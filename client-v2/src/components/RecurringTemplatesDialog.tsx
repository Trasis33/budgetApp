import { useState, useEffect } from 'react';
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
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { RecurringTemplate, Category, User } from '../types';
import { formatCurrency } from '../lib/utils';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { recurringExpenseService } from '../api/services/recurringExpenseService';
import { categoryService } from '../api/services/categoryService';
import { userService } from '../api/services/userService';
import { toast } from 'sonner';

interface RecurringTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

interface EditingForm {
  id?: number;
  description: string;
  default_amount: number;
  category_id: number;
  paid_by_user_id: number;
  split_type: '50/50' | 'custom' | 'personal' | 'bill';
  split_ratio_user1?: number;
  split_ratio_user2?: number;
}

export function RecurringTemplatesDialog({
  open,
  onOpenChange,
  onRefresh
}: RecurringTemplatesDialogProps) {
  const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingForm, setEditingForm] = useState<EditingForm | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, categoriesData, usersData] = await Promise.all([
        recurringExpenseService.getTemplates(),
        categoryService.getCategories(),
        userService.getUsers()
      ]);
      setTemplates(templatesData);
      setCategories(categoriesData);
      setUsers(usersData);
    } catch (error) {
      toast.error('Failed to load recurring templates');
      console.error('Error loading templates:', error);
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
      split_ratio_user2: template.split_ratio_user2
    });
  };

  const handleSave = async () => {
    if (!editingForm) return;

    // Validation
    if (!editingForm.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (editingForm.default_amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (editingForm.split_type === 'custom') {
      const ratio1 = editingForm.split_ratio_user1 || 0;
      const ratio2 = editingForm.split_ratio_user2 || 0;
      if (ratio1 + ratio2 !== 100) {
        toast.error('Custom split ratios must sum to 100%');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      if (editingForm.id) {
        // Update existing
        await recurringExpenseService.updateTemplate(editingForm.id, {
          description: editingForm.description,
          default_amount: editingForm.default_amount,
          category_id: editingForm.category_id,
          paid_by_user_id: editingForm.paid_by_user_id,
          split_type: editingForm.split_type,
          split_ratio_user1: editingForm.split_ratio_user1,
          split_ratio_user2: editingForm.split_ratio_user2
        });
        toast.success('Template updated successfully');
      } else {
        // Create new
        await recurringExpenseService.createTemplate({
          description: editingForm.description,
          default_amount: editingForm.default_amount,
          category_id: editingForm.category_id,
          paid_by_user_id: editingForm.paid_by_user_id,
          split_type: editingForm.split_type,
          split_ratio_user1: editingForm.split_ratio_user1,
          split_ratio_user2: editingForm.split_ratio_user2
        });

        // Auto-generate for current month
        const now = new Date();
        const generateResult = await recurringExpenseService.generate({
          year: now.getFullYear(),
          month: now.getMonth() + 1
        });

        if (generateResult.generatedCount > 0) {
          toast.success('Template created and generated for this month');
        } else {
          toast.success('Template created successfully');
        }
      }
      setEditingForm(null);
      // Small delay to ensure DB transaction is complete
      await new Promise(resolve => setTimeout(resolve, 200));
      await loadData();
      onRefresh?.();
    } catch (error) {
      toast.error('Failed to save template');
      console.error('Error saving template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsSubmitting(true);
      await recurringExpenseService.deactivateTemplate(id);
      toast.success('Template removed');
      setDeleteId(null);
      await loadData();
      onRefresh?.();
    } catch (error) {
      toast.error('Failed to delete template');
      console.error('Error deleting template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryName = (id: number) => {
    return categories.find(c => c.id === id)?.name || 'Unknown';
  };

  const getUserName = (id: number) => {
    return users.find(u => u.id === id)?.name || 'Unknown';
  };

  const getSplitLabel = (template: RecurringTemplate) => {
    if (template.split_type === '50/50') return '50/50';
    if (template.split_type === 'personal') return 'Solo';
    if (template.split_type === 'bill') return 'Partner';
    if (template.split_type === 'custom') {
      return `${template.split_ratio_user1}/${template.split_ratio_user2}`;
    }
    return template.split_type;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Recurring Bills</DialogTitle>
                <DialogDescription>
                  Manage your recurring expense templates. These will be automatically generated each month.
                </DialogDescription>
              </div>
              {templates.length > 0 && (
                <Button
                  onClick={() => setEditingForm({
                    description: '',
                    default_amount: 0,
                    category_id: categories[0]?.id || 1,
                    paid_by_user_id: users[0]?.id || 1,
                    split_type: '50/50'
                  })}
                  size="sm"
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              )}
            </div>
          </DialogHeader>

          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 mb-4">
                No recurring bills yet. Create one when you add an expense by checking "Save as recurring template".
              </p>
              <Button onClick={() => setEditingForm({
                description: '',
                default_amount: 0,
                category_id: categories[0]?.id || 1,
                paid_by_user_id: users[0]?.id || 1,
                split_type: '50/50'
              })}>
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {templates.map(template => (
                <Card key={template.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{template.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            {getCategoryName(template.category_id)}
                          </span>
                          <span>{formatCurrency(template.default_amount)}</span>
                          <span className="text-xs">•</span>
                          <span className="text-xs">{getUserName(template.paid_by_user_id)}</span>
                          <Badge variant="outline" className="text-xs">
                            {getSplitLabel(template)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(template)}
                          disabled={isSubmitting}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(template.id)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog open={editingForm !== null} onOpenChange={(open) => !open && setEditingForm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingForm?.id ? 'Edit' : 'New'} Recurring Bill</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                value={editingForm?.description || ''}
                onChange={(e) => setEditingForm(prev => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="e.g., Rent, Streaming subscription"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={editingForm?.default_amount || ''}
                  onChange={(e) => setEditingForm(prev => prev ? { ...prev, default_amount: parseFloat(e.target.value) } : null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={editingForm?.category_id.toString() || ''}
                onValueChange={(val: string) => setEditingForm(prev => prev ? { ...prev, category_id: parseInt(val) } : null)}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paidBy">Paid By</Label>
              <Select
                value={editingForm?.paid_by_user_id.toString() || ''}
                onValueChange={(val: string) => setEditingForm(prev => prev ? { ...prev, paid_by_user_id: parseInt(val) } : null)}
              >
                <SelectTrigger id="paidBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="splitType">Split Type</Label>
              <Select
                value={editingForm?.split_type || '50/50'}
                onValueChange={(val: any) => setEditingForm(prev => prev ? { ...prev, split_type: val } : null)}
              >
                <SelectTrigger id="splitType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50/50">50/50 split</SelectItem>
                  <SelectItem value="personal">You pay it all</SelectItem>
                  <SelectItem value="bill">Partner pays it all</SelectItem>
                  <SelectItem value="custom">Custom split</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editingForm?.split_type === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="ratio">Your Share (%)</Label>
                <Input
                  id="ratio"
                  type="number"
                  min="0"
                  max="100"
                  value={editingForm?.split_ratio_user1 || 50}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setEditingForm(prev => prev ? { ...prev, split_ratio_user1: val, split_ratio_user2: 100 - val } : null);
                  }}
                />
                <p className="text-sm text-gray-600">
                  Partner: {100 - (editingForm?.split_ratio_user1 || 50)}%
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingForm(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove template?</AlertDialogTitle>
            <AlertDialogDescription>
              This won't delete any expenses already created from this template, but future months won't auto-generate this bill.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
