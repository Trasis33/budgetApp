import React, { useState } from 'react';
import SavingsRateTracker from '../components/SavingsRateTracker';
import SavingsGoalsManager from '../components/SavingsGoalsManager';

const Savings = () => {
  const [timePeriod, setTimePeriod] = useState('6months');

  return (
    <div className="dashboard-content">
      <div className="space-y-6">
        <section className="glass-card hover-lift">
          <div className="section-header">
            <div>
              <p className="section-pill">Shared savings center</p>
              <h1 className="section-title gradient-text">Stay aligned on our savings goals</h1>
              <p className="section-subtitle">
                Track how quickly we are building cushions, adjust contributions, and celebrate the wins that matter to both of us.
              </p>
            </div>
          </div>
        </section>

        <section className="glass-card">
          <div className="section-header">
            <h2 className="section-title">Time horizon</h2>
            <select
              value={timePeriod}
              onChange={(event) => setTimePeriod(event.target.value)}
              className="form-select w-auto"
            >
              <option value="3months">Last 3 months</option>
              <option value="6months">Last 6 months</option>
              <option value="1year">Last 12 months</option>
            </select>
          </div>
          <div className="mt-6">
            <SavingsRateTracker timePeriod={timePeriod} />
          </div>
        </section>

        <section className="glass-card">
          <div className="section-header">
            <h2 className="section-title">Savings goals</h2>
            <p className="section-subtitle">
              Create and update shared targets, then log contributions as you make progress.
            </p>
          </div>
          <div className="mt-6">
            <SavingsGoalsManager />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Savings;
