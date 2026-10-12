export interface EscalationStatus {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  SLAHours: number;
  deadlineDate: Date;
  isOverdue: boolean;
  hoursElapsed: number;
  hoursRemainingOrOverdue: number;
  slaFormatted: string;
}

export function evaluateEscalation(complaint: {
  createdAt: Date | string;
  status: string;
  isEmergency?: boolean;
  affectedCount?: number;
  categorySLAHours?: number;
}): EscalationStatus {
  const createdAt = new Date(complaint.createdAt);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - createdAt.getTime());
  const hoursElapsed = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(1));

  const SLAHours = complaint.categorySLAHours || 24;
  const deadlineDate = new Date(createdAt.getTime() + SLAHours * 60 * 60 * 1000);

  const isResolvedOrClosed = ['RESOLVED', 'CLOSED'].includes(complaint.status.toUpperCase());
  const isOverdue = !isResolvedOrClosed && now > deadlineDate;

  const hoursDiff = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const hoursRemainingOrOverdue = parseFloat(Math.abs(hoursDiff).toFixed(1));

  let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';

  if (complaint.isEmergency) {
    priority = 'URGENT';
  } else if ((complaint.affectedCount || 1) >= 50 || hoursElapsed > SLAHours) {
    priority = 'HIGH';
  } else if ((complaint.affectedCount || 1) >= 10 || hoursElapsed > SLAHours / 2) {
    priority = 'MEDIUM';
  } else {
    priority = 'LOW';
  }

  let slaFormatted = '';
  if (isResolvedOrClosed) {
    slaFormatted = 'Completed within SLA';
  } else if (isOverdue) {
    slaFormatted = `OVERDUE by ${hoursRemainingOrOverdue} hrs (SLA: ${SLAHours}h)`;
  } else {
    slaFormatted = `${hoursRemainingOrOverdue} hrs remaining (SLA: ${SLAHours}h)`;
  }

  return {
    priority,
    SLAHours,
    deadlineDate,
    isOverdue,
    hoursElapsed,
    hoursRemainingOrOverdue,
    slaFormatted,
  };
}
