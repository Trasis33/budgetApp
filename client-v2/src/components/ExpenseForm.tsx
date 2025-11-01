import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Expense, CATEGORIES, User } from '../types';
import { ArrowLeft } from 'lucide-react';

interface ExpenseFormProps {
  currentUser: User;
  partnerUser: User;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
}

export function ExpenseForm({ currentUser, partnerUser, onAddExpense, onCancel }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paidBy: currentUser.id,
    splitType: 'equal' as 'equal' | 'custom' | 'personal',
    splitRatio: 50,
    recurring: false,
    recurringDay: 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expense: Omit<Expense, 'id'> = {
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      paidBy: formData.paidBy,
      splitType: formData.splitType,
      ...(formData.splitType === 'custom' && { splitRatio: formData.splitRatio }),
      ...(formData.recurring && { 
        recurring: true, 
        recurringDay: formData.recurringDay 
      })
    };

    onAddExpense(expense);
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
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                value={formData.paidBy} 
                onValueChange={(value) => setFormData({ ...formData, paidBy: value })}
              >
                <SelectTrigger id="paidBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={currentUser.id}>{currentUser.name}</SelectItem>
                  <SelectItem value={partnerUser.id}>{partnerUser.name}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="splitType">Split Type</Label>
              <Select 
                value={formData.splitType} 
                onValueChange={(value: any) => setFormData({ ...formData, splitType: value })}
              >
                <SelectTrigger id="splitType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">Equal (50/50)</SelectItem>
                  <SelectItem value="custom">Custom Split</SelectItem>
                  <SelectItem value="personal">Personal (No Split)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.splitType === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="splitRatio">
                  {formData.paidBy === currentUser.id ? currentUser.name : partnerUser.name}'s Share (%)
                </Label>
                <Input
                  id="splitRatio"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.splitRatio}
                  onChange={(e) => setFormData({ ...formData, splitRatio: parseInt(e.target.value) })}
                />
                <p className="text-muted-foreground">
                  {formData.paidBy === currentUser.id ? partnerUser.name : currentUser.name}: {100 - formData.splitRatio}%
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={formData.recurring}
                onCheckedChange={(checked) => setFormData({ ...formData, recurring: checked })}
              />
              <Label htmlFor="recurring">Recurring expense</Label>
            </div>

            {formData.recurring && (
              <div className="space-y-2">
                <Label htmlFor="recurringDay">Recurring Day of Month</Label>
                <Input
                  id="recurringDay"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.recurringDay}
                  onChange={(e) => setFormData({ ...formData, recurringDay: parseInt(e.target.value) })}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Add Expense
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
