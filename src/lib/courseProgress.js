/**
 * Course Progress & Score Calculation Utilities
 * Pure functions for deterministic progress tracking and score formatting.
 */

/**
 * Calculates progress percentage from completed lesson count and total lessons.
 * Safely handles edge cases like zero lessons, negative counts, or over-completion.
 * 
 * @param {number} totalLessons - Total number of lessons in the course
 * @param {number} completedCount - Number of lessons marked completed
 * @returns {number} Percentage between 0 and 100
 */
export function calculateCourseProgress(totalLessons, completedCount) {
  if (!totalLessons || typeof totalLessons !== 'number' || totalLessons <= 0) {
    return 0;
  }
  if (!completedCount || typeof completedCount !== 'number' || completedCount <= 0) {
    return 0;
  }

  const validCompleted = Math.min(completedCount, totalLessons);
  const percentage = Math.round((validCompleted / totalLessons) * 100);
  return Math.min(Math.max(percentage, 0), 100);
}

/**
 * Computes course completion metrics for a course's lessons against a set of completed lesson IDs.
 * Ensures that completed lessons from other courses are NEVER counted.
 * 
 * @param {Array<{id: string, course_id?: string}>} courseLessons - Lessons strictly belonging to this course
 * @param {Set<string>|Array<string>} completedLessonIds - Set or array of student's completed lesson IDs
 * @returns {{
 *   totalLessons: number,
 *   completedCount: number,
 *   progressPercent: number,
 *   isCompleted: boolean,
 *   isInProgress: boolean
 * }}
 */
export function computeCourseLessonStats(courseLessons = [], completedLessonIds = new Set()) {
  const lessons = Array.isArray(courseLessons) ? courseLessons : [];
  const completedSet = completedLessonIds instanceof Set
    ? completedLessonIds
    : new Set(Array.isArray(completedLessonIds) ? completedLessonIds : []);

  const totalLessons = lessons.length;
  if (totalLessons === 0) {
    return {
      totalLessons: 0,
      completedCount: 0,
      progressPercent: 0,
      isCompleted: false,
      isInProgress: false,
    };
  }

  // Count only lessons that exist in THIS course
  const completedCount = lessons.filter((lesson) => lesson && completedSet.has(lesson.id)).length;
  const progressPercent = calculateCourseProgress(totalLessons, completedCount);
  const isCompleted = completedCount === totalLessons && totalLessons > 0;
  const isInProgress = completedCount > 0 && !isCompleted;

  return {
    totalLessons,
    completedCount,
    progressPercent,
    isCompleted,
    isInProgress,
  };
}

/**
 * Formats quiz score percentage cleanly.
 * 
 * @param {number|string} score
 * @returns {string} Formatted score like "85%"
 */
export function formatScorePercentage(score) {
  const num = Number(score);
  if (Number.isNaN(num) || num === null || num === undefined) {
    return '0%';
  }
  return `${Math.round(Math.min(Math.max(num, 0), 100))}%`;
}
