
interface WeightEntry {
    weight: number;
    date: string;
}

interface SurveyData {
    currentWeight: string;
    goalWeight: string;
    mainReason: string;
    timeline: string;
}

interface MotivationInsight {
    type: 'progress' | 'milestone' | 'inspiration' | 'comparison';
    icon: string;
    title: string;
    message: string;
    statistic?: string;
    encouragement: string;
}

class MotivationEngine {
    private static readonly POPULATION_DATA = {
        // Weight distribution data (percentages)
        weightRanges: {
            120: { percentile: 5, description: "Very light range" },
            130: { percentile: 15, description: "Light range" },
            140: { percentile: 25, description: "Below average range" },
            150: { percentile: 35, description: "Lower average range" },
            160: { percentile: 50, description: "Average range" },
            170: { percentile: 65, description: "Upper average range" },
            180: { percentile: 75, description: "Above average range" },
            190: { percentile: 85, description: "Higher range" },
            200: { percentile: 90, description: "Upper range" },
            210: { percentile: 95, description: "Top range" }
        }
    };

    static async generateMotivationalInsights(
        surveyData: SurveyData,
        weightHistory: WeightEntry[],
        currentWeight: number
    ): Promise<MotivationInsight[]> {
        const insights: MotivationInsight[] = [];
        
        const goalWeight = Number(surveyData.goalWeight);
        const startingWeight = Number(surveyData.currentWeight);
        const totalWeightToLose = startingWeight - goalWeight;
        const weightLost = startingWeight - currentWeight;
        const progressPercent = Math.max(0, (weightLost / totalWeightToLose) * 100);
        const remainingWeight = currentWeight - goalWeight;

        // Progress-based motivation
        if (weightLost > 0) {
            insights.push(await this.generateProgressInsight(weightLost, progressPercent, surveyData));
        }

        // Current weight population comparison
        insights.push(this.generatePopulationComparison(currentWeight, goalWeight));

        // Goal proximity motivation
        if (remainingWeight <= 10 && remainingWeight > 0) {
            insights.push(this.generateNearGoalInsight(remainingWeight, goalWeight, surveyData));
        } else if (remainingWeight <= 0) {
            insights.push(this.generateGoalAchievedInsight(goalWeight, surveyData));
        }

        // Timeline-based motivation
        insights.push(this.generateTimelineMotivation(weightHistory, surveyData, progressPercent));

        return insights.slice(0, 2); // Return top 2 most relevant
    }

    private static async generateProgressInsight(
        weightLost: number,
        progressPercent: number,
        surveyData: SurveyData
    ): Promise<MotivationInsight> {
        const milestones = [
            { weight: 5, message: "You've lost your first 5 lbs! That's like carrying 5 bags of sugar less!" },
            { weight: 10, message: "10 lbs down! You're carrying one less bowling ball worth of weight!" },
            { weight: 15, message: "Amazing! 15 lbs is like losing a 2-month-old baby's worth of weight!" },
            { weight: 20, message: "Incredible! 20 lbs lost - that's like a car tire you're not carrying anymore!" },
            { weight: 25, message: "Outstanding! 25 lbs is equivalent to a 2-year-old child - imagine that off your body!" },
            { weight: 30, message: "Phenomenal! 30 lbs lost is like 2.5 gallons of paint you're no longer carrying!" }
        ];

        const milestone = milestones.reverse().find(m => weightLost >= m.weight);
        
        if (milestone) {
            return {
                type: 'milestone',
                icon: '🎉',
                title: `${weightLost.toFixed(1)} lbs Lost!`,
                message: milestone.message,
                statistic: `${progressPercent.toFixed(1)}% to your goal`,
                encouragement: this.getReasonBasedEncouragement(surveyData.mainReason)
            };
        }

        return {
            type: 'progress',
            icon: '📈',
            title: 'Progress Made!',
            message: `You've lost ${weightLost.toFixed(1)} lbs! Every pound lost reduces strain on your joints and heart.`,
            statistic: `${progressPercent.toFixed(1)}% of your goal achieved`,
            encouragement: "Your body is already thanking you for these changes!"
        };
    }

    private static generatePopulationComparison(currentWeight: number, goalWeight: number): MotivationInsight {
        const currentPercentile = this.getWeightPercentile(currentWeight);
        const goalPercentile = this.getWeightPercentile(goalWeight);
        
        if (currentWeight > goalWeight) {
            return {
                type: 'comparison',
                icon: '🎯',
                title: 'Your Goal Weight Impact',
                message: `At ${goalWeight} lbs, you'll be lighter than ${(100 - goalPercentile).toFixed(0)}% of people your height!`,
                statistic: `Moving from ${currentPercentile}th to ${goalPercentile}th percentile`,
                encouragement: "You're working toward being in a healthier weight range than most people!"
            };
        } else {
            return {
                type: 'inspiration',
                icon: '🏆',
                title: 'Already Winning!',
                message: `At ${currentWeight} lbs, you're already lighter than ${(100 - currentPercentile).toFixed(0)}% of people!`,
                statistic: `You're in the ${currentPercentile}th percentile`,
                encouragement: "You're maintaining a weight that many people aspire to reach!"
            };
        }
    }

