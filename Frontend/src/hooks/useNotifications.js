import { useState, useCallback } from 'react';

export function useNotifications() {
  const [notifications] = useState([]);
  const [loading] = useState(false);
  const [hasUnread] = useState(false);

  const markAllRead = useCallback(() => {}, []);
  const markOneRead = useCallback((id) => {}, []);
  const refresh = useCallback(() => {}, []);

  return { notifications, loading, hasUnread, markAllRead, markOneRead, refresh };
}
