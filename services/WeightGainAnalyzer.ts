import AsyncStorage from '@react-native-async-storage/async-storage';

interface SurveyData {
    mainReason: string;
    biggestChallenge: string;
    eatingPattern: string;
    satietyLevel: string;
    currentWeight: string;
    goalWeight: string;
    timeline: string;
    activityLevel: string;
    problemFoods: string[];
}

interface WeightEntry {
    weight: number;
    date: string;
}

interface BehaviorPattern {
    type: 'eating_pattern' | 'activity_level' | 'challenge_area' | 'food_triggers';
    severity: 'low' | 'medium' | 'high';
    description: string;
    impact: string;
    recommendations: string[];
}

interface WeightGainAnalysis {
    primaryCauses: BehaviorPattern[];
    progressTrend: 'improving' | 'stable' | 'concerning';
    confidenceLevel: number;
    personalizedInsights: string[];
    actionPriority: string[];
}

class WeightGainAnalyzer {
    private static readonly STORAGE_KEY = 'weight_gain_analysis';
    private static readonly BEHAVIOR_TRACKING_KEY = 'behavior_tracking';

    static async analyzeWeightGainCauses(
        surveyData: SurveyData | null,
        weightHistory: WeightEntry[],
        goalCompletionRate: number,
        streakData: number,
        completedGoalsToday: number
    ): Promise<WeightGainAnalysis> {
        const behaviorPatterns = await this.identifyBehaviorPatterns(
            surveyData,
            weightHistory,
            goalCompletionRate,
            streakData
        );

        const progressTrend = this.analyzeProgressTrend(weightHistory, goalCompletionRate);
        const personalizedInsights = this.generatePersonalizedInsights(
            behaviorPatterns,
            surveyData,
            completedGoalsToday
        );

        const analysis: WeightGainAnalysis = {
            primaryCauses: behaviorPatterns,
            progressTrend,
            confidenceLevel: this.calculateConfidenceLevel(surveyData, weightHistory.length),
            personalizedInsights,
            actionPriority: this.prioritizeActions(behaviorPatterns, surveyData)
        };

        // Store analysis for future reference
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(analysis));
        
