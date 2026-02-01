import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../styles/breadcrumbs.css';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export default function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {showHome && (
          <>
            <li className="breadcrumb-item">
              <Link to="/" className="breadcrumb-link">
                <Home size={16} />
                <span>Home</span>
              </Link>
            </li>
            {items.length > 0 && (
              <li className="breadcrumb-separator">
                <ChevronRight size={16} />
              </li>
            )}
          </>
        )}

        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {item.path && index < items.length - 1 ? (
              <>
                <Link to={item.path} className="breadcrumb-link">
                  {item.label}
                </Link>
                <span className="breadcrumb-separator">
                  <ChevronRight size={16} />
                </span>
              </>
            ) : (
              <span className="breadcrumb-current">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
