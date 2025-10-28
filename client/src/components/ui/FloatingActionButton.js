import React from 'react';
import { Plus, Camera, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const isMobile = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches;

const FloatingActionButton = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  if (!isMobile()) return null;

  const handlePrimary = () => {
    navigate('/add');
  };

  return (
    <div className="fab-container" aria-hidden={!isMobile()}>
      {/* Secondary actions */}
      <div className={['fab-actions', open ? 'fab-actions-open' : ''].join(' ')} aria-hidden={!open}>
        <button
          className="fab-secondary"
          aria-label="Scan receipt"
          onClick={() => navigate('/add?mode=scan')}
        >
          <Camera className="fab-icon" aria-hidden="true" />
        </button>
        <button
          className="fab-secondary"
          aria-label="Voice input"
          onClick={() => navigate('/add?mode=voice')}
        >
          <Mic className="fab-icon" aria-hidden="true" />
        </button>
      </div>

      {/* Main FAB */}
      <button
        className={['fab', open ? 'fab-open' : ''].join(' ')}
        aria-label={open ? 'Close quick actions' : 'Add expense'}
        aria-expanded={open}
        onClick={() => (open ? handlePrimary() : setOpen(true))}
        onBlur={() => setOpen(false)}
      >
        <Plus className="fab-icon" aria-hidden="true" />
      </button>
    </div>
  );
};

export default FloatingActionButton;