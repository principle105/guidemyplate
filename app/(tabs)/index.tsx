import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert, SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import StreakManager from "../../services/StreakManager";
import WeightGainAnalyzer, { WeightGainAnalysis } from "../../services/WeightGainAnalyzer";

type SurveyData = {
    mainReason: string;
    biggestChallenge: string;
    eatingPattern: string;
    satietyLevel: string;
    currentWeight: string;
    goalWeight: string;
    timeline: string;
    activityLevel: string;
    problemFoods: string[];
};

export default function HomeTab() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const { user, logout } = useAuth();
    const router = useRouter();
    const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
    const [dailyGoals, setDailyGoals] = useState<{
        id: string;
        text: string;
        completed: boolean;
    }[]>([]);
    const [currentWeight, setCurrentWeight] = useState(180);
    const [lastWeekWeight, setLastWeekWeight] = useState(180);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [weeklyProgress, setWeeklyProgress] = useState({ thisWeek: 0, lastWeek: 0, weeklyGoal: 5 });
    const [achievements, setAchievements] = useState<string[]>([]);
    const [weightGainAnalysis, setWeightGainAnalysis] = useState<WeightGainAnalysis | null>(null);
    const [surveyLoaded, setSurveyLoaded] = useState(false);
    const [dataInitialized, setDataInitialized] = useState(false);

    // Load survey data on mount
    useEffect(() => {
        const initializeData = async () => {
            await loadSurveyData();
            loadDailyGoals();
            loadStreakData();
            await analyzeWeightGainPatterns();
            setDataInitialized(true);
        };
        initializeData();
    }, []);

    // Re-sync weight data when survey data changes
    useEffect(() => {
        if (surveyData && surveyLoaded) {
            loadWeightData();
        }
    }, [surveyData, surveyLoaded]);

    const loadStreakData = async () => {
        try {
            const streak = await StreakManager.getCurrentStreak();
            const progress = await StreakManager.getWeeklyProgress();
            const userAchievements = await StreakManager.getRecentAchievements();
            
            setCurrentStreak(streak);
            setWeeklyProgress(progress);
            setAchievements(userAchievements);
        } catch (error) {
            console.error("Error loading streak data:", error);
        }
    };

    const analyzeWeightGainPatterns = async () => {
        try {
            const weightHistoryData = await AsyncStorage.getItem('weightHistory');
            const weightHistory = weightHistoryData ? JSON.parse(weightHistoryData) : [];
            
            const completedGoalsToday = dailyGoals.filter(g => g.completed).length;
            const goalCompletionRate = dailyGoals.length > 0 ? completedGoalsToday / dailyGoals.length : 0;
            
            const analysis = await WeightGainAnalyzer.analyzeWeightGainCauses(
                surveyData,
                weightHistory,
                goalCompletionRate,
                currentStreak,
                completedGoalsToday
            );
            
            setWeightGainAnalysis(analysis);
        } catch (error) {
            console.error('Error analyzing weight gain patterns:', error);
        }
    };

    const resetUserProgress = async () => {
        try {
            // Clear all user-specific data but keep survey responses
            await AsyncStorage.removeItem('weightHistory');
            await AsyncStorage.removeItem('daily_goals');
            await AsyncStorage.removeItem('dailyGoals');
            await AsyncStorage.removeItem('streak_data');
            await AsyncStorage.removeItem('weekly_progress');
            await AsyncStorage.removeItem('user_achievements');
            
            // Reset state to survey baseline
            if (surveyData?.currentWeight) {
                const surveyWeight = Number(surveyData.currentWeight);
                setCurrentWeight(surveyWeight);
                setLastWeekWeight(surveyWeight);
            }
            
            // Reset progress tracking
            setCurrentStreak(0);
            setWeeklyProgress({ thisWeek: 0, lastWeek: 0, weeklyGoal: 5 });
            setAchievements([]);
            
            // Generate fresh goals
            if (surveyData) {
                await generateDailyGoals(surveyData);
            }
            
            Alert.alert("✨ Progress Reset", "Your progress has been reset based on your survey data!");
        } catch (error) {
            console.error('Error resetting user progress:', error);
        }
    };

    const loadWeightData = async () => {
        if (!surveyData?.currentWeight) {
            console.log('No survey weight data available yet');
            return;
        }
        
        try {
            const surveyWeight = Number(surveyData.currentWeight);
            const history = await AsyncStorage.getItem("weightHistory");
            
            console.log('Loading weight data with survey weight:', surveyWeight);
            
            if (history) {
                const entries = JSON.parse(history);
                if (entries.length > 0) {
                    // Use most recent logged weight
                    const mostRecentWeight = entries[0].weight;
                    setCurrentWeight(mostRecentWeight);
                    
                    // Find weight from 7 days ago
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    const weekAgoEntry = entries.find((e: any) => {
                        const entryDate = new Date(e.date);
                        return !isNaN(entryDate.getTime()) && entryDate <= weekAgo;
                    });
                    
                    // Use week ago weight if available, otherwise use survey starting weight
                    setLastWeekWeight(weekAgoEntry ? weekAgoEntry.weight : surveyWeight);
                    
                    console.log('Loaded weights - Current:', mostRecentWeight, 'Last week:', weekAgoEntry ? weekAgoEntry.weight : surveyWeight);
                } else {
                    // Empty history, use survey data
                    setCurrentWeight(surveyWeight);
                    setLastWeekWeight(surveyWeight);
                }
            } else {
                // No weight history at all, use survey starting weight
                setCurrentWeight(surveyWeight);
                setLastWeekWeight(surveyWeight);
                console.log('No weight history, using survey weight:', surveyWeight);
            }
        } catch (error) {
            console.error("Error loading weight:", error);
            // Fallback to survey data on error
            const surveyWeight = Number(surveyData.currentWeight);
            setCurrentWeight(surveyWeight);
            setLastWeekWeight(surveyWeight);
        }
    };

    const loadSurveyData = async () => {
        try {
            const data = await AsyncStorage.getItem("surveyData");
            if (data) {
                const parsed = JSON.parse(data);
                console.log('Loading survey data:', {
                    currentWeight: parsed.currentWeight,
                    goalWeight: parsed.goalWeight,
                    biggestChallenge: parsed.biggestChallenge
                });
                
                setSurveyData(parsed);
                setSurveyLoaded(true);

                // Always initialize with survey weight as baseline
                if (parsed.currentWeight) {
                    const surveyWeight = Number(parsed.currentWeight);
                    
                    // Check if this is a completely new user (no weight history)
                    const history = await AsyncStorage.getItem("weightHistory");
                    if (!history) {
                        setCurrentWeight(surveyWeight);
                        setLastWeekWeight(surveyWeight);
                        
                        // Create initial weight entry from survey
                        const initialEntry = {
                            weight: surveyWeight,
                            date: new Date().toISOString(),
                        };
                        await AsyncStorage.setItem('weightHistory', JSON.stringify([initialEntry]));
                    }
                }

                // Generate daily goals for the user
                await generateDailyGoals(parsed);
            } else {
                console.log('No survey data found in storage');
            }
        } catch (error) {
            console.error("Failed to load survey data:", error);
        }
    };    const loadDailyGoals = async () => {
        try {
            const today = new Date().toDateString();
            const savedGoals = await AsyncStorage.getItem("dailyGoals");
            const savedDate = await AsyncStorage.getItem("dailyGoalsDate");

            if (savedGoals && savedDate === today) {
                const goals = JSON.parse(savedGoals);
                // Ensure we always have exactly 3 goals
                if (goals.length === 3) {
                    setDailyGoals(goals);
                } else {
                    // If not exactly 3, clear and regenerate
                    await AsyncStorage.removeItem("dailyGoals");
                    await AsyncStorage.removeItem("dailyGoalsDate");
                }
            }
        } catch (error) {
            console.error("Error loading daily goals:", error);
        }
    };

    const generateDailyGoals = async (data: SurveyData) => {
        // Pool of goals for each challenge type
        const goalsByChallenge: { [key: string]: string[] } = {
            "Late-night snacking": [
                "Eat protein-rich dinner (keeps you full)",
                "Set a 'kitchen closed' time at 8pm",
                "Find one non-food evening activity",
                "Drink herbal tea instead of snacking",
                "Brush teeth after dinner to signal 'done eating'",
                "Go for a 10-minute walk after dinner",
            ],
            "Not feeling full": [
                "Add protein to every meal today",
                "Eat at least 2 servings of vegetables",
                "Drink water before feeling hungry",
                "Choose high-fiber foods (beans, oats)",
                "Eat slowly - put fork down between bites",
                "Add healthy fats (avocado, nuts)",
            ],
            "Eating when stressed/bored": [
                "Take a 5-min walk when stressed",
                "Call a friend instead of snacking",
                "Journal your feelings before eating",
                "Try deep breathing for 2 minutes",
                "Find a hobby that keeps hands busy",
                "Drink tea when bored instead of eating",
            ],
            "Skipping meals then overeating": [
                "Eat breakfast within 1 hour of waking",
                "Set 3 meal reminders for today",
                "Prep a healthy snack for afternoon",
                "Don't skip lunch no matter how busy",
                "Keep emergency healthy snacks ready",
                "Eat every 3-4 hours to avoid extreme hunger",
            ],
            "Too many processed foods": [
                "Choose one whole food over processed",
                "Cook one meal from scratch",
                "Read ingredient labels before buying",
                "Shop the perimeter of grocery store",
                "Prep veggies for easy snacking",
                "Try one new whole food recipe",
            ],
        };

        // Get goals for user's challenge, or use default
        const availableGoals = goalsByChallenge[data.biggestChallenge] || [
            "Drink 8 glasses of water today",
            "Take a 20-minute walk",
            "Log all your meals",
        ];

        // Shuffle and pick 3 random goals
        const shuffled = availableGoals.sort(() => Math.random() - 0.5);
        const selectedGoals = shuffled.slice(0, 3).map((text, index) => ({
            id: String(index + 1),
            text,
            completed: false,
        }));

        // Check if we already have goals for today
        const todayStr = new Date().toDateString();
        const savedDate = await AsyncStorage.getItem("dailyGoalsDate");

        if (savedDate !== todayStr) {
            // New day - generate new goals
            setDailyGoals(selectedGoals);
            await AsyncStorage.setItem("dailyGoals", JSON.stringify(selectedGoals));
            await AsyncStorage.setItem("dailyGoalsDate", todayStr);
        }
    };

    const toggleGoal = async (goalId: string) => {
        const goal = dailyGoals.find(g => g.id === goalId);
        if (!goal || !surveyData) return;

        if (!goal.completed) {
            // Goal is being completed
            await StreakManager.logActivity('goal', { goalText: goal.text });
            loadStreakData();

            // Remove completed goal and generate a new one
            await replaceCompletedGoal(goalId);
            
            // Re-analyze patterns with updated completion data
            await analyzeWeightGainPatterns();
        } else {
            // Goal is being uncompleted - just toggle it back
            const updatedGoals = dailyGoals.map((g) =>
                g.id === goalId ? { ...g, completed: false } : g
            );
            setDailyGoals(updatedGoals);
            await AsyncStorage.setItem("dailyGoals", JSON.stringify(updatedGoals));
            
            // Re-analyze patterns with updated completion data
            await analyzeWeightGainPatterns();
        }
    };

    const replaceCompletedGoal = async (completedGoalId: string) => {
        if (!surveyData) return;

        // Get pool of available goals
        const availableGoals = getAvailableGoals();
        
        // Filter out goals that are too similar to current active goals
        const currentActiveGoals = dailyGoals.filter(g => g.id !== completedGoalId);
        const currentTexts = currentActiveGoals.map(g => g.text.toLowerCase());
        
        const newGoalOptions = availableGoals.filter(goal => 
            !currentTexts.some(currentText => 
                goal.toLowerCase().includes(currentText.split(' ').slice(0, 3).join(' ')) ||
                currentText.includes(goal.toLowerCase().split(' ').slice(0, 3).join(' '))
            )
        );

        if (newGoalOptions.length === 0) {
            // If no new options, just remove the completed goal
            const updatedGoals = dailyGoals.filter(g => g.id !== completedGoalId);
            setDailyGoals(updatedGoals);
            await AsyncStorage.setItem("dailyGoals", JSON.stringify(updatedGoals));
            return;
        }

        // Pick a random new goal
        const randomIndex = Math.floor(Math.random() * newGoalOptions.length);
        const newGoalText = newGoalOptions[randomIndex];
        
        // Create new goal with unique ID
        const newGoal = {
            id: String(Date.now()), // Use timestamp for unique ID
            text: newGoalText,
            completed: false,
        };

        // Replace completed goal with new one
        const updatedGoals = dailyGoals.map(g => 
            g.id === completedGoalId ? newGoal : g
        );

        setDailyGoals(updatedGoals);
        await AsyncStorage.setItem("dailyGoals", JSON.stringify(updatedGoals));

        // Show brief success message
        Alert.alert(
            "✅ Goal Complete!",
            `New recommendation: "${newGoalText}"`,
            [{ text: "Got it!", style: "default" }]
        );
    };

    const getAvailableGoals = (): string[] => {
        if (!surveyData) return [];

        const goalsByChallenge: { [key: string]: string[] } = {
            "Late-night snacking": [
                "Eat protein-rich dinner (keeps you full)",
                "Set a 'kitchen closed' time at 8pm",
                "Find one non-food evening activity",
                "Drink herbal tea instead of snacking",
                "Brush teeth after dinner to signal 'done eating'",
                "Go for a 10-minute walk after dinner",
                "Pack tomorrow's lunch tonight",
                "Do 10 minutes of stretching before bed",
                "Prepare a healthy evening snack for tomorrow",
                "Set up a morning routine to start strong",
                "Write down 3 things you're grateful for",
                "Plan a non-food evening activity for tomorrow",
                "Prep vegetables for easy snacking tomorrow",
            ],
            "Not feeling full": [
                "Add protein to every meal today",
                "Eat at least 2 servings of vegetables",
                "Drink water before feeling hungry",
                "Choose high-fiber foods (beans, oats)",
                "Eat slowly - put fork down between bites",
                "Add healthy fats (avocado, nuts)",
                "Eat a handful of nuts as afternoon snack",
                "Add chia seeds or flax to one meal",
                "Try eating with your non-dominant hand (slows you down)",
                "Drink a glass of water 20 minutes before dinner",
                "Add beans or lentils to one meal today",
                "Practice mindful eating for one meal",
                "Include healthy fats in every meal",
            ],
            "Eating when stressed/bored": [
                "Take a 5-min walk when stressed",
                "Call a friend instead of snacking",
                "Journal your feelings before eating",
                "Try deep breathing for 2 minutes",
                "Find a hobby that keeps hands busy",
                "Drink tea when bored instead of eating",
                "Create a 5-minute meditation routine",
                "Write in a journal for 10 minutes",
                "Call or text a friend when feeling stressed",
                "Take a photo of something beautiful today",
                "Do 20 jumping jacks when feeling bored",
                "Practice deep breathing for 3 minutes",
                "Listen to your favorite song when stressed",
            ],
            "Skipping meals then overeating": [
                "Eat breakfast within 1 hour of waking",
                "Set 3 meal reminders for today",
                "Prep a healthy snack for afternoon",
                "Don't skip lunch no matter how busy",
                "Keep emergency healthy snacks ready",
                "Eat every 3-4 hours to avoid extreme hunger",
                "Set 3 gentle meal reminders on your phone",
                "Prep a grab-and-go breakfast for tomorrow",
                "Pack healthy snacks in your bag/car",
                "Eat something within 30 minutes of waking",
                "Plan tomorrow's meals tonight",
                "Keep emergency healthy snacks at work",
                "Schedule eating like you would any important meeting",
            ],
            "Too many processed foods": [
                "Choose one whole food over processed",
                "Cook one meal from scratch",
                "Read ingredient labels before buying",
                "Shop the perimeter of grocery store",
                "Prep veggies for easy snacking",
                "Try one new whole food recipe",
                "Shop only the grocery store perimeter today",
                "Try one new fruit or vegetable",
                "Make a smoothie with whole ingredients",
                "Choose foods with 5 ingredients or less",
                "Cook one simple meal from scratch",
                "Replace one processed snack with nuts/fruit",
                "Read labels and avoid foods with added sugars",
            ],
        };

        return goalsByChallenge[surveyData.biggestChallenge] || [
            "Take a 15-minute walk outside",
            "Drink an extra glass of water",
            "Do 5 minutes of deep breathing",
            "Write down one thing you're proud of today",
            "Plan tomorrow's healthiest meal",
            "Try a new healthy recipe",
            "Call a friend or family member",
            "Take 10 deep breaths",
            "Stretch for 5 minutes",
            "Write down 3 things you're grateful for",
        ];
    };

    const generateNewGoals = async () => {
        if (!surveyData) return;
        
        // Get all available goals
        const availableGoals = getAvailableGoals();
        
        if (availableGoals.length < 3) {
            Alert.alert(
                "😊 You're doing amazing!",
                "You've tried so many recommendations today. Keep up the great work!",
                [{ text: "Thanks!", style: "default" }]
            );
            return;
        }

        // Generate 3 completely fresh goals
        const shuffled = availableGoals.sort(() => Math.random() - 0.5);
        const newGoals = shuffled.slice(0, 3).map((text, index) => ({
            id: String(Date.now() + index),
            text,
            completed: false,
        }));

        // Replace all current goals with 3 fresh ones
        setDailyGoals(newGoals);
        await AsyncStorage.setItem("dailyGoals", JSON.stringify(newGoals));
        
        // Show success message
        Alert.alert(
            "✨ Fresh Recommendations!",
            "Here are 3 new personalized goals for you!",
            [{ text: "Let's go!", style: "default" }]
        );
    };

    const handleLogout = () => {
        Alert.alert("Log Out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Log Out",
                style: "destructive",
                onPress: async () => {
                    await logout();
                    router.replace("/welcome");
                },
            },
        ]);
    };

    // Dynamic data - always use survey data for goals and calculations
    const userName = user?.name || "Jacob";
    // Only show data after survey is loaded to prevent showing default values
    const goalWeight = surveyData?.goalWeight ? Number(surveyData.goalWeight) : (dataInitialized ? 165 : 0);
    const weeklyChange = lastWeekWeight - currentWeight;
    const startingWeight = surveyData?.currentWeight ? Number(surveyData.currentWeight) : (dataInitialized ? 185 : 0);
    const progressPercent = goalWeight > 0 && startingWeight > 0 ? Math.min(100, Math.max(0, ((startingWeight - currentWeight) / (startingWeight - goalWeight)) * 100)) : 0;

    // Generate personalized insights based on survey data
    const getPersonalizedInsights = () => {
        const insights = [];

        // Check if user has completed any goals today
        const completedGoalsToday = dailyGoals.filter(g => g.completed).length;
        const hasWeightHistory = currentWeight !== (surveyData?.currentWeight ? Number(surveyData.currentWeight) : 180);

        // Primary insight based on their biggest challenge and current behavior
        if (surveyData?.biggestChallenge === "Late-night snacking") {
            if (completedGoalsToday === 0) {
                insights.push({
                    type: "warning",
                    icon: "🌙",
                    title: "Evening Preparation",
                    message: "Set yourself up for success tonight",
                    action: "Complete your goals to build evening discipline",
                });
            } else {
                insights.push({
                    type: "success",
                    icon: "💪",
                    title: "Building Evening Control",
                    message: `${completedGoalsToday}/3 goals done - you're creating better habits!`,
                    action: "Keep going to break the late-night cycle",
                });
            }
        } else if (surveyData?.biggestChallenge === "Not feeling full") {
            if (completedGoalsToday === 0) {
                insights.push({
                    type: "warning",
                    icon: "🍽️",
                    title: "Satiety Strategy",
                    message: "Your challenge is not feeling full after meals",
                    action: "Start with today's protein and fiber goals",
                });
            } else {
                insights.push({
                    type: "success",
                    icon: "😋",
                    title: "Satiety Building",
                    message: `${completedGoalsToday}/3 goals completed - improving fullness cues!`,
                    action: "Focus on protein and fiber at your next meal",
                });
            }
        } else if (surveyData?.biggestChallenge === "Eating when stressed/bored") {
            if (completedGoalsToday === 0) {
                insights.push({
                    type: "warning",
                    icon: "🧠",
                    title: "Mindful Eating Check",
                    message: "You identified stress/boredom eating as your challenge",
                    action: "Start with mindful habits - complete today's goals",
                });
            } else {
                insights.push({
                    type: "success",
                    icon: "🎯",
                    title: "Mindful Progress",
                    message: `${completedGoalsToday}/3 goals done - building awareness!`,
                    action: "Notice hunger vs. emotions before eating",
                });
            }
        } else {
            // Default for other challenges
            if (completedGoalsToday === 0) {
                insights.push({
                    type: "warning",
                    icon: "🎯",
                    title: "Start Your Day Right",
                    message: "Build momentum with small, achievable actions",
                    action: "Complete your first goal to get started",
                });
            } else {
                insights.push({
                    type: "success",
                    icon: "✨",
                    title: "Great Progress",
                    message: `${completedGoalsToday}/3 goals completed today!`,
                    action: "Keep the momentum going",
                });
            }
        }

        // Activity level insight based on survey and behavior
        if (surveyData?.activityLevel === "Sedentary (little to no exercise)") {
            if (currentStreak < 3) {
                insights.push({
                    type: "warning",
                    icon: "🚶",
                    title: "Movement Opportunity",
                    message: "You mentioned being sedentary - small steps count!",
                    action: "Try a 5-minute walk or complete an active goal",
                });
            } else {
                insights.push({
                    type: "success",
                    icon: "🔥",
                    title: "Building Activity Habits",
                    message: `${currentStreak} day streak - you're becoming more active!`,
                    action: "Keep building this momentum",
                });
            }
        } else if (surveyData?.activityLevel === "Lightly active") {
            insights.push({
                type: "success",
                icon: "💪",
                title: "Active Lifestyle",
                message: "Your light activity supports your weight goals",
                action: hasWeightHistory ? "Track progress with regular weigh-ins" : "Log your weight to track progress",
            });
        }

        // Weight tracking insight
        if (!hasWeightHistory) {
            insights.push({
                type: "warning",
                icon: "⚖️",
                title: "Track Your Progress",
                message: "You haven't logged your weight yet",
                action: "Go to Progress tab to start tracking",
            });
        }

        return insights.slice(0, 2); // Show max 2 insights to avoid clutter
    };

    const todayInsights = getPersonalizedInsights();

    // What you're lacking today
    const nutritionGaps = [
        {
            icon: "🥦",
            name: "Vegetables",
            current: 0,
            target: 3,
            unit: "servings",
        },
        { icon: "💧", name: "Water", current: 3, target: 8, unit: "cups" },
        { icon: "🌾", name: "Fiber", current: 8, target: 25, unit: "g" },
    ];

    // Generate personalized pattern insight
    const getPatternInsight = () => {
        if (surveyData?.mainReason === "Feel more energetic") {
            return {
                message:
                    "Your goal is energy! Focus on iron-rich foods and consistent meal timing",
                confidence: "Energy dips often come from skipped meals",
            };
        } else if (surveyData?.mainReason === "Keep up with my kids") {
            return {
                message:
                    "You're doing this for your kids! Meal prep on Sundays helps busy parents succeed",
                confidence: "Parents who plan ahead lose 2x more weight",
            };
        } else if (surveyData?.mainReason === "Health scare/concern") {
            return {
                message:
                    "Your health matters! Small consistent changes beat crash diets every time",
                confidence: "Sustainable habits = lasting results",
            };
        } else if (surveyData?.mainReason === "Feel confident again") {
            return {
                message:
                    "You deserve to feel amazing! Track non-scale wins like energy & mood too",
                confidence: "Confidence grows with every healthy choice",
            };
        }

        return {
            message: "You lose more weight on weeks with 4+ vegetable days",
            confidence: "Based on your last 6 weeks",
        };
    };

    const patternInsight = getPatternInsight();

    // Show loading screen while data initializes
    if (!dataInitialized) {
        return (
            <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>Loading your data...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={[styles.container, isDark && styles.containerDark]}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Text
                            style={[
                                styles.greeting,
                                isDark && styles.greetingDark,
                            ]}
                        >
                            Hey {userName}! 👋
                        </Text>
                        <Text
                            style={[
                                styles.subGreeting,
                                isDark && styles.subGreetingDark,
                            ]}
                        >
                            Let's tackle today together
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push("/notification-settings")}
                        style={styles.notificationButton}
                    >
                        <Text style={styles.notificationText}>🔔</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleLogout}
                        style={styles.logoutButton}
                    >
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>

                {/* Goal Progress - Weight at top */}
                <View style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                        <Text style={styles.goalLabel}>WEIGHT GOAL</Text>
                        <Text style={styles.streakText}>
                            🔥 {currentStreak} day streak
                        </Text>
                    </View>

                    <View style={styles.goalProgress}>
                        <View style={styles.goalNumbers}>
                            <View>
                                <Text style={styles.goalCurrent}>
                                    {currentWeight}
                                </Text>
                                <Text style={styles.goalUnit}>Current</Text>
                            </View>
                            <Text style={styles.goalArrow}>→</Text>
                            <View>
                                <Text style={styles.goalTarget}>
                                    {goalWeight}
                                </Text>
                                <Text style={styles.goalUnit}>Goal</Text>
                            </View>
                        </View>

                        <View style={styles.progressBarContainer}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${progressPercent}%` },
                                ]}
                            />
                        </View>

                        <Text style={styles.goalRemaining}>
                            {Math.max(0, currentWeight - goalWeight)} lbs to go • You're {Math.round(progressPercent)}%
                            there! 💪
                        </Text>
                    </View>
                </View>



                {/* Daily Micro-Goals */}
                <View style={styles.microGoalsCard}>
                    <Text
                        style={[
                            styles.microGoalsTitle,
                            isDark && styles.microGoalsTitleDark,
                        ]}
                    >
                        🎯 Today's Action Plan
                    </Text>
                    <Text
                        style={[
                            styles.microGoalsSubtitle,
                            isDark && styles.microGoalsSubtitleDark,
                        ]}
                    >
                        Small steps, big results
                    </Text>

                    {dailyGoals.map((goal) => (
                        <TouchableOpacity
                            key={goal.id}
                            style={[
                                styles.goalCheckbox,
                                goal.completed && styles.goalCheckboxCompleted,
                                isDark && styles.goalCheckboxDark,
                            ]}
                            onPress={() => toggleGoal(goal.id)}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    goal.completed && styles.checkboxCompleted,
                                ]}
                            >
                                {goal.completed && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </View>
                            <Text
                                style={[
                                    styles.goalText,
                                    goal.completed && styles.goalTextCompleted,
                                    isDark && styles.goalTextDark,
                                ]}
                            >
                                {goal.text}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    <View style={styles.microGoalProgressContainer}>
                        <View style={styles.microGoalProgressBar}>
                            <View
                                style={[
                                    styles.microGoalProgressFill,
                                    {
                                        width: `${(dailyGoals.filter((g) => g.completed).length / dailyGoals.length) * 100}%`,
                                    },
                                ]}
                            />
                        </View>
                        <Text
                            style={[
                                styles.microGoalProgressText,
                                isDark && styles.microGoalProgressTextDark,
                            ]}
                        >
                            {dailyGoals.filter((g) => g.completed).length} of{" "}
                            {dailyGoals.length} completed
                        </Text>
                    </View>

                    {/* Get More Goals Button */}
                    <TouchableOpacity
                        style={styles.moreGoalsButton}
                        onPress={generateNewGoals}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.moreGoalsButtonText}>
                            🔄 Refresh All Goals
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* What's Making You Gain Weight - Deep Analysis */}
                {weightGainAnalysis && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text
                                style={[
                                    styles.sectionTitle,
                                    isDark && styles.sectionTitleDark,
                                ]}
                            >
                                🎯 What's Making You Gain Weight
                            </Text>
                            <Text style={[
                                styles.confidenceText,
                                isDark && styles.confidenceTextDark,
                            ]}>
                                {weightGainAnalysis.confidenceLevel}% confidence based on your data
                            </Text>
                        </View>

                        {/* Primary Weight Gain Causes */}
                        {weightGainAnalysis.primaryCauses.slice(0, 2).map((cause, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.weightGainCard,
                                    cause.severity === 'high' && styles.weightGainHigh,
                                    cause.severity === 'medium' && styles.weightGainMedium,
                                    isDark && styles.weightGainCardDark,
                                ]}
                            >
                                <View style={styles.weightGainHeader}>
                                    <View style={styles.weightGainTitleRow}>
                                        <Text style={[
                                            styles.severityBadge,
                                            cause.severity === 'high' ? styles.severityHigh : styles.severityMedium
                                        ]}>
                                            {cause.severity === 'high' ? '🔴 HIGH IMPACT' : '🟡 MEDIUM IMPACT'}
                                        </Text>
                                    </View>
                                    <Text style={[
                                        styles.weightGainTitle,
                                        isDark && styles.weightGainTitleDark,
                                    ]}>
                                        {cause.description}
                                    </Text>
                                    <Text style={[
                                        styles.weightGainImpact,
                                        isDark && styles.weightGainImpactDark,
                                    ]}>
                                        {cause.impact}
                                    </Text>
                                </View>
                                
                                <View style={styles.recommendationsContainer}>
                                    <Text style={[
                                        styles.recommendationsTitle,
                                        isDark && styles.recommendationsTitleDark,
                                    ]}>
                                        💡 Action Steps:
                                    </Text>
                                    {cause.recommendations.slice(0, 2).map((rec, recIndex) => (
                                        <TouchableOpacity
                                            key={recIndex}
                                            style={styles.recommendationButton}
                                            onPress={() => {
                                                // Track that user engaged with recommendation
                                                WeightGainAnalyzer.trackBehaviorChange(cause.type, true);
                                            }}
                                        >
                                            <Text style={styles.recommendationText}>
                                                • {rec}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}

                        {/* Personalized Insights from Analysis */}
                        {weightGainAnalysis.personalizedInsights.length > 0 && (
                            <View style={[
                                styles.analysisInsightCard,
                                isDark && styles.analysisInsightCardDark,
                            ]}>
                                <Text style={[
                                    styles.analysisInsightTitle,
                                    isDark && styles.analysisInsightTitleDark,
                                ]}>
                                    🧠 Your Personal Pattern
                                </Text>
                                {weightGainAnalysis.personalizedInsights.map((insight, index) => (
                                    <Text
                                        key={index}
                                        style={[
                                            styles.analysisInsightText,
                                            isDark && styles.analysisInsightTextDark,
                                        ]}
                                    >
                                        {insight}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </>
                )}

                {/* Today's Insights - What's affecting your weight */}
                <View style={styles.sectionHeader}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            isDark && styles.sectionTitleDark,
                        ]}
                    >
                        📊 Daily Progress Check
                    </Text>
                </View>

                {todayInsights.map((insight, index) => (
                    <View
                        key={index}
                        style={[
                            styles.insightCard,
                            insight.type === "warning" && styles.insightWarning,
                            insight.type === "success" && styles.insightSuccess,
                            isDark && styles.insightCardDark,
                        ]}
                    >
                        <Text style={styles.insightIcon}>{insight.icon}</Text>
                        <View style={styles.insightContent}>
                            <Text
                                style={[
                                    styles.insightTitle,
                                    isDark && styles.insightTitleDark,
                                ]}
                            >
                                {insight.title}
                            </Text>
                            <Text
                                style={[
                                    styles.insightMessage,
                                    isDark && styles.insightMessageDark,
                                ]}
                            >
                                {insight.message}
                            </Text>
                            {insight.action && (
                                <TouchableOpacity
                                    style={styles.insightActionButton}
                                >
                                    <Text style={styles.insightActionText}>
                                        ✓ {insight.action}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}

                {/* Pattern Insight */}
                <View
                    style={[
                        styles.patternCard,
                        isDark && styles.patternCardDark,
                    ]}
                >
                    <Text style={styles.patternIcon}>🧠</Text>
                    <View style={styles.patternContent}>
                        <Text
                            style={[
                                styles.patternTitle,
                                isDark && styles.patternTitleDark,
                            ]}
                        >
                            Your Pattern
                        </Text>
                        <Text
                            style={[
                                styles.patternMessage,
                                isDark && styles.patternMessageDark,
                            ]}
                        >
                            {patternInsight.message}
                        </Text>
                        <Text style={styles.patternConfidence}>
                            {patternInsight.confidence}
                        </Text>
                    </View>
                </View>

                {/* Challenge-Specific Action Hub */}
                <View style={styles.sectionHeader}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            isDark && styles.sectionTitleDark,
                        ]}
                    >
                        🛠️ Tools for Your Challenge
                    </Text>
                </View>

                <View style={styles.actionGrid}>
                    {/* Dynamic actions based on user's biggest challenge */}
                    {surveyData?.biggestChallenge === "Late-night snacking" && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionCard, styles.actionCardEvening]}
                                activeOpacity={0.8}
                                onPress={() => {
                                    Alert.alert(
                                        "Evening Success Kit 🌙",
                                        "• Set kitchen closed time at 8pm\n• Prep herbal tea for cravings\n• Plan non-food evening activity\n• Brush teeth after dinner",
                                        [{ text: "Got it!", style: "default" }]
                                    );
                                }}
                            >
                                <Text style={styles.actionCardIcon}>🌙</Text>
                                <Text style={styles.actionCardTitle}>Evening Kit</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.actionCard, styles.actionCardCraving]}
                                activeOpacity={0.8}
                                onPress={() => {
                                    Alert.alert(
                                        "Craving Emergency 🚨",
                                        "Before you eat, try:\n• Drink a full glass of water\n• Wait 10 minutes\n• Do 5 deep breaths\n• Ask: Am I actually hungry?",
                                        [{ text: "I'll try this", style: "default" }]
                                    );
                                }}
                            >
                                <Text style={styles.actionCardIcon}>🚨</Text>
                                <Text style={styles.actionCardTitle}>Craving SOS</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    
                    {surveyData?.biggestChallenge === "Not feeling full" && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionCard, styles.actionCardSatiety]}
                                activeOpacity={0.8}
                                onPress={() => {
                                    Alert.alert(
                                        "Fullness Boosters 🍽️",
                                        "Add these to your next meal:\n• 20g protein (size of palm)\n• 2 cups vegetables\n• 1 tbsp healthy fat\n• Eat slowly, put fork down",
                                        [{ text: "Will do!", style: "default" }]
                                    );
                                }}
                            >
                                <Text style={styles.actionCardIcon}>🍽️</Text>
                                <Text style={styles.actionCardTitle}>Fullness Tips</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.actionCard, styles.actionCardMindful]}
                                activeOpacity={0.8}
                                onPress={() => {
                                    Alert.alert(
                                        "Mindful Eating 🧘‍♀️",
                                        "Try this at your next meal:\n• Put phone away\n• Chew each bite 15 times\n• Check hunger halfway through\n• Stop when 80% full",
                                        [{ text: "I'll practice this", style: "default" }]
                                    );
                                }}
                            >
                                <Text style={styles.actionCardIcon}>🧘‍♀️</Text>
                                <Text style={styles.actionCardTitle}>Mindful Eating</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    
                    {surveyData?.biggestChallenge === "Eating when stressed/bored" && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionCard, styles.actionCardStress]}
                                activeOpacity={0.8}
                                onPress={() => {
                                    Alert.alert(
                                        "Stress Relief Toolkit 🧠",
                                        "Instead of eating, try:\n• 5-minute walk\n• Call a friend\n• Deep breathing (4-7-8)\n• Journal 3 sentences",
                                        [{ text: "Great ideas!", style: "default" }]
                                    );
                                }}
                            >
                                <Text style={styles.actionCardIcon}>🧠</Text>
                                <Text style={styles.actionCardTitle}>Stress Relief</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.actionCard, styles.actionCardBoredom]}
                                activeOpacity={0.8}
                                onPress={() => {
                                    Alert.alert(
                                        "Boredom Busters 🎯",
                                        "Keep hands busy with:\n• Adult coloring book\n• Knitting or crafts\n• Organize one drawer\n• Text a friend",
                                        [{ text: "Perfect!", style: "default" }]
                                    );
                                }}
                            >
                                <Text style={styles.actionCardIcon}>🎯</Text>
                                <Text style={styles.actionCardTitle}>Boredom Fix</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    
                    {/* Universal helpful actions */}
                    <TouchableOpacity
                        style={[styles.actionCard, styles.actionCardRestaurant]}
                        activeOpacity={0.8}
                        onPress={async () => {
                            await StreakManager.logActivity('restaurant');
                            router.push("/restaurant-finder");
                        }}
                    >
                        <Text style={styles.actionCardIcon}>🍽️</Text>
                        <Text style={styles.actionCardTitle}>Healthy Restaurants</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, styles.actionCardPlan]}
                        activeOpacity={0.8}
                        onPress={async () => {
                            await StreakManager.logActivity('swap');
                            router.push("/smart-swaps");
                        }}
                    >
                        <Text style={styles.actionCardIcon}>🔄</Text>
                        <Text style={styles.actionCardTitle}>Smart Swaps</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, styles.actionCardNotifications]}
                        activeOpacity={0.8}
                        onPress={() => router.push("/notification-settings")}
                    >
                        <Text style={styles.actionCardIcon}>🔔</Text>
                        <Text style={styles.actionCardTitle}>Notifications</Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom spacing */}
                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    containerDark: {
        backgroundColor: "#0A0A0A",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 20,
        marginTop: 8,
    },
    greeting: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#1F2937",
        marginBottom: 4,
    },
    greetingDark: {
        color: "#FFFFFF",
    },
    subGreeting: {
        fontSize: 16,
        color: "#6B7280",
    },
    subGreetingDark: {
        color: "#9BA1A6",
    },
    weightBadge: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 12,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    weightText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1F2937",
        textAlign: "center",
    },
    weightChange: {
        fontSize: 12,
        color: "#10B981",
        textAlign: "center",
        marginTop: 2,
        fontWeight: "600",
    },
    primaryButton: {
        backgroundColor: "#8B5CF6",
        borderRadius: 20,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    primaryButtonIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    primaryButtonContent: {
        flex: 1,
    },
    primaryButtonTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    primaryButtonSubtitle: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.85)",
    },
    primaryButtonArrow: {
        fontSize: 24,
        color: "#FFFFFF",
        marginLeft: 12,
    },
    goalCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    goalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    goalLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#6B7280",
        letterSpacing: 1,
    },
    streakText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#F59E0B",
    },
    goalProgress: {
        gap: 16,
    },
    goalNumbers: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
    },
    goalCurrent: {
        fontSize: 48,
        fontWeight: "bold",
        color: "#1F2937",
        textAlign: "center",
    },
    goalTarget: {
        fontSize: 48,
        fontWeight: "bold",
        color: "#10B981",
        textAlign: "center",
    },
    goalUnit: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        marginTop: 4,
    },
    goalArrow: {
        fontSize: 32,
        color: "#9CA3AF",
    },
    progressBarContainer: {
        height: 12,
        backgroundColor: "#E5E7EB",
        borderRadius: 6,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#10B981",
        borderRadius: 6,
    },
    goalRemaining: {
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
        fontWeight: "500",
    },
    sectionHeader: {
        marginBottom: 12,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1F2937",
    },
    sectionTitleDark: {
        color: "#FFFFFF",
    },
    insightCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    insightCardDark: {
        backgroundColor: "#1F2937",
    },
    insightWarning: {
        borderLeftWidth: 4,
        borderLeftColor: "#F59E0B",
    },
    insightSuccess: {
        borderLeftWidth: 4,
        borderLeftColor: "#10B981",
    },
    insightIcon: {
        fontSize: 28,
        marginRight: 12,
    },
    insightContent: {
        flex: 1,
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 4,
    },
    insightTitleDark: {
        color: "#FFFFFF",
    },
    insightMessage: {
        fontSize: 14,
        color: "#6B7280",
        lineHeight: 20,
        marginBottom: 8,
    },
    insightMessageDark: {
        color: "#9CA3AF",
    },
    insightActionButton: {
        backgroundColor: "#F3F4F6",
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignSelf: "flex-start",
    },
    insightActionText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#8B5CF6",
    },
    gapsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    gapsCardDark: {
        backgroundColor: "#1F2937",
    },
    gapItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
    },
    gapIcon: {
        fontSize: 32,
        marginRight: 12,
        width: 40,
    },
    gapContent: {
        flex: 1,
    },
    gapName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 6,
    },
    gapNameDark: {
        color: "#FFFFFF",
    },
    gapProgressBar: {
        height: 8,
        backgroundColor: "#E5E7EB",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 4,
    },
    gapProgressFill: {
        height: "100%",
        borderRadius: 4,
    },
    gapNumbers: {
        fontSize: 13,
        color: "#6B7280",
        fontWeight: "500",
    },
    gapNumbersDark: {
        color: "#9CA3AF",
    },
    patternCard: {
        backgroundColor: "#EEF2FF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        flexDirection: "row",
        borderWidth: 1,
        borderColor: "#C7D2FE",
    },
    patternCardDark: {
        backgroundColor: "#1E3A5F",
        borderColor: "#3B82F6",
    },
    patternIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    patternContent: {
        flex: 1,
    },
    patternTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#4F46E5",
        marginBottom: 6,
    },
    patternTitleDark: {
        color: "#93C5FD",
    },
    patternMessage: {
        fontSize: 14,
        color: "#1F2937",
        fontWeight: "600",
        marginBottom: 4,
        lineHeight: 20,
    },
    patternMessageDark: {
        color: "#E0E7FF",
    },
    patternConfidence: {
        fontSize: 12,
        color: "#6B7280",
        fontStyle: "italic",
    },
    actionGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 20,
    },
    actionCard: {
        width: "48%",
        aspectRatio: 1,
        borderRadius: 16,
        padding: 16,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    actionCardWin: {
        backgroundColor: "#F3E8FF",
    },
    actionCardRestaurant: {
        backgroundColor: "#D1FAE5",
    },
    actionCardPlan: {
        backgroundColor: "#FCE7F3",
    },
    actionCardNotifications: {
        backgroundColor: "#E0E7FF",
    },
    actionCardIcon: {
        fontSize: 40,
        marginBottom: 12,
    },
    actionCardTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1F2937",
        textAlign: "center",
    },
    notificationButton: {
        backgroundColor: "#374151",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 8,
    },
    notificationText: {
        fontSize: 18,
    },
    logoutButton: {
        backgroundColor: "#374151",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    logoutText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#EF4444",
    },
    microGoalsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    microGoalsTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1F2937",
        marginBottom: 4,
    },
    microGoalsTitleDark: {
        color: "#FFFFFF",
    },
    microGoalsSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 16,
    },
    microGoalsSubtitleDark: {
        color: "#9CA3AF",
    },
    goalCheckbox: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: "transparent",
    },
    goalCheckboxDark: {
        backgroundColor: "#1F2937",
    },
    goalCheckboxCompleted: {
        backgroundColor: "#ECFDF5",
        borderColor: "#10B981",
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#D1D5DB",
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxCompleted: {
        backgroundColor: "#10B981",
        borderColor: "#10B981",
    },
    checkmark: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "bold",
    },
    goalText: {
        fontSize: 15,
        color: "#1F2937",
        flex: 1,
        lineHeight: 20,
    },
    goalTextDark: {
        color: "#E5E7EB",
    },
    goalTextCompleted: {
        color: "#6B7280",
        textDecorationLine: "line-through",
    },
    microGoalProgressContainer: {
        marginTop: 8,
    },
    microGoalProgressBar: {
        height: 8,
        backgroundColor: "#E5E7EB",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 8,
    },
    microGoalProgressFill: {
        height: "100%",
        backgroundColor: "#10B981",
        borderRadius: 4,
    },
    microGoalProgressText: {
        fontSize: 13,
        color: "#6B7280",
        textAlign: "center",
        fontWeight: "600",
    },
    microGoalProgressTextDark: {
        color: "#9CA3AF",
    },
    smallStepsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    smallStepsTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1F2937",
        marginBottom: 4,
    },
    smallStepsSubtitle: {
        fontSize: 14,
        color: "#10B981",
        fontWeight: "600",
        marginBottom: 16,
    },
    smallStepsGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    smallStepItem: {
        flex: 1,
        alignItems: "center",
        padding: 12,
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        marginHorizontal: 4,
    },
    smallStepNumber: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#8B5CF6",
        marginBottom: 4,
    },
    smallStepLabel: {
        fontSize: 11,
        color: "#6B7280",
        textAlign: "center",
    },
    smallStepsTip: {
        fontSize: 13,
        color: "#6B7280",
        textAlign: "center",
        fontStyle: "italic",
    },
    moreGoalsButton: {
        backgroundColor: "#8B5CF6",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 16,
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    moreGoalsButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    
    // Weight Gain Analysis Styles
    confidenceText: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 4,
        fontStyle: "italic",
    },
    confidenceTextDark: {
        color: "#9CA3AF",
    },
    weightGainCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    weightGainCardDark: {
        backgroundColor: "#1F2937",
        borderColor: "#374151",
    },
    weightGainHigh: {
        borderLeftWidth: 4,
        borderLeftColor: "#EF4444",
    },
    weightGainMedium: {
        borderLeftWidth: 4,
        borderLeftColor: "#F59E0B",
    },
    weightGainHeader: {
        marginBottom: 12,
    },
    weightGainTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    severityBadge: {
        fontSize: 10,
        fontWeight: "700",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: "hidden",
    },
    severityHigh: {
        backgroundColor: "#FEE2E2",
        color: "#DC2626",
    },
    severityMedium: {
        backgroundColor: "#FEF3C7",
        color: "#D97706",
    },
    weightGainTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 8,
        textTransform: "capitalize",
    },
    weightGainTitleDark: {
        color: "#F9FAFB",
    },
    weightGainImpact: {
        fontSize: 14,
        color: "#4B5563",
        lineHeight: 20,
        marginBottom: 4,
    },
    weightGainImpactDark: {
        color: "#D1D5DB",
    },
    recommendationsContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    recommendationsTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 8,
    },
    recommendationsTitleDark: {
        color: "#F9FAFB",
    },
    recommendationButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginVertical: 2,
        backgroundColor: "#F3F4F6",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    recommendationText: {
        fontSize: 13,
        color: "#374151",
        lineHeight: 18,
    },
    analysisInsightCard: {
        backgroundColor: "#EBF8FF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },
    analysisInsightCardDark: {
        backgroundColor: "#1E3A8A",
        borderColor: "#3B82F6",
    },
    analysisInsightTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E40AF",
        marginBottom: 8,
    },
    analysisInsightTitleDark: {
        color: "#DBEAFE",
    },
    analysisInsightText: {
        fontSize: 14,
        color: "#1E40AF",
        lineHeight: 20,
        marginBottom: 4,
    },
    analysisInsightTextDark: {
        color: "#BFDBFE",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#6B7280",
    },
    loadingTextDark: {
        color: "#9CA3AF",
    },
    
    // Daily Focus Card Styles
    dailyFocusCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: "#8B5CF6",
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    dailyFocusTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#7C3AED",
        marginBottom: 8,
    },
    dailyFocusSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 16,
        lineHeight: 20,
    },
    focusProgress: {
        marginBottom: 12,
    },
    focusProgressBar: {
        height: 8,
        backgroundColor: "#E5E7EB",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 8,
    },
    focusProgressFill: {
        height: "100%",
        backgroundColor: "#8B5CF6",
        borderRadius: 4,
    },
    focusProgressText: {
        fontSize: 12,
        color: "#6B7280",
        textAlign: "center",
        fontWeight: "500",
    },
    focusMotivation: {
        fontSize: 14,
        color: "#7C3AED",
        fontWeight: "600",
        textAlign: "center",
        fontStyle: "italic",
    },
    
    // Challenge-specific action card styles
    actionCardEvening: {
        backgroundColor: "#1E1B4B",
    },
    actionCardCraving: {
        backgroundColor: "#991B1B",
    },
    actionCardSatiety: {
        backgroundColor: "#064E3B",
    },
    actionCardMindful: {
        backgroundColor: "#7C2D12",
    },
    actionCardStress: {
        backgroundColor: "#1E3A8A",
    },
    actionCardBoredom: {
        backgroundColor: "#581C87",
    },
});
