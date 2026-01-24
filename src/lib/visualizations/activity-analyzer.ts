/**
 * Commit activity analysis for timeline visualizations
 */

import type { CommitData } from '../types';

export interface TimelineDataPoint {
  date: Date;
  count: number;
  commits: CommitData[];
}

export interface ActivityPattern {
  period: string;
  intensity: number;
  commits: number;
}

/**
 * Generate timeline data from commits
 */
export function generateTimelineData(commits: CommitData[]): TimelineDataPoint[] {
  // Group commits by day
  const commitsByDay = new Map<string, CommitData[]>();

  commits.forEach(commit => {
    const date = new Date(commit.date);
    const dayKey = date.toISOString().split('T')[0];

    if (!commitsByDay.has(dayKey)) {
      commitsByDay.set(dayKey, []);
    }
    commitsByDay.get(dayKey)!.push(commit);
  });

  // Convert to timeline data points
  const timeline: TimelineDataPoint[] = Array.from(commitsByDay.entries())
    .map(([dateStr, dayCommits]) => ({
      date: new Date(dateStr),
      count: dayCommits.length,
      commits: dayCommits,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return timeline;
}

/**
 * Identify active development periods
 */
export function identifyActivePeriods(commits: CommitData[]): ActivityPattern[] {
  if (commits.length === 0) return [];

  // Group commits by month
  const commitsByMonth = new Map<string, CommitData[]>();

  commits.forEach(commit => {
    const date = new Date(commit.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!commitsByMonth.has(monthKey)) {
      commitsByMonth.set(monthKey, []);
    }
    commitsByMonth.get(monthKey)!.push(commit);
  });

  // Calculate intensity (commits per week in that month)
  const patterns: ActivityPattern[] = Array.from(commitsByMonth.entries())
    .map(([monthKey, monthCommits]) => {
      const [year, month] = monthKey.split('-').map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      const weeksInMonth = daysInMonth / 7;
      const intensity = monthCommits.length / weeksInMonth;

      return {
        period: monthKey,
        intensity,
        commits: monthCommits.length,
      };
    })
    .sort((a, b) => b.intensity - a.intensity);

  return patterns;
}

/**
 * Analyze commit activity patterns
 */
export function analyzeCommitActivity(commits: CommitData[]) {
  if (commits.length === 0) {
    return {
      timeline: [],
      patterns: [],
      totalCommits: 0,
      averagePerDay: 0,
      mostActiveDay: null,
      dateRange: null,
    };
  }

  const timeline = generateTimelineData(commits);
  const patterns = identifyActivePeriods(commits);

  // Find most active day
  const mostActiveDay = timeline.reduce((max, point) =>
    point.count > max.count ? point : max
  , timeline[0]);

  // Calculate date range
  const dates = commits.map(c => new Date(c.date).getTime());
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const daysBetween = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);

  return {
    timeline,
    patterns,
    totalCommits: commits.length,
    averagePerDay: commits.length / Math.max(daysBetween, 1),
    mostActiveDay,
    dateRange: {
      start: minDate,
      end: maxDate,
      days: Math.ceil(daysBetween),
    },
  };
}

/**
 * Aggregate commits by week for smoother visualization
 */
export function aggregateByWeek(commits: CommitData[]): TimelineDataPoint[] {
  const commitsByWeek = new Map<string, CommitData[]>();

  commits.forEach(commit => {
    const date = new Date(commit.date);
    // Get Monday of the week
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    const weekKey = monday.toISOString().split('T')[0];

    if (!commitsByWeek.has(weekKey)) {
      commitsByWeek.set(weekKey, []);
    }
    commitsByWeek.get(weekKey)!.push(commit);
  });

  return Array.from(commitsByWeek.entries())
    .map(([dateStr, weekCommits]) => ({
      date: new Date(dateStr),
      count: weekCommits.length,
      commits: weekCommits,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Get commit distribution by author
 */
export function getAuthorDistribution(commits: CommitData[]) {
  const authorCommits = new Map<string, number>();

  commits.forEach(commit => {
    const count = authorCommits.get(commit.author) || 0;
    authorCommits.set(commit.author, count + 1);
  });

  return Array.from(authorCommits.entries())
    .map(([author, count]) => ({
      author,
      commits: count,
      percentage: (count / commits.length) * 100,
    }))
    .sort((a, b) => b.commits - a.commits);
}
