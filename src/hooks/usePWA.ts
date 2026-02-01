/**
 * usePWA Hook - React hooks for PWA functionality
 */

import { useState, useEffect } from 'react';
import { pwaService, pushNotificationService } from '../services/pwa';

/**
 * Hook for PWA install prompt
 */
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setCanInstall(pwaService.canInstall());
    setIsInstalled(pwaService.isAppInstalled());

    // Check periodically for install prompt
    const interval = setInterval(() => {
      setCanInstall(pwaService.canInstall());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const install = async () => {
    const accepted = await pwaService.showInstallPrompt();
    if (accepted) {
      setIsInstalled(true);
      setCanInstall(false);
    }
    return accepted;
  };

  return {
    canInstall,
    isInstalled,
    install,
  };
}

/**
 * Hook for online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const cleanup = pwaService.setupNetworkListeners(
      () => setIsOnline(true),
      () => setIsOnline(false)
    );

    return cleanup;
  }, []);

  return isOnline;
}

/**
 * Hook for push notifications
 */
export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(pushNotificationService.isSupported());
    setPermission(pushNotificationService.getPermissionStatus());
    setIsSubscribed(pushNotificationService.isSubscribed());
  }, []);

  const subscribe = async () => {
    const subscription = await pushNotificationService.subscribe();
    setIsSubscribed(subscription !== null);
    setPermission(pushNotificationService.getPermissionStatus());
    return subscription !== null;
  };

  const unsubscribe = async () => {
    const success = await pushNotificationService.unsubscribe();
    if (success) {
      setIsSubscribed(false);
    }
    return success;
  };

  const sendTest = async () => {
    await pushNotificationService.sendTestNotification();
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
    sendTest,
  };
}

/**
 * Hook for Web Share API
 */
export function useWebShare() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('share' in navigator);
  }, []);

  const share = async (data: { title?: string; text?: string; url?: string }) => {
    return await pwaService.share(data);
  };

  return {
    isSupported,
    share,
  };
}

export default usePWAInstall;
