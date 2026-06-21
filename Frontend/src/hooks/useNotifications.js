import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

const STORAGE_KEY = 'rideops_notifications';

/**
 * Derive meaningful fleet notifications from live backend stats.
 * Each notification has: id, title, desc, time, type ('warn'|'info'|'success'|'danger'), read
 */
function deriveNotifications(stats) {
  const notes = [];
  const now = new Date();
  const fmt = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const total = stats.totalBookings || 0;

  // --- Danger: High driver-not-found rate ---
  if (total > 0 && stats.driverNotFound != null) {
    const rate = (stats.driverNotFound / total) * 100;
    if (rate >= 10) {
      notes.push({
        id: 'dnf-high',
        type: 'danger',
        title: 'High driver-not-found rate',
        desc: `${stats.driverNotFound} bookings (${rate.toFixed(1)}%) ended with no driver. Fleet availability is critically low.`,
        time: fmt(now),
      });
    } else if (rate >= 5) {
      notes.push({
        id: 'dnf-warn',
        type: 'warn',
        title: 'Driver availability dropping',
        desc: `${stats.driverNotFound} bookings (${rate.toFixed(1)}%) have no driver assigned. Consider dispatching reserve fleet.`,
        time: fmt(now),
      });
    }
  }

  // --- Danger: High cancellation rate ---
  if (total > 0 && stats.cancelledRides != null) {
    const rate = (stats.cancelledRides / total) * 100;
    if (rate >= 20) {
      notes.push({
        id: 'cancel-high',
        type: 'danger',
        title: 'Critical cancellation rate',
        desc: `${rate.toFixed(1)}% of all bookings cancelled. Investigate customer and driver cancellations immediately.`,
        time: fmt(now),
      });
    } else if (rate >= 10) {
      notes.push({
        id: 'cancel-warn',
        type: 'warn',
        title: 'Elevated cancellation rate',
        desc: `${stats.cancelledRides} rides cancelled (${rate.toFixed(1)}%). Review root causes in the Intelligence module.`,
        time: fmt(now),
      });
    }
  }

  // --- Warn: High incomplete rides ---
  if (total > 0 && stats.incompleteRides != null) {
    const rate = (stats.incompleteRides / total) * 100;
    if (rate >= 15) {
      notes.push({
        id: 'incomplete-high',
        type: 'warn',
        title: 'Many incomplete rides',
        desc: `${stats.incompleteRides} rides (${rate.toFixed(1)}%) are incomplete. Check for service disruptions.`,
        time: fmt(now),
      });
    }
  }

  // --- Info: Top vehicle in fleet ---
  if (stats.topVehicle) {
    notes.push({
      id: 'top-vehicle',
      type: 'info',
      title: 'Top demand vehicle',
      desc: `"${stats.topVehicle}" is the most booked vehicle type in this period. Ensure adequate supply.`,
      time: fmt(now),
    });
  }

  // --- Info: Top payment method ---
  if (stats.topPaymentMethod) {
    notes.push({
      id: 'top-payment',
      type: 'info',
      title: 'Payment insight',
      desc: `"${stats.topPaymentMethod}" is the dominant payment method. Ensure payment gateway is stable.`,
      time: fmt(now),
    });
  }

  // --- Success: High success rate ---
  if (total > 0 && stats.successRides != null) {
    const rate = (stats.successRides / total) * 100;
    if (rate >= 75) {
      notes.push({
        id: 'success-high',
        type: 'success',
        title: 'Fleet performing well',
        desc: `${rate.toFixed(1)}% of ${total} bookings completed successfully. Operations are stable.`,
        time: fmt(now),
      });
    }
  }

  // --- Fallback: always have a system sync note ---
  notes.push({
    id: 'sync',
    type: 'info',
    title: 'Data sync completed',
    desc: `All ${total.toLocaleString()} booking records are up to date. Last synced at ${fmt(now)}.`,
    time: fmt(now),
  });

  return notes;
}

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

      const derived = deriveNotifications(stats);
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
