import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Search, ShoppingBag, MessageSquare, User } from 'lucide-react';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Different nav items based on user role
  const getNavItems = () => {
    switch (user?.role) {
      case 'farmer':
        return [
          { path: '/dashboard', icon: Home, label: 'Home' },
          { path: '/my-listings', icon: ShoppingBag, label: 'Listings' },
          { path: '/orders', icon: ShoppingBag, label: 'Orders' },
          { path: '/messages', icon: MessageSquare, label: 'Messages' },
          { path: '/profile', icon: User, label: 'Profile' },
        ];
      case 'buyer':
        return [
          { path: '/dashboard', icon: Home, label: 'Home' },
          { path: '/marketplace', icon: Search, label: 'Search' },
          { path: '/orders', icon: ShoppingBag, label: 'Orders' },
          { path: '/messages', icon: MessageSquare, label: 'Messages' },
          { path: '/profile', icon: User, label: 'Profile' },
        ];
      case 'transporter':
        return [
          { path: '/dashboard', icon: Home, label: 'Home' },
          { path: '/transport/booking', icon: ShoppingBag, label: 'Requests' },
          { path: '/transport/tracking', icon: ShoppingBag, label: 'Tracking' },
          { path: '/messages', icon: MessageSquare, label: 'Messages' },
          { path: '/profile', icon: User, label: 'Profile' },
        ];
      default:
        return [
          { path: '/dashboard', icon: Home, label: 'Home' },
          { path: '/marketplace', icon: Search, label: 'Search' },
          { path: '/orders', icon: ShoppingBag, label: 'Orders' },
          { path: '/messages', icon: MessageSquare, label: 'Messages' },
          { path: '/profile', icon: User, label: 'Profile' },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav__items">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`mobile-bottom-nav__item ${isActive(item.path) ? 'active' : ''}`}
          >
            <item.icon size={22} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
