import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SavingsGoal } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GoalFormData {
  name: string;
  target_amount: number;
  target_date: string;
  category_name: string;
}

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GoalFormData) => void;
  goal?: SavingsGoal;
}

export function GoalFormModal({ isOpen, onClose, onSubmit, goal }: GoalFormModalProps) {
  const isEdit = !!goal;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    defaultValues: {
      name: '',
      target_amount: 0,
      target_date: '',
      category_name: '',
    },
  });

  // Reset form when modal opens or goal changes
  useEffect(() => {
    if (isOpen) {
      if (goal) {
        reset({
          name: goal.name,
          target_amount: goal.target_amount,
          target_date: goal.target_date || '',
          category_name: goal.category_name || '',
        });
      } else {
        reset({
          name: '',
          target_amount: 0,
          target_date: '',
          category_name: '',
        });
      }
    }
  }, [isOpen, goal, reset]);

  const onFormSubmit = (data: GoalFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Savings Goal' : 'Create Savings Goal'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              placeholder="e.g., Summer Vacation"
              {...register('name', { required: 'Goal name is required' })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_amount">Target Amount (SEK)</Label>
            <Input
              id="target_amount"
              type="number"
              placeholder="0"
              {...register('target_amount', {
                required: 'Target amount is required',
                min: { value: 1, message: 'Amount must be greater than 0' },
                valueAsNumber: true,
              })}
            />
            {errors.target_amount && (
              <p className="text-sm text-destructive">{errors.target_amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_date">Target Date</Label>
            <Input
              id="target_date"
              type="date"
              {...register('target_date', { 
                required: 'Target date is required',
                validate: (value) => {
                  const today = new Date().toISOString().split('T')[0];
                  return value > today || 'Target date must be in the future';
                }
              })}
            />
            {errors.target_date && (
              <p className="text-sm text-destructive">{errors.target_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_name">Category (Optional)</Label>
            <Input
              id="category_name"
              placeholder="e.g., Travel, Tech, Emergency"
              {...register('category_name')}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Goal' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
