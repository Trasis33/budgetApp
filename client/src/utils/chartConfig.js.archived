// Modern Chart.js configuration for glass morphism design
export const modernChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      titleColor: '#1e293b',
      bodyColor: '#374151',
      borderColor: 'rgba(203, 213, 225, 0.3)',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      titleFont: {
        size: 13,
        weight: '600'
      },
      bodyFont: {
        size: 12
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false
      },
      ticks: {
        color: '#64748b',
        font: {
          size: 11,
          weight: '500'
        }
      }
    },
    y: {
      display: true,
      grid: {
        color: 'rgba(203, 213, 225, 0.2)',
        borderDash: [2, 4]
      },
      ticks: {
        color: '#64748b',
        font: {
          size: 11,
          weight: '500'
        }
      }
    }
  },
  elements: {
    point: {
      radius: 3,
      hoverRadius: 6,
      borderWidth: 2
    },
    line: {
      borderWidth: 3,
      tension: 0.4
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  }
};

export const createGradient = (ctx, color1, color2) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 160);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
};

export const modernColors = {
  primary: '#8b5cf6',
  secondary: '#06b6d4', 
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  gradients: {
    primary: 'rgba(139, 92, 246, 0.2)',
    primaryFade: 'rgba(139, 92, 246, 0.05)',
    secondary: 'rgba(6, 182, 212, 0.2)',
    secondaryFade: 'rgba(6, 182, 212, 0.05)',
    success: 'rgba(16, 185, 129, 0.2)',
    successFade: 'rgba(16, 185, 129, 0.05)'
  }
};
