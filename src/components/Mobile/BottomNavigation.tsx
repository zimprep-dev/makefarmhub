import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, MessageSquare, User } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import './BottomNavigation.css';

export default function BottomNavigation() {
  const location = useLocation();
  const { notifications } = useAppData();
  
  const unreadMessages = notifications.filter(n => n.type === 'message' && !n.read).length;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/marketplace', icon: Search, label: 'Browse' },
    { path: '/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/messages', icon: MessageSquare, label: 'Messages', badge: unreadMessages },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  // Hide on certain pages
  const hiddenPaths = ['/login', '/signup', '/'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <nav className="bottom-navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <item.icon size={22} />
            {item.badge && item.badge > 0 && (
              <span className="nav-badge">{item.badge > 9 ? '9+' : item.badge}</span>
            )}
          </div>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
