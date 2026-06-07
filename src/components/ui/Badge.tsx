import { ComfortRisk, CheckInStatus, Availability, SensoryCondition } from '@/types';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-slate-100 text-slate-500',
  purple: 'bg-indigo-100 text-indigo-700',
};

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: ComfortRisk }) {
  const map: Record<ComfortRisk, { variant: BadgeProps['variant']; label: string }> = {
    Low: { variant: 'success', label: 'Low Risk' },
    Moderate: { variant: 'warning', label: 'Moderate Risk' },
    High: { variant: 'danger', label: 'High Risk' },
  };
  const { variant, label } = map[risk];
  return <Badge variant={variant}>{label}</Badge>;
}

export function StatusBadge({ status }: { status: CheckInStatus }) {
  const map: Record<CheckInStatus, { variant: BadgeProps['variant'] }> = {
    Pending: { variant: 'neutral' },
    Arrived: { variant: 'info' },
    'In Progress': { variant: 'purple' },
    Completed: { variant: 'success' },
    Cancelled: { variant: 'danger' },
  };
  const { variant } = map[status];
  return <Badge variant={variant}>{status}</Badge>;
}

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  const map: Record<Availability, BadgeProps['variant']> = {
    Available: 'success',
    Busy: 'warning',
    Off: 'neutral',
  };
  return <Badge variant={map[availability]}>{availability}</Badge>;
}

export function SensoryBadge({ condition }: { condition: SensoryCondition }) {
  const map: Record<SensoryCondition, BadgeProps['variant']> = {
    Good: 'success',
    Fair: 'warning',
    Cautious: 'danger',
  };
  return <Badge variant={map[condition]}>{condition}</Badge>;
}
