export interface OutageDurationInfo {
  elapsedMinutes: number;
  elapsedHours: number;
  formattedDuration: string;
  isOneHourOrMore: boolean;
  shouldPromptReport: boolean;
  officialReasonDisplay: string;
  restorationTimeDisplay: string;
}

export function calculateOutageDuration(
  startTime: Date | string,
  confirmedReason?: string | null,
  expectedRestoration?: Date | string | null
): OutageDurationInfo {
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - start.getTime());
  const elapsedMinutes = Math.floor(diffMs / (1000 * 60));
  const elapsedHours = parseFloat((elapsedMinutes / 60).toFixed(1));

  let formattedDuration = '';
  if (elapsedMinutes < 60) {
    formattedDuration = `${elapsedMinutes} min${elapsedMinutes === 1 ? '' : 's'}`;
  } else {
    const hours = Math.floor(elapsedMinutes / 60);
    const mins = elapsedMinutes % 60;
    formattedDuration = mins > 0 ? `${hours} hr${hours === 1 ? '' : 's'} ${mins} min${mins === 1 ? '' : 's'}` : `${hours} hour${hours === 1 ? '' : 's'}`;
  }

  const isOneHourOrMore = elapsedMinutes >= 60;
  const shouldPromptReport = isOneHourOrMore;

  const officialReasonDisplay = confirmedReason && confirmedReason.trim() !== ''
    ? confirmedReason
    : 'Official reason has not yet been provided.';

  let restorationTimeDisplay = 'Restoration time is not yet available.';
  if (expectedRestoration) {
    const restDate = new Date(expectedRestoration);
    if (!isNaN(restDate.getTime())) {
      const restDiffMs = restDate.getTime() - now.getTime();
      if (restDiffMs <= 0) {
        restorationTimeDisplay = `Expected restoration was around ${restDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Pending verification)`;
      } else {
        const restMins = Math.floor(restDiffMs / (1000 * 60));
        const restHours = Math.floor(restMins / 60);
        const remMins = restMins % 60;
        const timeStr = restHours > 0 ? `${restHours}h ${remMins}m` : `${remMins} mins`;
        restorationTimeDisplay = `Estimated in ~${timeStr} (${restDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
      }
    }
  }

  return {
    elapsedMinutes,
    elapsedHours,
    formattedDuration,
    isOneHourOrMore,
    shouldPromptReport,
    officialReasonDisplay,
    restorationTimeDisplay,
  };
}
