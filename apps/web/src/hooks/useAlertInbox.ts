import { useState, useEffect } from 'react';

export interface LocalAlert {
  id: string;
  timestamp: string;
  severity: 'info' | 'watch' | 'warning';
  sourceType: string;
  message: string;
  assetName?: string;
  sourceId?: string;
  viewed: boolean;
  source: 'realtime' | 'demo' | 'system';
}

export function useAlertInbox() {
  const [alerts, setAlerts] = useState<LocalAlert[]>([]);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qsight_alerts_inbox');
      if (stored) {
        setAlerts(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not load alerts from localStorage', e);
    }
  }, []);

  // Save to local storage when changed
  useEffect(() => {
    try {
      localStorage.setItem('qsight_alerts_inbox', JSON.stringify(alerts));
    } catch (e) {
      console.warn('Could not save alerts to localStorage', e);
    }
  }, [alerts]);

  const addAlert = (alert: Omit<LocalAlert, 'id' | 'viewed'>) => {
    const newAlert: LocalAlert = {
      ...alert,
      id: Math.random().toString(36).substring(2, 9),
      viewed: false
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 100)); // Keep last 100
  };

  const markViewed = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, viewed: true } : a));
  };

  const clearAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const clearAll = () => {
    setAlerts([]);
  };

  return {
    alerts,
    addAlert,
    markViewed,
    clearAlert,
    clearAll
  };
}
