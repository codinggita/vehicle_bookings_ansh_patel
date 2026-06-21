import { useState, useCallback } from 'react';

const STORAGE_KEY = 'rideops_notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const getReadIds = () => {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
    catch { return new Set(); }
  };

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.map(n => n.id)));
      return updated;
    });
    setHasUnread(false);
  }, []);

  const markOneRead = useCallback((id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.filter(n => n.read).map(n => n.id)));
      const anyUnread = updated.some(n => !n.read);
      setHasUnread(anyUnread);
      return updated;
    });
  }, []);

  const refresh = useCallback(() => {}, []);

  return { notifications, loading, hasUnread, markAllRead, markOneRead, refresh };
}
