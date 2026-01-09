import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAddContributionProps {
  onSubmit: (amount: number) => void;
  isSubmitting?: boolean;
  className?: string;
}

export function QuickAddContribution({ 
  onSubmit, 
  isSubmitting = false,
  className 
}: QuickAddContributionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount && numAmount > 0) {
      onSubmit(numAmount);
      setAmount('');
      setIsOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setAmount('');
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-xl bg-[oklch(var(--theme-teal))] text-white shadow-md hover:bg-[oklch(var(--theme-teal)/0.9)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Plus className="h-5 w-5" />
          <span className="sr-only">Quick add contribution</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-amount">Amount (SEK)</Label>
            <Input
              id="quick-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Contribution'}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
