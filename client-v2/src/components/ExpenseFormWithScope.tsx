import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, DollarSign, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { useScope } from '@/context/ScopeContext';
import type { Expense, Category } from '../types';

interface ExpenseFormWithScopeProps {
  onNavigate: (view: string) => void;
}

export const ExpenseFormWithScope: React.FC<ExpenseFormWithScopeProps> = ({
  onNavigate
}) => {
  const { currentScope, isPartnerConnected } = useScope();
  const [formData, setFormData] = useState<{
    amount: string;
    description: string;
    category_id: string;
    date: string;
    paid_by_user_id: string;
    split_type: '50/50' | 'custom' | 'personal' | 'bill';
    custom_split_ratio: string;
  }>({
    amount: '',
    description: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    paid_by_user_id: '',
    split_type: '50/50',
    custom_split_ratio: ''
  });

  const [categories] = useState<Category[]>([
    { id: 1, name: 'Housing', icon: '🏠' },
    { id: 2, name: 'Food', icon: '🍔' },
    { id: 3, name: 'Transportation', icon: '🚗' },
    { id: 4, name: 'Entertainment', icon: '🎮' },
    { id: 5, name: 'Utilities', icon: '💡' },
    { id: 6, name: 'Shopping', icon: '🛍️' },
    { id: 7, name: 'Healthcare', icon: '🏥' },
    { id: 8, name: 'Savings', icon: '💰' },
    { id: 9, name: 'Other', icon: '📦' }
  ]);

  const [users] = useState([
    { id: 1, name: 'You' },
    { id: 2, name: 'Partner' }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.description || !formData.category_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Here you would integrate with your expense service
      // The scope will be used to determine how the expense is categorized
      console.log('Submitting expense for scope:', currentScope, formData);
      
      toast.success(`✨ Expense added to ${currentScope} budget successfully`);
      onNavigate('dashboard');
    } catch (error) {
      toast.error('Could not add expense. Please try again');
    }
  };

  const canSplitWithPartner = currentScope === 'ours' && isPartnerConnected;
  const availableSplitTypes = [
    { value: 'personal', label: 'Personal Expense', description: 'Paid by and belongs to one person' },
    { value: '50/50', label: 'Split 50/50', description: 'Divided equally between partners' },
    { value: 'custom', label: 'Custom Split', description: 'Specify custom split ratio' }
  ].filter(type => {
    if (type.value === '50/50' || type.value === 'custom') {
      return canSplitWithPartner;
    }
    return true;
  });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Add Expense to {currentScope === 'ours' ? 'Our' : currentScope === 'mine' ? 'My' : "Partner's"} Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Scope indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-blue-800">
                  This expense will be added to the <strong>{currentScope}</strong> budget
                </span>
              </div>
              {!canSplitWithPartner && currentScope === 'ours' && (
                <p className="text-xs text-blue-600 mt-1">
                  Partner splitting will be available once your partner connects
                </p>
              )}
            </div>

            {/* Basic expense info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="What was this expense for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value: string) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Split options */}
            <div className="space-y-4">
              <Label>Split Type</Label>
              <div className="space-y-3">
                {availableSplitTypes.map(type => (
                  <div key={type.value} className="flex items-start gap-3">
                    <input
                      type="radio"
                      id={type.value}
                      name="split_type"
                      value={type.value}
                      checked={formData.split_type === type.value}
                      onChange={(e) => setFormData({ ...formData, split_type: e.target.value as any })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={type.value} className="font-medium cursor-pointer">
                        {type.label}
                      </Label>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom split ratio */}
            {(formData.split_type === 'custom' || formData.split_type === '50/50') && (
              <div className="space-y-2">
                <Label htmlFor="custom_split">Custom Split Ratio (%)</Label>
                <Input
                  id="custom_split"
                  type="number"
                  min="1"
                  max="99"
                  placeholder="e.g., 70 for 70/30 split"
                  value={formData.custom_split_ratio}
                  onChange={(e) => setFormData({ ...formData, custom_split_ratio: e.target.value })}
                />
                <p className="text-xs text-gray-500">
                  Enter your percentage. The remainder will go to your partner.
                </p>
              </div>
            )}

            {/* Paid by selection */}
            {(currentScope === 'ours' || currentScope === 'partner') && (
              <div className="space-y-2">
                <Label htmlFor="paid_by">Paid By</Label>
                <Select 
                  value={formData.paid_by_user_id} 
                  onValueChange={(value: string) => setFormData({ ...formData, paid_by_user_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Who paid for this?" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{user.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Add Expense to {currentScope === 'ours' ? 'Our' : currentScope === 'mine' ? 'My' : "Partner's"} Budget
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onNavigate('dashboard')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseFormWithScope;
