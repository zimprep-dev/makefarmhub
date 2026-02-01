/**
 * EventEmitter - Simple pub/sub system for real-time events
 */

type EventCallback<T = unknown> = (data: T) => void;

interface EventSubscription {
  unsubscribe: () => void;
}

class EventEmitter {
  private events: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   */
  on<T>(event: string, callback: EventCallback<T>): EventSubscription {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback as EventCallback);

    return {
      unsubscribe: () => {
        this.off(event, callback);
      },
    };
  }

  /**
   * Subscribe to an event once
   */
  once<T>(event: string, callback: EventCallback<T>): EventSubscription {
    const wrapper: EventCallback<T> = (data) => {
      this.off(event, wrapper);
      callback(data);
    };
    return this.on(event, wrapper);
  }

  /**
   * Unsubscribe from an event
   */
  off<T>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback as EventCallback);
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Emit an event
   */
  emit<T>(event: string, data: T): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.size || 0;
  }
}

// Singleton instance
export const eventEmitter = new EventEmitter();

// Event types
export const EVENTS = {
  // Notifications
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_CLEAR: 'notification:clear',
  
  // Orders
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  
  // Messages
  MESSAGE_NEW: 'message:new',
  MESSAGE_READ: 'message:read',
  CONVERSATION_UPDATED: 'conversation:updated',
  
  // Listings
  LISTING_CREATED: 'listing:created',
  LISTING_UPDATED: 'listing:updated',
  LISTING_DELETED: 'listing:deleted',
  LISTING_VIEWED: 'listing:viewed',
  
  // Transport
  TRANSPORT_REQUEST: 'transport:request',
  TRANSPORT_ACCEPTED: 'transport:accepted',
  TRANSPORT_LOCATION_UPDATE: 'transport:location_update',
  
  // User
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  
  // System
  CONNECTION_STATUS: 'system:connection_status',
  SYNC_COMPLETE: 'system:sync_complete',
  ERROR: 'system:error',
} as const;

export type EventType = typeof EVENTS[keyof typeof EVENTS];

export default eventEmitter;
