import { describe, it, expect } from 'vitest';
import {
  calculateCourseProgress,
  computeCourseLessonStats,
  formatScorePercentage,
} from '../../lib/courseProgress.js';

describe('calculateCourseProgress Unit Tests', () => {
  it('returns 0% when 0 completed out of 4 lessons', () => {
    expect(calculateCourseProgress(4, 0)).toBe(0);
  });

  it('returns 50% when 2 completed out of 4 lessons', () => {
    expect(calculateCourseProgress(4, 2)).toBe(50);
  });

  it('returns 100% when 4 completed out of 4 lessons', () => {
    expect(calculateCourseProgress(4, 4)).toBe(100);
  });

  it('returns 33% when 1 completed out of 3 lessons (rounds sensibly)', () => {
    expect(calculateCourseProgress(3, 1)).toBe(33);
  });

  it('returns 67% when 2 completed out of 3 lessons', () => {
    expect(calculateCourseProgress(3, 2)).toBe(67);
  });

  it('returns 0 when totalLessons is 0 (does NOT produce NaN or Infinity)', () => {
    const result = calculateCourseProgress(0, 0);
    expect(result).toBe(0);
    expect(Number.isNaN(result)).toBe(false);
    expect(Number.isFinite(result)).toBe(true);
  });

  it('safely handles null, undefined, negative numbers, or invalid inputs', () => {
    expect(calculateCourseProgress(null, 2)).toBe(0);
    expect(calculateCourseProgress(undefined, 2)).toBe(0);
    expect(calculateCourseProgress(4, -1)).toBe(0);
    expect(calculateCourseProgress(-5, 2)).toBe(0);
    expect(calculateCourseProgress('invalid', 'input')).toBe(0);
  });

  it('caps at 100% even if completedCount exceeds totalLessons', () => {
    expect(calculateCourseProgress(5, 7)).toBe(100);
  });
});

describe('computeCourseLessonStats Unit Tests', () => {
  const courseALessons = [
    { id: 'lesson-a-1', course_id: 'course-A' },
    { id: 'lesson-a-2', course_id: 'course-A' },
    { id: 'lesson-a-3', course_id: 'course-A' },
    { id: 'lesson-a-4', course_id: 'course-A' },
  ];

  it('accurately computes 0% progress when no lessons are completed', () => {
    const completedSet = new Set();
    const stats = computeCourseLessonStats(courseALessons, completedSet);

    expect(stats.totalLessons).toBe(4);
    expect(stats.completedCount).toBe(0);
    expect(stats.progressPercent).toBe(0);
    expect(stats.isCompleted).toBe(false);
    expect(stats.isInProgress).toBe(false);
  });

  it('accurately computes in-progress state (50%) when 2 of 4 lessons completed', () => {
    const completedSet = new Set(['lesson-a-1', 'lesson-a-3']);
    const stats = computeCourseLessonStats(courseALessons, completedSet);

    expect(stats.totalLessons).toBe(4);
    expect(stats.completedCount).toBe(2);
    expect(stats.progressPercent).toBe(50);
    expect(stats.isCompleted).toBe(false);
    expect(stats.isInProgress).toBe(true);
  });

  it('accurately computes completed state (100%) when all 4 lessons completed', () => {
    const completedSet = new Set([
      'lesson-a-1',
      'lesson-a-2',
      'lesson-a-3',
      'lesson-a-4',
    ]);
    const stats = computeCourseLessonStats(courseALessons, completedSet);

    expect(stats.totalLessons).toBe(4);
    expect(stats.completedCount).toBe(4);
    expect(stats.progressPercent).toBe(100);
    expect(stats.isCompleted).toBe(true);
    expect(stats.isInProgress).toBe(false);
  });

  it('CRITICAL: Never counts completed lessons belonging to another course', () => {
    // Student completed 2 lessons from course B and only 1 lesson from course A
    const completedSet = new Set([
      'lesson-b-1',
      'lesson-b-2',
      'lesson-b-3',
      'lesson-a-1',
    ]);

    const stats = computeCourseLessonStats(courseALessons, completedSet);

    // Only lesson-a-1 belongs to Course A!
    expect(stats.totalLessons).toBe(4);
    expect(stats.completedCount).toBe(1);
    expect(stats.progressPercent).toBe(25);
    expect(stats.isCompleted).toBe(false);
    expect(stats.isInProgress).toBe(true);
  });

  it('handles empty lessons array without errors', () => {
    const stats = computeCourseLessonStats([], new Set(['some-id']));
    expect(stats.totalLessons).toBe(0);
    expect(stats.completedCount).toBe(0);
    expect(stats.progressPercent).toBe(0);
    expect(stats.isCompleted).toBe(false);
    expect(stats.isInProgress).toBe(false);
  });
});

describe('formatScorePercentage Unit Tests', () => {
  it('formats numeric scores to whole percentage strings', () => {
    expect(formatScorePercentage(100)).toBe('100%');
    expect(formatScorePercentage(85.4)).toBe('85%');
    expect(formatScorePercentage('90')).toBe('90%');
    expect(formatScorePercentage(0)).toBe('0%');
  });

  it('handles invalid or missing score inputs safely', () => {
    expect(formatScorePercentage(null)).toBe('0%');
    expect(formatScorePercentage(undefined)).toBe('0%');
    expect(formatScorePercentage('not-a-number')).toBe('0%');
  });
});
