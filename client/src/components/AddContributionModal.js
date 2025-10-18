import React from 'react';
import ContributionComposer from './ContributionComposer';
import { getGoalColorScheme } from '../utils/goalColorPalette';

const AddContributionModal = ({
  open,
  onClose,
  goal,
  onSuccess,
  capAmount = null,
  enforceCap = true
}) => {
  if (!open || !goal) {
    return null;
  }

  const colorIndex =
    typeof goal.color_index === 'number' && !Number.isNaN(goal.color_index)
      ? goal.color_index
      : typeof goal.colorIndex === 'number' && !Number.isNaN(goal.colorIndex)
      ? goal.colorIndex
      : 0;
  const accent = getGoalColorScheme(colorIndex);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 560 }}>
        <ContributionComposer
          goal={goal}
          onClose={onClose}
          onSuccess={onSuccess}
          capAmount={capAmount}
          enforceCap={enforceCap}
          layout="modal"
          accent={accent}
        />
      </div>
    </div>
  );
};

export default AddContributionModal;
