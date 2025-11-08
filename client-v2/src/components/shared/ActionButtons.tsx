import { Button } from '../ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  size?: 'sm' | 'default' | 'lg';
  showLabels?: boolean;
}

export function ActionButtons({
  onEdit,
  onDelete,
  size = 'sm',
  showLabels = false
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {onEdit && (
        <Button
          variant="ghost"
          size={size}
          onClick={onEdit}
          className="hover:bg-blue-50 hover:text-blue-600"
        >
          <Pencil className="h-4 w-4" />
          {showLabels && <span className="ml-2">Edit</span>}
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size={size}
          onClick={onDelete}
          className="hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
          {showLabels && <span className="ml-2">Delete</span>}
        </Button>
      )}
    </div>
  );
}
