import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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

interface ContributionFormData {
  amount: number;
  date: string;
  note: string;
}

interface AddContributionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContributionFormData) => void;
  goalName: string;
  isSubmitting?: boolean;
}

export function AddContributionForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  goalName,
  isSubmitting = false 
}: AddContributionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting: formIsSubmitting },
  } = useForm<ContributionFormData>({
    defaultValues: {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      note: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setValue('date', today);
      setValue('amount', 0);
      setValue('note', '');
    }
  }, [isOpen, setValue]);

  const validateDate = (value: string) => {
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      return 'Date cannot be in the future';
    }
    return true;
  };

  const handleFormSubmit = (data: ContributionFormData) => {
    onSubmit({
      ...data,
      amount: Number(data.amount),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Contribution to {goalName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (SEK) *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter amount"
              {...register('amount', {
                required: 'Amount is required',
                min: {
                  value: 0.01,
                  message: 'Amount must be greater than 0',
                },
                valueAsNumber: true,
              })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              {...register('date', {
                required: 'Date is required',
                validate: validateDate,
              })}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              placeholder="Add a note..."
              {...register('note')}
            />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={formIsSubmitting || isSubmitting}>
              {formIsSubmitting || isSubmitting ? 'Adding...' : 'Add Contribution'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
