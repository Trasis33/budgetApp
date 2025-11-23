import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Expense, Category, User } from '../types';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PartnerInviteModal } from './PartnerInviteModal';
import { expenseService } from '../api/services/expenseService';
import { recurringExpenseService } from '../api/services/recurringExpenseService';
import { categoryService } from '../api/services/categoryService';
import { authService } from '../api/services/authService';
import { toast } from 'sonner';

interface ExpenseFormProps {
  onCancel: () => void;
}

export function ExpenseForm({ onCancel }: ExpenseFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    category_id: 1,
    description: '',
    date: new Date().toISOString().split('T')[0],
    paid_by_user_id: user?.id || 0,
    split_type: '50/50' as '50/50' | 'custom' | 'personal' | 'bill',
    split_ratio_user1: 50,
    split_ratio_user2: 50
  });

  const [saveAsRecurring, setSaveAsRecurring] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, usersData] = await Promise.all([
          categoryService.getCategories(),
          authService.getUsers()
        ]);
        setCategories(categoriesData);
        setUsers(usersData);

        if (categoriesData.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: categoriesData[0].id }));
        }
      } catch (error) {
        toast.error('Having trouble loading categories. Try refreshing the page');
      }
    };

    loadData();
  }, []);

  const currentUser = users.find(u => u.id === user?.id);
  const partnerUser = users.find(u => u.id !== user?.id && u.hasPartner !== false);
  
  const hasPartner = currentUser?.hasPartner === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create the expense
      const expense = await expenseService.createExpense({
        amount: parseFloat(formData.amount),
        category_id: formData.category_id,
        description: formData.description,
        date: formData.date,
        paid_by_user_id: formData.paid_by_user_id,
        split_type: formData.split_type,
        ...(formData.split_type === 'custom' && { 
          split_ratio_user1: formData.split_ratio_user1,
          split_ratio_user2: formData.split_ratio_user2 
        })
      });

      // If "Save as recurring template" is checked, create the template
      if (saveAsRecurring) {
        try {
          await recurringExpenseService.createTemplate({
            description: formData.description,
            default_amount: parseFloat(formData.amount),
            category_id: formData.category_id,
            paid_by_user_id: formData.paid_by_user_id,
            split_type: formData.split_type,
            ...(formData.split_type === 'custom' && {
              split_ratio_user1: formData.split_ratio_user1,
              split_ratio_user2: formData.split_ratio_user2
            })
          });
          toast.success('✨ Expense tracked and saved as a recurring template! You can generate this bill automatically each month', {
            duration: 4000
          });
        } catch (templateErr) {
          // Expense was created successfully, but template creation failed
          toast.success('✨ Expense tracked, but we couldn\'t save it as a template. Try adding it to your recurring bills later', {
            duration: 4000
          });
          console.error('Template creation failed:', templateErr);
        }
      } else {
        toast.success('✨ Expense tracked! Check the dashboard to see how it affects your monthly totals', {
          duration: 4000
        });
      }

      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message;
      if (message?.includes('amount') || message?.includes('invalid')) {
        toast.error('Please check the amount – it needs to be greater than 0');
      } else if (message?.includes('required') || message?.includes('description')) {
        toast.error('Please tell us what this expense was for');
      } else if (message?.includes('network') || message?.includes('connection')) {
        toast.error('Connection issue. Your expense might not have saved. Try again?', {
          duration: 6000
        });
      } else {
        toast.error('Something went wrong adding your expense. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={onCancel} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💸 Add your expense
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            No judgments here – let's capture what happened
          </p>
          {hasPartner && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💕 <strong>Solo mode:</strong> Invite your partner to start tracking shared expenses together! 
                For now, you can still track personal expenses.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2 text-blue-700 border-blue-300 hover:bg-blue-100"
                onClick={() => setInviteModalOpen(true)}
              >
                Invite partner
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
                {/* Quick presets */}
                <div className="flex flex-wrap gap-2">
                  {[50, 100, 250, 500, 1000].map(amount => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                      className="text-xs h-7"
                    >
                      {amount} kr
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, category_id: parseInt(value) })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
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

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What was this expense for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paidBy">Paid By</Label>
              {hasPartner ? (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {currentUser?.name} (solo mode - you can invite your partner later)
                  </p>
                </div>
              ) : (
                <Select
                  value={formData.paid_by_user_id.toString()}
                  onValueChange={(value) => setFormData({ ...formData, paid_by_user_id: parseInt(value) })}
                >
                  <SelectTrigger id="paidBy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="splitType">How should we split this?</Label>
              <Select 
                value={formData.split_type} 
                onValueChange={(value: any) => setFormData({ 
                  ...formData, 
                  split_type: value,
                  // Reset custom ratios when changing split type
                  ...(value !== 'custom' && { split_ratio_user1: 50, split_ratio_user2: 50 })
                })}
              >
                <SelectTrigger id="splitType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50/50">50/50 split (easiest)</SelectItem>
                  <SelectItem value="personal">You pay it all</SelectItem>
                  <SelectItem value="bill">Partner pays it all</SelectItem>
                  <SelectItem value="custom">Custom split</SelectItem>
                </SelectContent>
              </Select>
              {/* Helper text */}
              <p className="text-xs text-gray-500">
                {formData.split_type === '50/50' && "Perfect for shared expenses like groceries"}
                {formData.split_type === 'personal' && "When you want to cover the full amount"}
                {formData.split_type === 'bill' && "When partner covers the full amount"}
                {formData.split_type === 'custom' && "You decide the exact percentages"}
              </p>
            </div>

            {formData.split_type === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="splitRatio">
                  {currentUser?.name}'s Share (%)
                </Label>
                <Input
                  id="splitRatio"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.split_ratio_user1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setFormData({ 
                      ...formData, 
                      split_ratio_user1: value,
                      split_ratio_user2: 100 - value
                    });
                  }}
                />
                <p className="text-muted-foreground">
                  {partnerUser?.name}: {formData.split_ratio_user2}%
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Switch
                id="saveAsRecurring"
                checked={saveAsRecurring}
                onCheckedChange={setSaveAsRecurring}
              />
              <div className="flex-1">
                <Label htmlFor="saveAsRecurring" className="cursor-pointer text-sm">
                  Save as recurring template
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  We'll use this amount, category, payer and split as your monthly bill template
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Adding...' : 'Add Expense'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Partner Invitation Modal */}
      <PartnerInviteModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => {
          // Refresh data to show updated partnership status
          window.location.reload();
        }}
      />
    </div>
  );
}
