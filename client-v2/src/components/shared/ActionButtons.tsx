import { ActionButtonsProps } from '../../types/budget';
import { Edit, Trash2 } from 'lucide-react';

export function ActionButtons({
  onEdit,
  onDelete,
  editLabel = 'Edit budget',
  deleteLabel = 'Delete budget',
  showEdit = true,
  showDelete = true,
  className = ''
}: ActionButtonsProps) {
  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {showEdit && onEdit && (
        <button
          onClick={onEdit}
          className="btn-ghost"
          aria-label={editLabel}
          title={editLabel}
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
      {showDelete && onDelete && (
        <button
          onClick={onDelete}
          className="btn-ghost"
          aria-label={deleteLabel}
          title={deleteLabel}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      )}
    </div>
  );
}
