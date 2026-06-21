import { useState, useCallback, useEffect } from 'react';
import api from '../lib/api';

const STORAGE_KEY = 'rideops_notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);

  const getReadIds = () => {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
    catch { return new Set(); }
  };

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [total, success, cancelled, incomplete, dnf, topVehicle, topPayment] = await Promise.allSettled([
        api.get('/stats/total-bookings'),
        api.get('/stats/success-rides'),
        api.get('/stats/cancelled-rides'),
        api.get('/stats/incomplete-rides'),
        api.get('/stats/driver-not-found'),
        api.get('/stats/top-vehicle'),
        api.get('/stats/top-payment-method'),
      ]);

      const extract = (res) => {
        if (res.status !== 'fulfilled') return null;
        const d = res.value?.data ?? res.value;
        return d ?? null;
      };

      const stats = {
        totalBookings:    extract(total)?.totalBookings    ?? null,
        successRides:     extract(success)?.successRides   ?? null,
        cancelledRides:   extract(cancelled)?.cancelledRides ?? null,
        incompleteRides:  extract(incomplete)?.incompleteRides ?? null,
        driverNotFound:   extract(dnf)?.driverNotFound     ?? null,
        topVehicle:       extract(topVehicle)?.vehicleType ?? null,
        topPaymentMethod: extract(topPayment)?.paymentMethod ?? null,
      };

      // deriveNotifications will be added in the next step
      const derived = [{
        id: 'sync',
        type: 'info',
        title: 'Data sync completed',
        desc: `All ${stats.totalBookings || 0} bookings are synced.`,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }];
      const readIds = getReadIds();

      const withRead = derived.map(n => ({ ...n, read: readIds.has(n.id) }));
      setNotifications(withRead);
      setHasUnread(withRead.some(n => !n.read));
    } catch {
      const fallback = [{
        id: 'sync',
        type: 'info',
        title: 'System connected',
        desc: 'RideOps is live and monitoring fleet operations.',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        read: false,
      }];
      setNotifications(fallback);
      setHasUnread(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

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

  const refresh = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    fetch();
  }, [fetch]);

  return { notifications, loading, hasUnread, markAllRead, markOneRead, refresh };
}
