import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-slate-200 shadow-sm',
        padding && 'p-6',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={clsx('text-base font-semibold text-slate-800', className)}>
      {children}
    </h3>
  );
}

export function StatCard({
  label,
  value,
  sub,
  color = 'indigo',
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'red';
}) {
  const colors = {
    indigo: 'bg-indigo-50 border-indigo-100',
    emerald: 'bg-emerald-50 border-emerald-100',
    amber: 'bg-amber-50 border-amber-100',
    red: 'bg-red-50 border-red-100',
  };
  const textColors = {
    indigo: 'text-indigo-700',
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
    red: 'text-red-700',
  };

  return (
    <div className={clsx('rounded-xl border p-5', colors[color])}>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className={clsx('text-3xl font-bold mt-1', textColors[color])}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}
