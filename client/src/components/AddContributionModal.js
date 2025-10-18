import React from 'react';
import ContributionComposer from './ContributionComposer';

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
        />
      </div>
    </div>
  );
};

export default AddContributionModal;
