import React from 'react';

type BadgeVariant = 'safe' | 'danger' | 'warning' | 'asset' | 'aircraft' | 'satellite' | 'seismic' | 'camera' | 'muted' | 'default';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  pulsing?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  label, 
  variant = 'default', 
  pulsing = false,
  className = '' 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'safe':
        return { color: 'var(--color-safe)', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)' };
      case 'danger':
        return { color: 'var(--color-danger)', backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' };
      case 'warning':
        return { color: 'var(--color-warning)', backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' };
      case 'asset':
        return { color: 'var(--color-asset)', backgroundColor: 'rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.3)' };
      case 'aircraft':
        return { color: 'var(--color-aircraft)', backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' };
      case 'satellite':
        return { color: 'var(--color-satellite)', backgroundColor: 'rgba(168, 85, 247, 0.15)', borderColor: 'rgba(168, 85, 247, 0.3)' };
      case 'seismic':
        return { color: 'var(--color-seismic)', backgroundColor: 'rgba(249, 115, 22, 0.15)', borderColor: 'rgba(249, 115, 22, 0.3)' };
      case 'camera':
        return { color: 'var(--color-camera)', backgroundColor: 'rgba(234, 179, 8, 0.15)', borderColor: 'rgba(234, 179, 8, 0.3)' };
      case 'muted':
        return { color: 'var(--text-muted)', backgroundColor: 'rgba(100, 116, 139, 0.15)', borderColor: 'rgba(100, 116, 139, 0.3)' };
      default:
        return { color: 'var(--text-normal)', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' };
    }
  };

  const styles = getVariantStyles();

  return (
    <span 
      className={`cc-status-badge ${pulsing ? 'pulsing' : ''} ${className}`}
      style={{
        display: 'inline-block',
        padding: '2px 6px',
        borderRadius: '3px',
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        border: `1px solid ${styles.borderColor}`,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </span>
  );
};
