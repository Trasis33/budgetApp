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
import { expenseService } from '../api/services/expenseService';
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
        toast.error('Failed to load form data');
      }
    };

    loadData();
  }, []);

  const currentUser = users.find(u => u.id === user?.id);
  const partnerUser = users.find(u => u.id !== user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await expenseService.createExpense({
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

      toast.success('Expense added successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add expense');
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
          <CardTitle>Add New Expense</CardTitle>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="splitType">Split Type</Label>
              <Select
                value={formData.split_type}
                onValueChange={(value: any) => setFormData({ ...formData, split_type: value })}
              >
                <SelectTrigger id="splitType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50/50">Equal (50/50)</SelectItem>
                  <SelectItem value="custom">Custom Split</SelectItem>
                  <SelectItem value="personal">Personal (No Split)</SelectItem>
                  <SelectItem value="bill">Bill</SelectItem>
                </SelectContent>
              </Select>
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
    </div>
  );
}
