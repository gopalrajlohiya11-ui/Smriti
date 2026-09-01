function calculateNextDifficulty(lastThreeScores) {
  if (!lastThreeScores || lastThreeScores.length === 0) return 'medium';

  const average = lastThreeScores.reduce((sum, s) => sum + s, 0) / lastThreeScores.length;

  if (average < 50) return 'easy';
  if (average > 80) return 'hard';
  return 'medium';
}

module.exports = { calculateNextDifficulty };