export interface RankableItem {
  title: string;
  pinned?: boolean;
  priority?: number;
  sortDate?: string;
  stars?: number;
}

function toTimestamp(value?: string): number {
  if (!value) return 0;

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function compareRankableItems(a: RankableItem, b: RankableItem): number {
  if (Boolean(a.pinned) !== Boolean(b.pinned)) {
    return a.pinned ? -1 : 1;
  }

  const priorityDiff = (b.priority || 0) - (a.priority || 0);
  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  const dateDiff = toTimestamp(b.sortDate) - toTimestamp(a.sortDate);
  if (dateDiff !== 0) {
    return dateDiff;
  }

  const starsDiff = (b.stars || 0) - (a.stars || 0);
  if (starsDiff !== 0) {
    return starsDiff;
  }

  return a.title.localeCompare(b.title);
}
