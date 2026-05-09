export class NotificationManager {
  private static hasPermission = false;

  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    }

    return false;
  }

  static async showNotification(
    title: string,
    options?: {
      body?: string;
      icon?: string;
      badge?: string;
      tag?: string;
      data?: any;
      requireInteraction?: boolean;
    }
  ): Promise<void> {
    if (!this.hasPermission && Notification.permission !== 'granted') {
      await this.requestPermission();
    }

    if (!this.hasPermission && Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: options?.icon || '/logo.png',
        badge: options?.badge || '/logo.png',
        body: options?.body,
        tag: options?.tag || 'bytechat-message',
        data: options?.data,
        requireInteraction: options?.requireInteraction || false,
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();

        if (options?.data?.contactId) {
          const event = new CustomEvent('notification-click', {
            detail: { contactId: options.data.contactId }
          });
          window.dispatchEvent(event);
        }
      };

      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIFWS57OmgUhELTqPn8bpnHAU2jdXvz3knBSl+zPLaizsKGGS56+qfUBEMS6Hk7rxrHwU1i9Ptzn0pBSh9y/HYjTwJFmK36Oykdh8EMon');
      audio.volume = 0.3;
      audio.play().catch(() => {});

      setTimeout(() => {
        notification.close();
      }, 5000);
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  static showMessageNotification(
    senderName: string,
    message: string,
    contactId: string
  ): void {
    const truncatedMessage = message.length > 100
      ? message.substring(0, 100) + '...'
      : message;

    this.showNotification(
      `New message from ${senderName}`,
      {
        body: truncatedMessage,
        tag: `message-${contactId}`,
        data: { contactId },
        requireInteraction: false
      }
    );
  }

  static isDocumentHidden(): boolean {
    return document.hidden || document.visibilityState === 'hidden';
  }

  static isSupported(): boolean {
    return 'Notification' in window;
  }

  static getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }
}
