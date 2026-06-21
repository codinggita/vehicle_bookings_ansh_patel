import { useState } from 'react';

export function useNotifications() {
  const [notifications] = useState([]);
  const [loading] = useState(false);
  const [hasUnread] = useState(false);

  return { notifications, loading, hasUnread };
}
