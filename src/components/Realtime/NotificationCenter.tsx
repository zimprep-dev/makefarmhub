import { useState } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  ShoppingBag, 
  MessageSquare, 
  DollarSign,
  AlertCircle,
  TrendingUp,
  Settings
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import './NotificationCenter.css';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppData();

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return ShoppingBag;
      case 'message': return MessageSquare;
      case 'payment': return DollarSign;
      case 'success': return Check;
      case 'warning': return AlertCircle;
      case 'price_alert': return TrendingUp;
      default: return Bell;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'order': return '#3b82f6';
      case 'message': return '#8b5cf6';
      case 'payment': return '#22c55e';
      case 'success': return '#22c55e';
      case 'warning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-center">
      <button 
        className="notification-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="notification-overlay" onClick={() => setIsOpen(false)} />
          <div className="notification-panel">
            <div className="panel-header">
              <h3>Notifications</h3>
              <div className="header-actions">
                {unreadCount > 0 && (
                  <button 
                    className="mark-all-btn"
                    onClick={() => markAllNotificationsRead()}
                  >
                    <CheckCheck size={16} />
                    Mark all read
                  </button>
                )}
                <button className="close-btn" onClick={() => setIsOpen(false)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="notification-list">
              {notifications.length > 0 ? (
                notifications.slice(0, 20).map((notification) => {
                  const Icon = getIcon(notification.type);
                  return (
                    <div 
                      key={notification.id}
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      <div 
                        className="notification-icon"
                        style={{ backgroundColor: `${getIconColor(notification.type)}20`, color: getIconColor(notification.type) }}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="notification-content">
                        <span className="notification-title">{notification.title}</span>
                        <span className="notification-message">{notification.message}</span>
                        <span className="notification-time">
                          {formatTime(notification.timestamp || notification.createdAt || new Date().toISOString())}
                        </span>
                      </div>
                      {!notification.read && <div className="unread-dot" />}
                    </div>
                  );
                })
              ) : (
                <div className="empty-notifications">
                  <Bell size={48} />
                  <p>No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
