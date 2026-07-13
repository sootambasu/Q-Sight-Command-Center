import React from 'react';
import { IconInfo } from './icons';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon = <IconInfo style={{ width: '32px', height: '32px', opacity: 0.5 }} />,
  className = '',
  action
}) => {
  return (
    <div 
      className={`cc-empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        textAlign: 'center',
        height: '100%',
        color: 'var(--text-muted)'
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        {icon}
      </div>
      <h3 style={{ 
        color: 'var(--text-normal)', 
        fontSize: '14px', 
        fontWeight: '600',
        marginBottom: '8px'
      }}>
        {title}
      </h3>
      <p style={{ 
        fontSize: '12px', 
        maxWidth: '250px',
        lineHeight: '1.5',
        marginBottom: action ? '20px' : '0'
      }}>
        {description}
      </p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};
