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
    const userName = "Sarah";
    const todayScore = 8.5;
    const maxScore = 10;
    const changeFromYesterday = 1.5;
    const streakDays = 12;

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
                            You're doing amazing today
                        </Text>
                    </View>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {userName.charAt(0)}
                        </Text>
                    </View>
                </View>

                {/* Progress Card */}
                <View style={styles.progressCard}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>
                            ✨ TODAY'S PROGRESS
                        </Text>
                    </View>

                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreMain}>{todayScore}</Text>
                        <Text style={styles.scoreMax}>/{maxScore}</Text>
                    </View>

                    <Text style={styles.scoreChange}>
                        📈 +{changeFromYesterday} from yesterday
                    </Text>

                    <Text style={styles.encouragement}>
                        Excellent work! You're building healthy habits.
                    </Text>

                    <View style={styles.streakBadge}>
                        <Text style={styles.streakText}>
                            🏆 {streakDays} Day Streak 🔥
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.logMealButton]}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionIcon}>➕</Text>
                        <Text style={styles.actionTitle}>Log Meal</Text>
                        <Text style={styles.actionSubtitle}>Quick & easy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.quickWinButton]}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionIcon}>⚡</Text>
                        <Text style={styles.actionTitle}>Quick Win</Text>
                        <Text style={styles.actionSubtitle}>Get a tip</Text>
                    </TouchableOpacity>
                </View>
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
        backgroundColor: "#151718",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
        marginTop: 8,
    },
    greeting: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1F2937",
        marginBottom: 4,
    },
    greetingDark: {
        color: "#ECEDEE",
    },
    subGreeting: {
        fontSize: 16,
        color: "#6B7280",
    },
    subGreetingDark: {
        color: "#9BA1A6",
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#8B5CF6",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    progressCard: {
        backgroundColor: "#8B5CF6",
        borderRadius: 24,
        padding: 28,
        marginBottom: 20,
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    progressHeader: {
        marginBottom: 16,
    },
    progressLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "rgba(255, 255, 255, 0.9)",
        letterSpacing: 1,
    },
    scoreContainer: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: 8,
    },
    scoreMain: {
        fontSize: 72,
        fontWeight: "bold",
        color: "#FFFFFF",
        lineHeight: 72,
    },
    scoreMax: {
        fontSize: 36,
        fontWeight: "600",
        color: "rgba(255, 255, 255, 0.8)",
        marginLeft: 4,
    },
    scoreChange: {
        fontSize: 15,
        color: "rgba(255, 255, 255, 0.9)",
        marginBottom: 16,
    },
    encouragement: {
        fontSize: 16,
        color: "#FFFFFF",
        marginBottom: 20,
        lineHeight: 22,
    },
    streakBadge: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignSelf: "flex-start",
    },
    streakText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    actionButtons: {
        flexDirection: "row",
        gap: 12,
    },
    actionButton: {
        flex: 1,
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 140,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    logMealButton: {
        backgroundColor: "#10B981",
        shadowColor: "#10B981",
    },
    quickWinButton: {
        backgroundColor: "#3B82F6",
        shadowColor: "#3B82F6",
    },
    actionIcon: {
        fontSize: 36,
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.9)",
    },
});