    private static generateNearGoalInsight(
        remainingWeight: number,
        goalWeight: number,
        surveyData: SurveyData
    ): MotivationInsight {
        const comparisons = [
            { weight: 1, item: "a bag of sugar" },
            { weight: 2, item: "a pineapple" },
            { weight: 3, item: "a brick" },
            { weight: 5, item: "a bag of flour" },
            { weight: 8, item: "a gallon of milk" },
            { weight: 10, item: "a bowling ball" }
        ];

        const comparison = comparisons.reverse().find(c => remainingWeight >= c.weight) || comparisons[0];

        return {
            type: 'milestone',
            icon: '🎯',
            title: 'So Close to Your Goal!',
            message: `Only ${remainingWeight.toFixed(1)} lbs to go - that's like ${comparison.item}!`,
            statistic: `${goalWeight} lbs is within reach`,
            encouragement: this.getReasonBasedEncouragement(surveyData.mainReason) + " You're almost there!"
        };
    }

    private static generateGoalAchievedInsight(goalWeight: number, surveyData: SurveyData): MotivationInsight {
        return {
            type: 'milestone',
            icon: '🏆',
            title: 'GOAL ACHIEVED! 🎉',
            message: `You've reached ${goalWeight} lbs! You've accomplished what you set out to do!`,
            statistic: '100% of your goal completed',
            encouragement: this.getReasonBasedEncouragement(surveyData.mainReason) + " You did it!"
        };
    }

    private static generateTimelineMotivation(
        weightHistory: WeightEntry[],
        surveyData: SurveyData,
        progressPercent: number
    ): MotivationInsight {
        const timeline = surveyData.timeline;
        const hasRecentProgress = weightHistory.length >= 2 && 
            weightHistory[0].weight < weightHistory[1].weight;

        if (hasRecentProgress) {
            const recentLoss = weightHistory[1].weight - weightHistory[0].weight;
            return {
                type: 'progress',
                icon: '🔥',
                title: 'Momentum Building!',
                message: `You've lost ${recentLoss.toFixed(1)} lbs recently! At this rate, you're on track for your ${timeline} goal.`,
                statistic: `${progressPercent.toFixed(1)}% complete`,
                encouragement: "Your consistency is paying off - keep this momentum!"
            };
        }

        // Timeline-based encouragement
        const timelineMessages = {
            "1-2 months": "Quick wins are happening! You're building habits that will serve you for life.",
            "3-6 months": "Steady progress wins the race! You're building sustainable habits.",
            "6-12 months": "You're playing the long game - the most sustainable approach!",
            "More than a year": "You understand this is a lifestyle, not a sprint. That mindset will guarantee success!"
        };

        return {
            type: 'inspiration',
            icon: '⏰',
            title: 'Perfect Timeline',
            message: timelineMessages[timeline as keyof typeof timelineMessages] || "You're on the right track!",
            statistic: `Target: ${timeline}`,
            encouragement: "Sustainable change takes time, and you're doing it right!"
        };
    }

    private static getWeightPercentile(weight: number): number {
        const ranges = Object.entries(this.POPULATION_DATA.weightRanges);
        
        for (let i = 0; i < ranges.length; i++) {
            const [weightStr, data] = ranges[i];
            if (weight <= Number(weightStr)) {
                return data.percentile;
            }
        }
        
        return 98; // Top percentile for very high weights
    }

    private static getReasonBasedEncouragement(reason: string): string {
        const encouragements = {
            "Feel more energetic": "You're investing in energy that will serve you every day!",
            "Look better in my clothes": "Your clothes are going to fit better and you'll feel more confident!",
            "Keep up with my kids": "Your kids will love having an active, energetic parent!",
            "Health scare/concern": "You're taking control of your health - your future self will thank you!",
            "Feel confident again": "Confidence comes from keeping promises to yourself, and you're doing that!",
            "Wedding/event coming up": "You're going to look and feel amazing at your special event!",
            "Just want to be healthier": "Every healthy choice you make is an investment in your future!"
        };

        return encouragements[reason as keyof typeof encouragements] || "You're making amazing progress!";
    }
}

export default MotivationEngine;
export type { MotivationInsight };
