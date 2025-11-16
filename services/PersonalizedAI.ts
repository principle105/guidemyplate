import AsyncStorage from "@react-native-async-storage/async-storage";


export interface CravingPrediction {
    riskLevel: "low" | "medium" | "high";
    timeUntilCraving: number; // hours
    reason: string;
    prevention: string[];
    confidence: number; // percentage
}

export interface SatietyData {
    foodName: string;
    fullnessRating: number; // 1-10
    hoursUntilHungry: number;
    timestamp: string;
    mealType: string;
}

export interface EnergyData {
    foodName: string;
    energyRating: number; // 1-10
    hoursSustained: number;
    timestamp: string;
    mealType: string;
    crashExperienced: boolean;
}

export interface ThirstCheck {
    isLikelyThirst: boolean;
    waterToday: number;
    lastWaterTime: string;
    lastMealTime: string;
    recommendation: string;
    caloriesSaved: number;
}

export interface SmartSwap {
    originalFood: string;
    swapSuggestion: string;
    reason: string;
    satietyImprovement: string;
    calorieImpact: string;
    healthBenefit: string;
}

class PersonalizedAIService {
    /**
     * Call Gemini API for AI analysis
     */
    async callGemini(prompt: string): Promise<string> {
        try {
            const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("Gemini API key not found");
            }

            console.log("Making Gemini API call...");
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: prompt,
                                    },
                                ],
                            },
                        ],
                    }),
                }
            );

            if (!response.ok) {
                console.error("Gemini API error response:", response.status, response.statusText);
                const errorText = await response.text();
                console.error("Error details:", errorText);
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data = await response.json();
            console.log("Gemini API response received");
            
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.error("Unexpected Gemini response format:", data);
                throw new Error("Invalid response format from Gemini");
            }
        } catch (error) {
            console.error("Gemini API call failed:", error);
            throw error;
        }
    }

    /**
     * Get user's eating history for context
     */
    private async getUserContext(): Promise<string> {
        try {
            const surveyData = await AsyncStorage.getItem("surveyData");
            const foodLog = await AsyncStorage.getItem("foodLog");
            const satietyHistory = await AsyncStorage.getItem("satietyHistory");
            const energyHistory = await AsyncStorage.getItem("energyHistory");
            const weightHistory = await AsyncStorage.getItem("weightHistory");

            const survey = surveyData ? JSON.parse(surveyData) : {};
            const logs = foodLog ? JSON.parse(foodLog) : [];
            const satiety = satietyHistory ? JSON.parse(satietyHistory) : [];
            const energy = energyHistory ? JSON.parse(energyHistory) : [];
            const weights = weightHistory ? JSON.parse(weightHistory) : [];

            // Get recent meals (last 7 days)
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const recentLogs = logs.filter((log: any) => new Date(log.timestamp) > weekAgo);

            return `
USER PROFILE:
- Challenge: ${survey.biggestChallenge || "Unknown"}
- Goal: Lose ${survey.currentWeight - survey.goalWeight} lbs
- Activity: ${survey.activityLevel || "Unknown"}
- Current Weight: ${weights[0]?.weight || survey.currentWeight} lbs

RECENT MEALS (Last 7 days):
${recentLogs.map((log: any) => `- ${log.mealType}: ${log.foodName} (${log.calories} cal)`).join("\n")}

SATIETY PATTERNS:
${satiety.slice(-10).map((s: SatietyData) => `- ${s.foodName}: ${s.fullnessRating}/10 fullness, hungry after ${s.hoursUntilHungry}h`).join("\n")}

ENERGY PATTERNS:
${energy.slice(-10).map((e: EnergyData) => `- ${e.foodName}: ${e.energyRating}/10 energy, ${e.crashExperienced ? "crash experienced" : "sustained " + e.hoursSustained + "h"}`).join("\n")}
            `.trim();
        } catch (error) {
            console.error("Error getting user context:", error);
            return "No user history available";
        }
    }

    /**
     * 1. AI CRAVING PREDICTOR
     */
    async predictCraving(): Promise<CravingPrediction> {
        try {
            const context = await this.getUserContext();
            const foodLog = await AsyncStorage.getItem("foodLog");
            const logs = foodLog ? JSON.parse(foodLog) : [];

            // Get today's meals
            const today = new Date().toDateString();
            const todayMeals = logs.filter((log: any) => new Date(log.timestamp).toDateString() === today);

            const prompt = `
You are a nutrition AI analyzing craving patterns. Based on this user's data:

${context}

TODAY'S MEALS SO FAR:
${todayMeals.map((m: any) => `${m.mealType}: ${m.foodName} (${m.calories} cal)`).join("\n")}

CURRENT TIME: ${new Date().toLocaleTimeString()}

Predict their craving risk in the next 2-4 hours. Respond in JSON format:
{
    "riskLevel": "low|medium|high",
    "timeUntilCraving": 2.5,
    "reason": "Brief explanation why",
    "prevention": ["Action 1", "Action 2"],
    "confidence": 85
}

Consider:
- Protein intake today
- Time since last meal
- Historical patterns
- Blood sugar stability
`;

            const response = await this.callGemini(prompt);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback
            return {
                riskLevel: "medium",
                timeUntilCraving: 2,
                reason: "Unable to analyze patterns",
                prevention: ["Drink water", "Eat protein snack"],
                confidence: 50,
            };
        } catch (error) {
            console.error("Error predicting craving:", error);
            return {
                riskLevel: "medium",
                timeUntilCraving: 2,
                reason: "Analysis unavailable",
                prevention: ["Stay hydrated", "Eat balanced meals"],
                confidence: 50,
            };
        }
    }

    /**
     * 2. SATIETY SCORE - Save user's fullness rating
     */
    async saveSatietyData(data: Omit<SatietyData, "timestamp">): Promise<void> {
        try {
            const historyData = await AsyncStorage.getItem("satietyHistory");
            const history: SatietyData[] = historyData ? JSON.parse(historyData) : [];

            const newEntry: SatietyData = {
                ...data,
                timestamp: new Date().toISOString(),
            };

            history.unshift(newEntry);

            // Keep last 100 entries
            if (history.length > 100) {
                history.splice(100);
            }

            await AsyncStorage.setItem("satietyHistory", JSON.stringify(history));
        } catch (error) {
            console.error("Error saving satiety data:", error);
        }
    }

    /**
     * Get personalized satiety insights
     */
    async getSatietyInsights(): Promise<{
        highSatiety: Array<{ food: string; avgFullness: number; avgHours: number }>;
        lowSatiety: Array<{ food: string; avgFullness: number; avgHours: number }>;
        recommendation: string;
    }> {
        try {
            const historyData = await AsyncStorage.getItem("satietyHistory");
            if (!historyData) {
                return {
                    highSatiety: [],
                    lowSatiety: [],
                    recommendation: "Start tracking fullness after meals to discover your patterns!",
                };
            }

            const history: SatietyData[] = JSON.parse(historyData);

            // Group by food and calculate averages
            const foodMap = new Map<string, { fullness: number[]; hours: number[] }>();

            history.forEach((entry) => {
                const existing = foodMap.get(entry.foodName) || { fullness: [], hours: [] };
                existing.fullness.push(entry.fullnessRating);
                existing.hours.push(entry.hoursUntilHungry);
                foodMap.set(entry.foodName, existing);
            });

            const foods = Array.from(foodMap.entries()).map(([food, data]) => ({
                food,
                avgFullness: data.fullness.reduce((a, b) => a + b, 0) / data.fullness.length,
                avgHours: data.hours.reduce((a, b) => a + b, 0) / data.hours.length,
            }));

            const sorted = foods.sort((a, b) => b.avgFullness - a.avgFullness);
            const highSatiety = sorted.slice(0, 5);
            const lowSatiety = sorted.slice(-5).reverse();

            return {
                highSatiety,
                lowSatiety,
                recommendation: `Your best satiety foods keep you full ${highSatiety[0]?.avgHours.toFixed(1)}+ hours. Choose these more often!`,
            };
        } catch (error) {
            console.error("Error getting satiety insights:", error);
            return {
                highSatiety: [],
                lowSatiety: [],
                recommendation: "Unable to analyze patterns",
            };
        }
    }

    /**
     * 3. SMART SWAP ENGINE - AI-powered food swaps
     */
    async getSmartSwaps(foodName: string, calories: number): Promise<SmartSwap[]> {
        try {
            const context = await this.getUserContext();

            const prompt = `
You are a personalized nutrition AI. The user just ate: "${foodName}" (${calories} cal)

USER CONTEXT:
${context}

Provide 3 smart food swaps for NEXT TIME they want this food. Consider:
- Their personal satiety patterns
- Their challenge (${context.match(/Challenge: (.+)/)?.[1]})
- Realistic swaps (not too extreme)
- What keeps THEM full longer

Respond in JSON array format:
[
    {
        "originalFood": "${foodName}",
        "swapSuggestion": "Specific food",
        "reason": "Why this swap works for them",
        "satietyImprovement": "How much longer they'll stay full",
        "calorieImpact": "Calorie difference",
        "healthBenefit": "Main health advantage"
    }
]

Make suggestions specific and actionable.
`;

            const response = await this.callGemini(prompt);
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback swaps
            return [
                {
                    originalFood: foodName,
                    swapSuggestion: "Add protein to this meal",
                    reason: "Protein increases satiety",
                    satietyImprovement: "1-2 hours longer",
                    calorieImpact: "Similar calories",
                    healthBenefit: "Reduces cravings",
                },
            ];
        } catch (error) {
            console.error("Error getting smart swaps:", error);
            return [];
        }
    }

    /**
     * 5. HUNGER VS THIRST DETECTOR
     */
    async checkHungerVsThirst(): Promise<ThirstCheck> {
        try {
            const waterLog = await AsyncStorage.getItem("waterLog");
            const foodLog = await AsyncStorage.getItem("foodLog");

            const waterData = waterLog ? JSON.parse(waterLog) : { cupsToday: 0, lastDrinkTime: null };
            const logs = foodLog ? JSON.parse(foodLog) : [];

            const today = new Date().toDateString();
            const todayMeals = logs.filter((log: any) => new Date(log.timestamp).toDateString() === today);
            const lastMeal = todayMeals[0];

            const hoursSinceLastMeal = lastMeal
                ? (Date.now() - new Date(lastMeal.timestamp).getTime()) / (1000 * 60 * 60)
                : 5;

            const hoursSinceWater = waterData.lastDrinkTime
                ? (Date.now() - new Date(waterData.lastDrinkTime).getTime()) / (1000 * 60 * 60)
                : 3;

            const isLikelyThirst =
                waterData.cupsToday < 4 || hoursSinceWater > 2 || (hoursSinceLastMeal < 2.5 && waterData.cupsToday < 6);

            return {
                isLikelyThirst,
                waterToday: waterData.cupsToday,
                lastWaterTime: waterData.lastDrinkTime || "Not tracked today",
                lastMealTime: lastMeal ? new Date(lastMeal.timestamp).toLocaleTimeString() : "No meals today",
                recommendation: isLikelyThirst
                    ? "Try drinking 1-2 cups of water and wait 10 minutes. 60% of hunger is actually thirst!"
                    : "You're well hydrated. If hungry, it's likely real hunger - have a healthy snack!",
                caloriesSaved: isLikelyThirst ? 250 : 0,
            };
        } catch (error) {
            console.error("Error checking thirst:", error);
            return {
                isLikelyThirst: true,
                waterToday: 0,
                lastWaterTime: "Unknown",
                lastMealTime: "Unknown",
                recommendation: "Drink water first, wait 10 min, then reassess hunger",
                caloriesSaved: 250,
            };
        }
    }

    /**
     * 6. ENERGY-FOOD CORRELATION - Save energy rating
     */
    async saveEnergyData(data: Omit<EnergyData, "timestamp">): Promise<void> {
        try {
            const historyData = await AsyncStorage.getItem("energyHistory");
            const history: EnergyData[] = historyData ? JSON.parse(historyData) : [];

            const newEntry: EnergyData = {
                ...data,
                timestamp: new Date().toISOString(),
            };

            history.unshift(newEntry);

            // Keep last 100 entries
            if (history.length > 100) {
                history.splice(100);
            }

            await AsyncStorage.setItem("energyHistory", JSON.stringify(history));
        } catch (error) {
            console.error("Error saving energy data:", error);
        }
    }

    /**
     * Get energy insights
     */
    async getEnergyInsights(): Promise<{
        highEnergy: Array<{ food: string; avgRating: number; avgHours: number }>;
        lowEnergy: Array<{ food: string; avgRating: number; crashRate: number }>;
        pattern: string;
    }> {
        try {
            const historyData = await AsyncStorage.getItem("energyHistory");
            if (!historyData) {
                return {
                    highEnergy: [],
                    lowEnergy: [],
                    pattern: "Start tracking energy levels to find your best foods!",
                };
            }

            const history: EnergyData[] = JSON.parse(historyData);

            // Group by food
            const foodMap = new Map<
                string,
                { ratings: number[]; hours: number[]; crashes: number; total: number }
            >();

            history.forEach((entry) => {
                const existing = foodMap.get(entry.foodName) || {
                    ratings: [],
                    hours: [],
                    crashes: 0,
                    total: 0,
                };
                existing.ratings.push(entry.energyRating);
                existing.hours.push(entry.hoursSustained);
                if (entry.crashExperienced) existing.crashes++;
                existing.total++;
                foodMap.set(entry.foodName, existing);
            });

            const foods = Array.from(foodMap.entries()).map(([food, data]) => ({
                food,
                avgRating: data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length,
                avgHours: data.hours.reduce((a, b) => a + b, 0) / data.hours.length,
                crashRate: (data.crashes / data.total) * 100,
            }));

            const highEnergy = foods.filter((f) => f.avgRating >= 7).slice(0, 5);
            const lowEnergy = foods.filter((f) => f.crashRate > 50 || f.avgRating < 5).slice(0, 5);

            return {
                highEnergy,
                lowEnergy,
                pattern: highEnergy.length > 0
                    ? `Your high-energy foods sustain you ${highEnergy[0].avgHours.toFixed(1)}+ hours on average!`
                    : "Keep tracking to discover your patterns",
            };
        } catch (error) {
            console.error("Error getting energy insights:", error);
            return {
                highEnergy: [],
                lowEnergy: [],
                pattern: "Unable to analyze patterns",
            };
        }
    }

    /**
     * Update water log (for thirst detector)
     */
    async logWater(cups: number = 1): Promise<void> {
        try {
            const waterLog = await AsyncStorage.getItem("waterLog");
            const data = waterLog ? JSON.parse(waterLog) : { cupsToday: 0, lastDrinkTime: null, date: null };

            const today = new Date().toDateString();

            // Reset if new day
            if (data.date !== today) {
                data.cupsToday = 0;
                data.date = today;
            }

            data.cupsToday += cups;
            data.lastDrinkTime = new Date().toISOString();

            await AsyncStorage.setItem("waterLog", JSON.stringify(data));
        } catch (error) {
            console.error("Error logging water:", error);
        }
    }

    /**
     * Get current water intake
     */
    async getWaterIntake(): Promise<{ cups: number; goal: number; percentage: number }> {
        try {
            const waterLog = await AsyncStorage.getItem("waterLog");
            const data = waterLog ? JSON.parse(waterLog) : { cupsToday: 0 };

            const today = new Date().toDateString();
            const cups = data.date === today ? data.cupsToday : 0;
            const goal = 8;

            return {
                cups,
                goal,
                percentage: Math.min(100, (cups / goal) * 100),
            };
        } catch (error) {
            console.error("Error getting water intake:", error);
            return { cups: 0, goal: 8, percentage: 0 };
        }
    }
}

export default new PersonalizedAIService();
