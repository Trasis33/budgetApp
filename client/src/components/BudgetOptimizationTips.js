import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OptimizationTipCard from './OptimizationTipCard';
import SpendingPatternsChart from './SpendingPatternsChart';

const BudgetOptimizationTips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOptimizationData();
  }, []);

  const loadOptimizationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tipsRes, analysisRes] = await Promise.all([
        axios.get('/api/optimization/tips'),
        axios.get('/api/optimization/analyze')
      ]);
      
      setTips(tipsRes.data);
      setAnalysis(analysisRes.data);
    } catch (error) {
      console.error('Error loading optimization data:', error);
      setError('Failed to load optimization data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      
      const analysisRes = await axios.get('/api/optimization/analyze');
      setAnalysis(analysisRes.data);
      
      // Reload tips after analysis
      const tipsRes = await axios.get('/api/optimization/tips');
      setTips(tipsRes.data);
    } catch (error) {
      console.error('Error refreshing analysis:', error);
      setError('Failed to refresh analysis. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const dismissTip = async (tipId) => {
    try {
      await axios.post(`/api/optimization/tips/${tipId}/dismiss`);
      setTips(tips.filter(tip => tip.id !== tipId));
    } catch (error) {
      console.error('Error dismissing tip:', error);
      setError('Failed to dismiss tip. Please try again.');
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-gray-100 p-4 rounded-lg animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-8 text-gray-500">
      <div className="text-4xl mb-2">✨</div>
      <p className="text-lg font-medium mb-1">Great job! No optimization tips at the moment.</p>
      <p className="text-sm mb-4">Your budget is well-balanced.</p>
      <button
        onClick={refreshAnalysis}
        disabled={analyzing}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="budget-optimization">
        <div className="optimization-header mb-6">
          <h3 className="text-lg font-semibold">🎯 Budget Optimization Tips</h3>
          <p className="text-sm text-gray-600">AI-powered recommendations to improve your budget</p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="budget-optimization">
      <div className="optimization-header mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">🎯 Budget Optimization Tips</h3>
            <p className="text-sm text-gray-600">AI-powered recommendations to improve your budget</p>
          </div>
          <button
            onClick={refreshAnalysis}
            disabled={analyzing}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </span>
            ) : (
              'Refresh Analysis'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-500 mr-2">⚠️</div>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {tips.length > 0 ? (
          tips.map(tip => (
            <OptimizationTipCard
              key={tip.id}
              tip={tip}
              onDismiss={() => dismissTip(tip.id)}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>

      {analysis && analysis.patterns && Object.keys(analysis.patterns).length > 0 && (
        <div className="mt-8">
          <h4 className="text-md font-semibold mb-4">📊 Spending Patterns Analysis</h4>
          <SpendingPatternsChart patterns={analysis.patterns} />
        </div>
      )}
    </div>
  );
};

export default BudgetOptimizationTips;
