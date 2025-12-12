export const MAX_GENERATIONS = 5;
const STORAGE_KEY = 'restyle_ai_usage';

export const getRemainingGenerations = (): number => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const used = stored ? parseInt(stored, 10) : 0;
  return Math.max(0, MAX_GENERATIONS - used);
};

export const incrementUsageCount = (): number => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const used = stored ? parseInt(stored, 10) : 0;
  const newUsed = used + 1;
  localStorage.setItem(STORAGE_KEY, newUsed.toString());
  return Math.max(0, MAX_GENERATIONS - newUsed);
};

export const hasRemainingGenerations = (): boolean => {
  return getRemainingGenerations() > 0;
};