import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (st: string) => {
    switch (st.toUpperCase()) {
      case 'SUBMITTED':
        return { label: 'Submitted', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'UNDER_REVIEW':
        return { label: 'Under Review', bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
      case 'ASSIGNED':
        return { label: 'Assigned', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
      case 'AWAITING_INFO':
        return { label: 'Awaiting Info', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
      case 'RESOLVED':
      case 'RESTORED':
        return { label: 'Resolved', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'REOPENED':
        return { label: 'Reopened', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'CLOSED':
        return { label: 'Closed', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
      case 'INVESTIGATING':
        return { label: 'Investigating', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'REPAIRING':
        return { label: 'Repairing', bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20' };
      default:
        return { label: st.replace('_', ' '), bg: 'bg-slate-500/10 text-slate-300 border-slate-500/20' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {config.label}
    </span>
  );
};
