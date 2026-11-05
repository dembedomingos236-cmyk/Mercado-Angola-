import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import {
  AdminNotification,
  AdminNotificationChannelsConfig,
  NotificationCategory,
  NotificationPriority,
} from '../types';

const NOTIFICATIONS_PATH = 'adminNotifications';
const PREFERENCES_DOC_PATH = 'notificationSettings/admin_channels';

export const DEFAULT_CHANNEL_PREFERENCES: AdminNotificationChannelsConfig = {
  inApp: {
    sales: true,
    applications: true,
    payments: true,
    security: true,
    financial: true,
    soundEnabled: true,
  },
  push: {
    enabled: false,
    sales: true,
    applications: true,
    payments: true,
    security: true,
    financial: true,
  },
  email: {
    enabled: true,
    recipientEmail: 'dembedomingos236@gmail.com',
    sales: true,
    applications: true,
    payments: true,
    security: true,
    financial: true,
    dailyDigest: true,
  },
};

// Web Audio synthesizer for alert chimes without external assets
const playWebAudioChime = (priority: NotificationPriority) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (priority === 'critico') {
      // 3 short urgent beeps
      [0, 0.15, 0.3].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.13);
      });
    } else {
      // Pleasant 2-note upward chime (E5 -> G#5)
      const notes = [659.25, 830.61];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.26);
      });
    }
  } catch (e) {
    // Audio autoplay or permissions policy may prevent sound; fail quietly
  }
};

export const notificationService = {
  /**
   * Dispatches push notification if browser permissions allow
   */
  async triggerBrowserPush(title: string, body: string, category: string) {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`Mercado Angola [${category.toUpperCase()}] - ${title}`, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `mercado_angola_${Date.now()}`,
          });
        }
      }
    } catch (e) {
      console.warn('Erro ao disparar notificação push no navegador:', e);
    }
  },

  /**
   * Request push notification permission in browser/mobile
   */
  async requestPushPermission(): Promise<NotificationPermission> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        return perm;
      } catch (err) {
        console.warn('Erro ao solicitar permissões de notificação:', err);
        return 'denied';
      }
    }
    return 'denied';
  },

  /**
   * Creates a real-time notification with idempotency prevention
   */
  async createNotification(
    params: Omit<AdminNotification, 'notificationId' | 'createdAt' | 'read'> & {
      idempotencyKey?: string;
    }
  ): Promise<AdminNotification> {
    const now = new Date().toISOString();
    const notificationId = 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // 1. Idempotency verification: prevent duplicate notifications
    if (params.idempotencyKey) {
      try {
        const q = query(
          collection(db, NOTIFICATIONS_PATH),
          where('idempotencyKey', '==', params.idempotencyKey),
          limit(1)
        );
        const existingSnap = await getDocs(q);
        if (!existingSnap.empty) {
          return existingSnap.docs[0].data() as AdminNotification;
        }
      } catch (e) {
        console.warn('Verificação de idempotência ignorada por modo local:', e);
      }
    }

    const newNotification: AdminNotification = {
      notificationId,
      category: params.category,
      priority: params.priority,
      title: params.title,
      message: params.message,
      event: params.event,
      idempotencyKey: params.idempotencyKey,
      read: false,
      createdAt: now,
      metadata: params.metadata,
      actionType: params.actionType,
      actionUrl: params.actionUrl,
    };

    try {
      await setDoc(doc(db, NOTIFICATIONS_PATH, notificationId), newNotification);

      // Play alert chime
      playWebAudioChime(params.priority);

      // Attempt browser push
      this.triggerBrowserPush(params.title, params.message, params.category);

      return newNotification;
    } catch (err) {
      console.warn('Erro ao persistir notificação no Firestore (fallback em memória):', err);
      // Play sound even on local fallback
      playWebAudioChime(params.priority);
      return newNotification;
    }
  },

  /**
   * Fetch all notifications ordered by createdAt desc
   */
  async getNotifications(limitCount = 100): Promise<AdminNotification[]> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_PATH),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      const list: AdminNotification[] = [];
      snap.forEach((d) => list.push(d.data() as AdminNotification));
      return list;
    } catch (err) {
      // Fallback if index is building or unauthenticated
      try {
        const snap = await getDocs(collection(db, NOTIFICATIONS_PATH));
        const list: AdminNotification[] = [];
        snap.forEach((d) => list.push(d.data() as AdminNotification));
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (e) {
        return [];
      }
    }
  },

  /**
   * Subscribe to real-time notifications
   */
  subscribeNotifications(callback: (notifications: AdminNotification[]) => void): () => void {
    try {
      const q = query(collection(db, NOTIFICATIONS_PATH), limit(150));
      return onSnapshot(
        q,
        (snap) => {
          const list: AdminNotification[] = [];
          snap.forEach((d) => list.push(d.data() as AdminNotification));
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(list);
        },
        (error) => {
          console.warn('Aviso no listener de notificações em tempo real:', error);
        }
      );
    } catch (err) {
      return () => {};
    }
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, NOTIFICATIONS_PATH, notificationId), { read: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${NOTIFICATIONS_PATH}/${notificationId}`);
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      const snap = await getDocs(query(collection(db, NOTIFICATIONS_PATH), where('read', '==', false)));
      for (const d of snap.docs) {
        await updateDoc(doc(db, NOTIFICATIONS_PATH, d.id), { read: true });
      }
    } catch (err) {
      console.warn('Falha ao marcar todas como lidas:', err);
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, NOTIFICATIONS_PATH, notificationId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${NOTIFICATIONS_PATH}/${notificationId}`);
    }
  },

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, NOTIFICATIONS_PATH));
      for (const d of snap.docs) {
        await deleteDoc(doc(db, NOTIFICATIONS_PATH, d.id));
      }
    } catch (err) {
      console.warn('Falha ao limpar notificações:', err);
    }
  },

  /**
   * Notification Channels Preferences
   */
  async getChannelPreferences(): Promise<AdminNotificationChannelsConfig> {
    try {
      const snap = await getDoc(doc(db, 'notificationSettings', 'admin_channels'));
      if (snap.exists()) {
        return snap.data() as AdminNotificationChannelsConfig;
      }
      return DEFAULT_CHANNEL_PREFERENCES;
    } catch (err) {
      return DEFAULT_CHANNEL_PREFERENCES;
    }
  },

  async saveChannelPreferences(config: AdminNotificationChannelsConfig): Promise<void> {
    try {
      await setDoc(doc(db, 'notificationSettings', 'admin_channels'), config);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, PREFERENCES_DOC_PATH);
    }
  },

  /**
   * Manually test playing sound
   */
  testChime(priority: NotificationPriority = 'normal') {
    playWebAudioChime(priority);
  },
};
