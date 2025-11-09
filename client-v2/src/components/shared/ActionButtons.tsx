import React from 'react';
import { Button } from '../ui/button';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { ActionButtonsProps } from '../../types/budget';
import styles from '../../styles/shared/buttons.module.css';

export function ActionButtons({
  onEdit,
  onDelete,
  isEditing = false,
  size = 'md',
}: ActionButtonsProps) {
  if (isEditing) {
    return (
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className={styles.iconOnly}
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className={styles.iconOnly}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className={size === 'sm' ? styles.actionButtonSm : ''}
      >
        <Edit2 className="w-4 h-4" />
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className={size === 'sm' ? styles.actionButtonSm : ''}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </Button>
    </div>
  );
}
