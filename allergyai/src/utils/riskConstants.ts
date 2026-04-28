export const SEVERITY_WEIGHTS = {
    minimal: 1,
    low: 2,
    moderate: 3,
    high: 4,
    severe: 5
} as const;

export const RISKTHRES = {
    LOWMAX: 30,
    MODERATEMAX: 70,
    HIGHMIN: 71
} as const;

export const getRiskTier = (score: number): 'Low Risk' | 'Moderate Risk' | 'High Risk' => {
    if (score <= RISKTHRES.LOWMAX) return 'Low Risk';
    if (score <= RISKTHRES.MODERATEMAX) return 'Moderate Risk';
    return 'High Risk';
};

export const getAlertSeverity = (riskTier: string): 'minimal' | 'low' | 'moderate' | 'high' | 'severe' => {
    if (riskTier === 'High Risk') return 'high';
    if (riskTier === 'Moderate Risk') return 'moderate';
    return 'low';
};

export const getAlertSeverityFromScore = (score: number): 'minimal' | 'low' | 'moderate' | 'high' | 'severe' => {
    return getAlertSeverity(getRiskTier(score));
};