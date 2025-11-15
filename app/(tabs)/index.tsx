import { useColorScheme } from "@/hooks/use-color-scheme";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function HomeTab() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    // Dynamic data - could be fetched from state/API
    const userName = "Jacob";
    const currentWeight = 185;
    const goalWeight = 165;
    const weeklyChange = -2.3;
    const streakDays = 12;

    // Today's insights
    const todayInsights = [
        {
            type: "warning",
            icon: "⚠️",
            title: "Low Fiber Alert",
            message: "Only 8g fiber today — this can increase hunger",
            action: "Add vegetables or beans to dinner",
        },
        {
            type: "success",
            icon: "✨",
            title: "Great Protein!",
            message: "You hit 95g protein — this keeps you full longer",
            action: null,
        },
    ];

    // What you're lacking today
    const nutritionGaps = [
        { icon: "🥦", name: "Vegetables", current: 0, target: 3, unit: "servings" },
        { icon: "💧", name: "Water", current: 3, target: 8, unit: "cups" },
        { icon: "🌾", name: "Fiber", current: 8, target: 25, unit: "g" },
    ];

    // Pattern insights
    const patternInsight = {
        message: "You lose more weight on weeks with 4+ vegetable days",
        confidence: "Based on your last 6 weeks",
    };

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
                    <View>
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
                    <TouchableOpacity style={styles.weightBadge}>
                        <Text style={styles.weightText}>{currentWeight} lbs</Text>
                        <Text style={styles.weightChange}>
                            {weeklyChange > 0 ? "+" : ""}{weeklyChange} this week
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Quick Log Meal Button - Make it prominent */}
                <TouchableOpacity
                    style={styles.primaryButton}
                    activeOpacity={0.8}
                >
                    <Text style={styles.primaryButtonIcon}>📸</Text>
                    <View style={styles.primaryButtonContent}>
                        <Text style={styles.primaryButtonTitle}>Log Your Meal</Text>
                        <Text style={styles.primaryButtonSubtitle}>
                            Quick snap or manual entry
                        </Text>
                    </View>
                    <Text style={styles.primaryButtonArrow}>→</Text>
                </TouchableOpacity>

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
                                <Text style={styles.goalCurrent}>{currentWeight}</Text>
                                <Text style={styles.goalUnit}>Current</Text>
                            </View>
                            <Text style={styles.goalArrow}>→</Text>
                            <View>
                                <Text style={styles.goalTarget}>{goalWeight}</Text>
                                <Text style={styles.goalUnit}>Goal</Text>
                            </View>
                        </View>
                        
                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBarFill, { width: "60%" }]} />
                        </View>
                        
                        <Text style={styles.goalRemaining}>
                            {currentWeight - goalWeight} lbs to go • You're 60% there! 💪
                        </Text>
                    </View>
                </View>

                {/* Today's Insights - What's affecting your weight */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
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
                            <Text style={[styles.insightTitle, isDark && styles.insightTitleDark]}>
                                {insight.title}
                            </Text>
                            <Text style={[styles.insightMessage, isDark && styles.insightMessageDark]}>
                                {insight.message}
                            </Text>
                            {insight.action && (
                                <TouchableOpacity style={styles.insightActionButton}>
                                    <Text style={styles.insightActionText}>
                                        ✓ {insight.action}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}

                {/* What You're Lacking */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                        🥗 What You're Missing Today
                    </Text>
                </View>

                <View style={[styles.gapsCard, isDark && styles.gapsCardDark]}>
                    {nutritionGaps.map((gap, index) => (
                        <View key={index} style={styles.gapItem}>
                            <Text style={styles.gapIcon}>{gap.icon}</Text>
                            <View style={styles.gapContent}>
                                <Text style={[styles.gapName, isDark && styles.gapNameDark]}>
                                    {gap.name}
                                </Text>
                                <View style={styles.gapProgressBar}>
                                    <View
                                        style={[
                                            styles.gapProgressFill,
                                            {
                                                width: `${(gap.current / gap.target) * 100}%`,
                                                backgroundColor:
                                                    gap.current >= gap.target
                                                        ? "#10B981"
                                                        : gap.current >= gap.target * 0.5
                                                        ? "#F59E0B"
                                                        : "#EF4444",
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.gapNumbers, isDark && styles.gapNumbersDark]}>
                                    {gap.current}/{gap.target} {gap.unit}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Pattern Insight */}
                <View style={[styles.patternCard, isDark && styles.patternCardDark]}>
                    <Text style={styles.patternIcon}>🧠</Text>
                    <View style={styles.patternContent}>
                        <Text style={[styles.patternTitle, isDark && styles.patternTitleDark]}>
                            Your Pattern
                        </Text>
                        <Text style={[styles.patternMessage, isDark && styles.patternMessageDark]}>
                            {patternInsight.message}
                        </Text>
                        <Text style={styles.patternConfidence}>
                            {patternInsight.confidence}
                        </Text>
                    </View>
                </View>

                {/* Quick Actions Grid */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
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
                        style={[styles.actionCard, styles.actionCardRestaurant]}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionCardIcon}>🍽️</Text>
                        <Text style={styles.actionCardTitle}>Healthy Spots</Text>
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
    actionCardRestaurant: {
        backgroundColor: "#DCFCE7",
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
});
