import { type ReactNode } from 'react';
import { 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  Bell, 
  Heart, 
  Truck,
  FileText,
  Search,
  AlertCircle
} from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'search' | 'error';
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  variant = 'default'
}: EmptyStateProps) {
  return (
    <div className={`empty-state empty-state-${variant}`}>
      <div className="empty-state-icon">
        {icon}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
}

export function NoListingsState({ onCreateListing }: { onCreateListing?: () => void }) {
  return (
    <EmptyState
      icon={<Package size={64} />}
      title="No listings yet"
      description="Start selling by creating your first listing"
      action={onCreateListing ? {
        label: 'Create Listing',
        onClick: onCreateListing
      } : undefined}
    />
  );
}

export function NoOrdersState() {
  return (
    <EmptyState
      icon={<ShoppingCart size={64} />}
      title="No orders yet"
      description="Your orders will appear here once you make a purchase"
    />
  );
}

export function NoMessagesState() {
  return (
    <EmptyState
      icon={<MessageSquare size={64} />}
      title="No messages"
      description="Start a conversation with buyers or sellers"
    />
  );
}

export function NoNotificationsState() {
  return (
    <EmptyState
      icon={<Bell size={64} />}
      title="No notifications"
      description="You're all caught up! Check back later for updates"
    />
  );
}

export function NoFavoritesState({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      icon={<Heart size={64} />}
      title="No favorites yet"
      description="Save items you like to easily find them later"
      action={onBrowse ? {
        label: 'Browse Marketplace',
        onClick: onBrowse
      } : undefined}
    />
  );
}

export function NoVehiclesState({ onAddVehicle }: { onAddVehicle?: () => void }) {
  return (
    <EmptyState
      icon={<Truck size={64} />}
      title="No vehicles registered"
      description="Add your transport vehicles to start accepting bookings"
      action={onAddVehicle ? {
        label: 'Add Vehicle',
        onClick: onAddVehicle
      } : undefined}
    />
  );
}

export function NoResultsState({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <EmptyState
      icon={<Search size={64} />}
      title="No results found"
      description="Try adjusting your filters or search terms"
      action={onClearFilters ? {
        label: 'Clear Filters',
        onClick: onClearFilters
      } : undefined}
      variant="search"
    />
  );
}

export function ErrorState({ 
  message = "Something went wrong",
  onRetry 
}: { 
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={<AlertCircle size={64} />}
      title="Error"
      description={message}
      action={onRetry ? {
        label: 'Try Again',
        onClick: onRetry
      } : undefined}
      variant="error"
    />
  );
}

export function NoDataState({ 
  icon = <FileText size={64} />,
  title = "No data available",
  description
}: {
  icon?: ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
    />
  );
}
