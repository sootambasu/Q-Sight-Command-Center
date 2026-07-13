import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  subValue,
  className = '' 
}) => {
  return (
    <div 
      className={`cc-metric-card ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-muted)',
        borderRadius: '6px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}
    >
      <div 
        className="metric-label"
        style={{
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {label}
      </div>
      <div 
        className="metric-value"
        style={{
          fontSize: '18px',
          fontWeight: '700',
          color: 'var(--text-bright)',
          fontFamily: 'var(--font-mono)'
        }}
      >
        {value}
      </div>
      {subValue && (
        <div 
          className="metric-subvalue"
          style={{
            fontSize: '11px',
            color: 'var(--text-disabled)',
            fontFamily: 'var(--font-mono)'
          }}
        >
          {subValue}
        </div>
      )}
    </div>
  );
};
