import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useDate } from '@/context/DateContext';
import type { DateSelectorProps } from '@/types/date';
import { cn } from '@/lib/utils';

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const SHORT_MONTHS = [
  { value: '1', label: 'Jan' },
  { value: '2', label: 'Feb' },
  { value: '3', label: 'Mar' },
  { value: '4', label: 'Apr' },
  { value: '5', label: 'May' },
  { value: '6', label: 'Jun' },
  { value: '7', label: 'Jul' },
  { value: '8', label: 'Aug' },
  { value: '9', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
];

// Generate years from 2020 to current year + 1
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = 2020; year <= currentYear + 1; year++) {
    years.push({ value: year.toString(), label: year.toString() });
  }
  return years;
};

const YEARS = generateYears();

export function DateSelector({
  className,
  disabled = false,
  showNavigationArrows = true,
  showCurrentMonthButton = true,
  variant = 'default',
  size = 'md',
}: DateSelectorProps) {
  const {
    selectedMonth,
    selectedYear,
    setMonth,
    setYear,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    isCurrentMonth,
    formattedDate,
  } = useDate();

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base',
  };

  const buttonSizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {showNavigationArrows && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            disabled={disabled}
            className={buttonSizeClasses[size]}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <span className={cn('font-medium min-w-[140px] text-center', sizeClasses[size])}>
          {formattedDate}
        </span>
        {showNavigationArrows && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            disabled={disabled}
            className={buttonSizeClasses[size]}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {showNavigationArrows && (
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            disabled={disabled}
            className={buttonSizeClasses[size]}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <Select
          value={selectedMonth.toString()}
          onValueChange={(value: string) => setMonth(parseInt(value))}
          disabled={disabled}
        >
          <SelectTrigger className={cn('w-[80px]', sizeClasses[size])}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SHORT_MONTHS.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedYear.toString()}
          onValueChange={(value: string) => setYear(parseInt(value))}
          disabled={disabled}
        >
          <SelectTrigger className={cn('w-[90px]', sizeClasses[size])}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((year) => (
              <SelectItem key={year.value} value={year.value}>
                {year.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showNavigationArrows && (
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            disabled={disabled}
            className={buttonSizeClasses[size]}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        {showCurrentMonthButton && !isCurrentMonth && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goToCurrentMonth}
            disabled={disabled}
            className="text-xs"
          >
            Today
          </Button>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showNavigationArrows && (
        <Button
          variant="outline"
          size="icon"
          onClick={goToPreviousMonth}
          disabled={disabled}
          className={buttonSizeClasses[size]}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <Select
          value={selectedMonth.toString()}
          onValueChange={(value: string) => setMonth(parseInt(value))}
          disabled={disabled}
        >
          <SelectTrigger className={cn('w-[130px]', sizeClasses[size])}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedYear.toString()}
          onValueChange={(value: string) => setYear(parseInt(value))}
          disabled={disabled}
        >
          <SelectTrigger className={cn('w-[90px]', sizeClasses[size])}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((year) => (
              <SelectItem key={year.value} value={year.value}>
                {year.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {showNavigationArrows && (
        <Button
          variant="outline"
          size="icon"
          onClick={goToNextMonth}
          disabled={disabled}
          className={buttonSizeClasses[size]}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
      {showCurrentMonthButton && !isCurrentMonth && (
        <Button
          variant="outline"
          size="sm"
          onClick={goToCurrentMonth}
          disabled={disabled}
          className="ml-2"
        >
          <CalendarDays className="h-4 w-4 mr-1" />
          Current Month
        </Button>
      )}
    </div>
  );
}

export default DateSelector;
