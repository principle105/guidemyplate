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

    // Load survey data on mount
    useEffect(() => {
        loadSurveyData();
        loadDailyGoals();
    }, []);

    const loadSurveyData = async () => {
        try {
            const data = await AsyncStorage.getItem("surveyData");
            if (data) {
                const parsed = JSON.parse(data);
                setSurveyData(parsed);
                // Generate goals when survey data loads
                generateDailyGoals(parsed);
            }
        } catch (error) {
            console.error("Error loading survey data:", error);
        }
    };

    const loadDailyGoals = async () => {
        try {
            const today = new Date().toDateString();
            const savedGoals = await AsyncStorage.getItem("dailyGoals");
            const savedDate = await AsyncStorage.getItem("dailyGoalsDate");

            if (savedGoals && savedDate === today) {
                setDailyGoals(JSON.parse(savedGoals));
            }
        } catch (error) {
            console.error("Error loading daily goals:", error);
        }
    };

    const generateDailyGoals = async (data: SurveyData) => {
        const goals = [];

        // Goal based on biggest challenge
        if (data.biggestChallenge === "Late-night snacking") {
            goals.push({
                id: "1",
                text: "Eat protein-rich dinner (keeps you full)",
                completed: false,
            });
            goals.push({
                id: "2",
                text: "Set a 'kitchen closed' time at 8pm",
                completed: false,
            });
            goals.push({
                id: "3",
                text: "Find one non-food evening activity",
                completed: false,
            });
        } else if (data.biggestChallenge === "Not feeling full") {
            goals.push({
                id: "1",
                text: "Add protein to every meal today",
                completed: false,
            });
            goals.push({
                id: "2",
                text: "Eat at least 2 servings of vegetables",
                completed: false,
            });
            goals.push({
                id: "3",
                text: "Drink water before feeling hungry",
                completed: false,
            });
        } else if (data.biggestChallenge === "Eating when stressed/bored") {
            goals.push({
                id: "1",
                text: "Take a 5-min walk when stressed",
                completed: false,
            });
            goals.push({
                id: "2",
                text: "Call a friend instead of snacking",
                completed: false,
            });
            goals.push({
                id: "3",
                text: "Journal your feelings before eating",
                completed: false,
            });
        } else if (data.biggestChallenge === "Skipping meals then overeating") {
            goals.push({
                id: "1",
                text: "Eat breakfast within 1 hour of waking",
                completed: false,
            });
            goals.push({
                id: "2",
                text: "Set 3 meal reminders for today",
                completed: false,
            });
            goals.push({
                id: "3",
                text: "Prep a healthy snack for afternoon",
                completed: false,
            });
        } else if (data.biggestChallenge === "Too many processed foods") {
            goals.push({
                id: "1",
                text: "Choose one whole food over processed",
                completed: false,
            });
            goals.push({
                id: "2",
                text: "Cook one meal from scratch",
                completed: false,
            });
            goals.push({
                id: "3",
                text: "Read ingredient labels before buying",
                completed: false,
            });
        } else {
            // Default goals
            goals.push({
                id: "1",
                text: "Log all your meals today",
                completed: false,
            });
            goals.push({
                id: "2",
                text: "Drink 8 cups of water",
                completed: false,
            });
            goals.push({
                id: "3",
                text: "Take a 10-minute walk",
                completed: false,
            });
        }

        setDailyGoals(goals);
        
        // Save goals with today's date
        const today = new Date().toDateString();
        await AsyncStorage.setItem("dailyGoals", JSON.stringify(goals));
        await AsyncStorage.setItem("dailyGoalsDate", today);
    };

    const toggleGoal = async (goalId: string) => {
        const updatedGoals = dailyGoals.map((goal) =>
            goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
        );
        setDailyGoals(updatedGoals);
        await AsyncStorage.setItem("dailyGoals", JSON.stringify(updatedGoals));

        // Check if all goals completed
        const allCompleted = updatedGoals.every((g) => g.completed);
        if (allCompleted) {
            Alert.alert(
                "🎉 Amazing Work!",
                "You crushed all your goals today! This is how lasting change happens.",
                [{ text: "Keep Going!", style: "default" }]
            );
        }
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

    // Dynamic data - use survey data if available
    const userName = user?.name || "Jacob";
    const currentWeight = surveyData
        ? Number(surveyData.currentWeight)
        : 185;
    const goalWeight = surveyData ? Number(surveyData.goalWeight) : 165;
    const weeklyChange = -2.3;
    const streakDays = 12;

    // Generate personalized insights based on survey data
    const getPersonalizedInsights = () => {
        const insights = [];

        // Insight based on biggest challenge
        if (surveyData?.biggestChallenge === "Late-night snacking") {
            insights.push({
                type: "warning",
                icon: "🌙",
                title: "Night Eating Alert",
                message:
                    "You mentioned late-night snacking is your challenge",
                action: "Try eating more protein at dinner to reduce cravings",
            });
        } else if (surveyData?.biggestChallenge === "Not feeling full") {
            insights.push({
                type: "warning",
                icon: "😋",
                title: "Satiety Tip",
                message: "Focus on high-fiber, high-protein foods today",
                action: "Add beans, Greek yogurt, or eggs to your meals",
            });
        } else if (
            surveyData?.biggestChallenge === "Eating when stressed/bored"
        ) {
            insights.push({
                type: "warning",
                icon: "😰",
                title: "Stress Eating Check-In",
                message: "Notice if you're truly hungry or just stressed",
                action: "Try a 5-minute walk before reaching for food",
            });
        } else {
            insights.push({
                type: "warning",
                icon: "⚠️",
                title: "Low Fiber Alert",
                message: "Only 8g fiber today — this can increase hunger",
                action: "Add vegetables or beans to dinner",
            });
        }

        // Insight based on eating pattern
        if (surveyData?.eatingPattern === "Night eater (most calories after 6pm)") {
            insights.push({
                type: "success",
                icon: "🌅",
                title: "Morning Strategy",
                message: "Eat a bigger breakfast to reduce nighttime hunger",
                action: null,
            });
        } else if (surveyData?.eatingPattern === "Skipper (skip meals often)") {
            insights.push({
                type: "warning",
                icon: "⏭️",
                title: "Don't Skip Meals",
                message: "Skipping leads to overeating later",
                action: "Set 3 meal reminders for today",
            });
        } else {
            insights.push({
                type: "success",
                icon: "✨",
                title: "Great Protein!",
                message: "You hit 95g protein — this keeps you full longer",
                action: null,
            });
        }

        return insights;
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
                        onPress={handleLogout}
                        style={styles.logoutButton}
                    >
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
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
                </View>

                {/* Goal Progress */}
                <View style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                        <Text style={styles.goalLabel}>WEIGHT GOAL</Text>
                        <Text style={styles.streakText}>
                            🔥 {streakDays} day streak
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
                                    { width: "60%" },
                                ]}
                            />
                        </View>

                        <Text style={styles.goalRemaining}>
                            {currentWeight - goalWeight} lbs to go • You're 60%
                            there! 💪
                        </Text>
                    </View>
                </View>

                {/* Today's Insights - What's affecting your weight */}
                <View style={styles.sectionHeader}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            isDark && styles.sectionTitleDark,
                        ]}
                    >
                        🎯 Today's Insights
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

                {/* Quick Actions Grid */}
                <View style={styles.sectionHeader}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            isDark && styles.sectionTitleDark,
                        ]}
                    >
                        ⚡ Quick Actions
                    </Text>
                </View>

                <View style={styles.actionGrid}>
                    <TouchableOpacity
                        style={[styles.actionCard, styles.actionCardWeight]}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionCardIcon}>⚖️</Text>
                        <Text style={styles.actionCardTitle}>Log Weight</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, styles.actionCardWin]}
                        activeOpacity={0.8}
                        onPress={() => router.push("/daily-win")}
                    >
                        <Text style={styles.actionCardIcon}>🎉</Text>
                        <Text style={styles.actionCardTitle}>
                            Today's Win
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, styles.actionCardSwap]}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionCardIcon}>🔄</Text>
                        <Text style={styles.actionCardTitle}>Smart Swaps</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, styles.actionCardPlan]}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionCardIcon}>📋</Text>
                        <Text style={styles.actionCardTitle}>My Plans</Text>
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
    actionCardWeight: {
        backgroundColor: "#DBEAFE",
    },
    actionCardWin: {
        backgroundColor: "#F3E8FF",
    },
    actionCardSwap: {
        backgroundColor: "#FEF3C7",
    },
    actionCardPlan: {
        backgroundColor: "#FCE7F3",
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
});