        return analysis;
    }

    private static async identifyBehaviorPatterns(
        surveyData: SurveyData | null,
        weightHistory: WeightEntry[],
        goalCompletionRate: number,
        streakData: number
    ): Promise<BehaviorPattern[]> {
        const patterns: BehaviorPattern[] = [];

        if (!surveyData) return patterns;

        // Analyze eating patterns
        if (surveyData.eatingPattern === "Night eater (most calories after 6pm)") {
            patterns.push({
                type: 'eating_pattern',
                severity: goalCompletionRate < 0.3 ? 'high' : 'medium',
                description: "Late-night eating pattern",
                impact: "Eating late disrupts metabolism and often leads to poor food choices when willpower is low",
                recommendations: [
                    "Eat a protein-rich dinner to reduce late cravings",
                    "Set a kitchen 'closing time' after dinner",
                    "Plan satisfying evening activities that don't involve food"
                ]
            });
        } else if (surveyData.eatingPattern === "Skipper (skip meals often)") {
            patterns.push({
                type: 'eating_pattern',
                severity: 'high',
                description: "Meal skipping pattern",
                impact: "Skipping meals leads to extreme hunger and overeating later, plus slows metabolism",
                recommendations: [
                    "Set 3 daily meal alarms on your phone",
                    "Prep easy grab-and-go breakfast options",
                    "Start with just adding breakfast if you skip it most"
                ]
            });
        }

        // Analyze biggest challenges
        if (surveyData.biggestChallenge === "Late-night snacking") {
            patterns.push({
                type: 'challenge_area',
                severity: streakData < 3 ? 'high' : 'medium',
                description: "Nighttime snacking habit",
                impact: "Late snacking adds extra calories when metabolism is slowest",
                recommendations: [
                    "Brush teeth right after dinner",
                    "Keep only healthy snacks in the house",
                    "Find a relaxing evening routine (tea, reading, bath)"
                ]
            });
        } else if (surveyData.biggestChallenge === "Eating when stressed/bored") {
            patterns.push({
                type: 'challenge_area',
                severity: goalCompletionRate < 0.4 ? 'high' : 'medium',
                description: "Emotional eating pattern",
                impact: "Using food for comfort leads to eating beyond physical hunger",
                recommendations: [
                    "Practice the 'HALT' check: Hungry, Angry, Lonely, Tired?",
                    "Create a list of 5 non-food comfort activities",
                    "Keep a mood journal to identify triggers"
                ]
            });
        } else if (surveyData.biggestChallenge === "Not feeling full") {
            patterns.push({
                type: 'challenge_area',
                severity: 'medium',
                description: "Poor satiety signals",
                impact: "Not feeling full leads to overeating and frequent snacking",
                recommendations: [
                    "Eat slowly and put fork down between bites",
                    "Focus on protein and fiber at every meal",
                    "Wait 20 minutes before deciding if you need more food"
                ]
            });
        }

        // Analyze activity level
        if (surveyData.activityLevel === "Sedentary (little to no exercise)") {
            patterns.push({
                type: 'activity_level',
                severity: streakData < 2 ? 'high' : 'medium',
                description: "Low activity lifestyle",
                impact: "Sedentary lifestyle slows metabolism and reduces daily calorie burn",
                recommendations: [
                    "Start with 10-minute walks after meals",
                    "Take stairs instead of elevators",
                    "Set hourly movement reminders"
                ]
            });
        }

        // Analyze problem foods
        if (surveyData.problemFoods && surveyData.problemFoods.length > 0) {
            const severity = surveyData.problemFoods.length >= 3 ? 'high' : 'medium';
            patterns.push({
                type: 'food_triggers',
                severity,
                description: `Trigger foods: ${surveyData.problemFoods.join(', ')}`,
                impact: "Having trigger foods easily accessible leads to frequent overeating episodes",
                recommendations: [
                    "Don't keep trigger foods in the house",
                    "Find healthier swaps that satisfy the same craving",
                    "Practice the 'one serving rule' when you do have these foods"
                ]
            });
        }

        return patterns.sort((a, b) => {
            const severityOrder = { high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });
    }

    private static analyzeProgressTrend(
        weightHistory: WeightEntry[],
        goalCompletionRate: number
    ): 'improving' | 'stable' | 'concerning' {
        if (weightHistory.length < 2) {
            return goalCompletionRate > 0.6 ? 'improving' : 'stable';
        }

        const recentWeights = weightHistory.slice(-4); // Last 4 entries
        const trend = recentWeights[recentWeights.length - 1].weight - recentWeights[0].weight;

        if (trend < -1 && goalCompletionRate > 0.5) return 'improving';
        if (trend > 2 || goalCompletionRate < 0.3) return 'concerning';
        return 'stable';
    }

    private static generatePersonalizedInsights(
        patterns: BehaviorPattern[],
        surveyData: SurveyData | null,
        completedGoalsToday: number
    ): string[] {
        const insights: string[] = [];

        if (!surveyData) {
            insights.push("Complete your profile to get personalized weight gain insights");
            return insights;
        }

        // Primary insight based on top pattern
        if (patterns.length > 0) {
            const topPattern = patterns[0];
            if (topPattern.severity === 'high') {
                insights.push(`Your biggest weight gain factor: ${topPattern.description.toLowerCase()}`);
            }
        }

        // Progress-based insight
        if (completedGoalsToday === 0) {
            insights.push("Breaking patterns requires consistent small actions - start with today's goals");
        } else if (completedGoalsToday >= 2) {
            insights.push(`${completedGoalsToday}/3 goals done - you're actively changing your patterns!`);
        }

        // Challenge-specific insight
        if (surveyData.biggestChallenge === "Late-night snacking") {
            insights.push("Late-night calories are harder to burn off and often emotional eating");
        } else if (surveyData.biggestChallenge === "Eating when stressed/bored") {
            insights.push("Emotional eating adds 300-500+ extra calories daily without satisfying real hunger");
        } else if (surveyData.biggestChallenge === "Not feeling full") {
            insights.push("Poor satiety signals can lead to eating 20-30% more than your body needs");
        }

        return insights.slice(0, 2); // Keep it focused
    }

    private static prioritizeActions(
        patterns: BehaviorPattern[],
        surveyData: SurveyData | null
    ): string[] {
        const actions: string[] = [];

        if (!surveyData) return ["Complete your survey to get personalized action plan"];

        // Prioritize based on highest impact patterns
        const highSeverityPatterns = patterns.filter(p => p.severity === 'high');
        
        if (highSeverityPatterns.length > 0) {
            actions.push(highSeverityPatterns[0].recommendations[0]);
        }

        // Add complementary actions
        if (surveyData.activityLevel === "Sedentary (little to no exercise)") {
            actions.push("Add 10-minute daily walks");
        }

        if (surveyData.eatingPattern === "Skipper (skip meals often)") {
            actions.push("Never skip breakfast");
        }

        return actions.slice(0, 3);
    }

    private static calculateConfidenceLevel(
        surveyData: SurveyData | null,
        weightHistoryLength: number
    ): number {
        let confidence = 0;

        if (surveyData) confidence += 60; // Base confidence from survey
        if (weightHistoryLength >= 3) confidence += 20; // Weight trend data
        if (weightHistoryLength >= 7) confidence += 20; // Strong trend data

        return Math.min(confidence, 100);
    }

    static async trackBehaviorChange(behaviorType: string, positive: boolean): Promise<void> {
        try {
            const existing = await AsyncStorage.getItem(this.BEHAVIOR_TRACKING_KEY);
            const data = existing ? JSON.parse(existing) : {};
            
            const today = new Date().toISOString().split('T')[0];
            if (!data[today]) data[today] = {};
            if (!data[today][behaviorType]) data[today][behaviorType] = { positive: 0, negative: 0 };
            
            if (positive) {
                data[today][behaviorType].positive++;
            } else {
                data[today][behaviorType].negative++;
            }

            await AsyncStorage.setItem(this.BEHAVIOR_TRACKING_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error tracking behavior change:', error);
        }
    }
}

export default WeightGainAnalyzer;
export type { BehaviorPattern, WeightGainAnalysis };
