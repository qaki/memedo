import { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      {/* Icon */}
      {icon && <div className="mb-6 text-6xl opacity-50 animate-pulse-slow">{icon}</div>}

      {/* Content */}
      <div className="text-center max-w-md">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        {description && <p className="text-gray-600 mb-6">{description}</p>}
        {action && (
          <Button onClick={action.onClick} size="lg">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
};

// Pre-built empty states
export const NoDataEmptyState = ({ onAction }: { onAction?: () => void }) => (
  <EmptyState
    icon="📊"
    title="No data yet"
    description="Get started by analyzing your first token"
    action={onAction ? { label: 'Analyze Token', onClick: onAction } : undefined}
  />
);

export const NoResultsEmptyState = () => (
  <EmptyState
    icon="🔍"
    title="No results found"
    description="Try adjusting your search or filters"
  />
);

export const ErrorEmptyState = ({ onRetry }: { onRetry?: () => void }) => (
  <EmptyState
    icon="⚠️"
    title="Something went wrong"
    description="We couldn't load this data. Please try again."
    action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
  />
);
