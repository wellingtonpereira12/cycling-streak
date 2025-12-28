/**
 * Calculates the current streak and status based on ride history.
 * 
 * Rules:
 * - Must ride at least once a day.
 * - Stick lasts up to 2 days without activity.
 * - On 3rd day without activity, streak is lost.
 * 
 * @param {Array<string>} rideDates - Array of ISO date strings (YYYY-MM-DD) or timestamps.
 * @returns {Object} { streak, riskLevel, lastRideDate, daysMissed }
 */

export const calculateStreak = (rideDates) => {
    if (!rideDates || rideDates.length === 0) {
        return { streak: 0, riskLevel: 'safe', lastRideDate: null, daysMissed: 0 };
    }

    // Sort dates descending
    const sortedDates = [...rideDates].sort((a, b) => new Date(b) - new Date(a));
    const uniqueDates = Array.from(new Set(sortedDates.map(d => new Date(d).toISOString().split('T')[0])));

    if (uniqueDates.length === 0) {
        return { streak: 0, riskLevel: 'safe', lastRideDate: null, daysMissed: 0 };
    }

    const today = new Date().toISOString().split('T')[0];
    const lastRideDate = uniqueDates[0];

    const diffTime = Math.abs(new Date(today) - new Date(lastRideDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // diffDays logic:
    // 0 = Ridden today
    // 1 = Ridden yesterday (0 days missed technically, just normally flows)
    // 2 = Ridden 2 days ago (1 day missed)
    // 3 = Ridden 3 days ago (2 days missed - CRITICAL)
    // >3 = Lost

    let daysMissed = diffDays > 0 ? diffDays : 0; // If ridden today, diff is 0. If yesterday, diff is 1 (0 missed active days).

    // Adjust 'daysMissed' to mean 'inactive days gap' generally perceived
    // If last ride yesterday (diff 1), we haven't missed a day yet relative to "maintaining".
    // Let's use internal logic:

    let currentStreak = 0;

    // Check if streak is broken
    if (diffDays > 3) {
        // Too many days missed. Streak reset.
        return { streak: 0, riskLevel: 'lost', lastRideDate, daysMissed: diffDays };
    }

    // Calculate streak count backwards
    // We assume the sequence must act as a chain.
    // Gap between ride[i] and ride[i+1] must be <= 3 days.

    currentStreak = 1; // Start with latest
    let currentRefDate = new Date(uniqueDates[0]);

    for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i]);
        const gapTime = Math.abs(currentRefDate - prevDate);
        const gapDays = Math.ceil(gapTime / (1000 * 60 * 60 * 24));

        if (gapDays <= 3) {
            currentStreak++;
            currentRefDate = prevDate;
        } else {
            break; // Chain broken previously
        }
    }

    let riskLevel = 'safe';
    // Risk logic based on TODAY
    if (diffDays === 3) {
        riskLevel = 'danger'; // 2 full days missed, today is the 3rd. MUST RIDE.
    } else if (diffDays === 2) {
        riskLevel = 'warning'; // 1 full day missed.
    }

    return { streak: currentStreak, riskLevel, lastRideDate, daysMissed: diffDays };
};

export const formatSafeDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};
