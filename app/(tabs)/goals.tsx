import React, { useState } from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Habit = {
    id: string;
    label: string;
    targetPerWeek: number;
};

type Milestone = {
    id: string;
    label: string;
    target: string;
    progress: number; // 0–1
};

const habits: Habit[] = [
    { id: "veggies", label: "3+ servings of vegetables", targetPerWeek: 5 },
    { id: "water", label: "8 cups of water", targetPerWeek: 6 },
    { id: "no_takeout", label: "No takeout", targetPerWeek: 4 },
];

const milestones: Milestone[] = [
    {
        id: "first-5lbs",
        label: "First -5 lbs lost",
        target: "In 3 weeks",
        progress: 0.6,
    },
    {
        id: "10lbs",
        label: "-10 lbs milestone",
        target: "In 7 weeks",
        progress: 0.3,
    },
];

export default function GoalsTab() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    
    const [currentWeight, setCurrentWeight] = useState(0);
    const [goalWeight, setGoalWeight] = useState(0);
    const [startingWeight, setStartingWeight] = useState(0);
    const [dataLoaded, setDataLoaded] = useState(false);

    // Simple local tracking of completed days for each habit (0–7)
    const [habitProgress, setHabitProgress] = useState<Record<string, number>>({
        veggies: 2,
        water: 3,
        no_takeout: 1,
    });
    
    useEffect(() => {
        loadWeightData();
    }, []);
    
    const loadWeightData = async () => {
        try {
            const surveyData = await AsyncStorage.getItem("surveyData");
            if (surveyData) {
                const parsed = JSON.parse(surveyData);
                const surveyStartWeight = Number(parsed.currentWeight) || 0;
                
                setStartingWeight(surveyStartWeight);
                setGoalWeight(Number(parsed.goalWeight) || 0);
                
                // Check for most recent weight log
                const weightHistory = await AsyncStorage.getItem("weightHistory");
                if (weightHistory) {
                    const history = JSON.parse(weightHistory);
                    if (history.length > 0) {
                        setCurrentWeight(history[0].weight);
                    } else {
                        setCurrentWeight(surveyStartWeight);
                    }
                } else {
                    setCurrentWeight(surveyStartWeight);
                }
            }
            setDataLoaded(true);
        } catch (error) {
            console.error("Error loading weight data:", error);
            setDataLoaded(true);
        }
    };

    const toggleHabitDay = (habitId: string) => {
        setHabitProgress((prev) => {
            const current = prev[habitId] ?? 0;
            const next = (current + 1) % 8; // cycle 0–7
            return { ...prev, [habitId]: next };
        });
    };

    const renderProgressBar = (
        value: number,
        trackColor: string,
        fillColor: string,
    ) => (
        <View
            style={[styles.progressBarTrack, { backgroundColor: trackColor }]}
        >
            <View
                style={[
                    styles.progressBarFill,
                    {
                        width: `${Math.round(value * 100)}%`,
                        backgroundColor: fillColor,
                    },
                ]}
            />
        </View>
    );

    return (
        <SafeAreaView
            style={[styles.container, isDark && styles.containerDark]}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ThemedView
                    style={[styles.content, { backgroundColor: "transparent" }]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <ThemedText
                                type="title"
                                style={[
                                    styles.title,
                                    isDark && styles.titleDark,
                                ]}
                            >
                                Your Goals
                            </ThemedText>
                            <ThemedText
                                style={[
                                    styles.subTitle,
                                    isDark && styles.subTitleDark,
                                ]}
                            >
                                Stay on track with clear targets and habits
                            </ThemedText>
                        </View>
                    </View>

                    {/* Primary Goal */}
                    <View
                        style={[
                            styles.card,
                            styles.primaryGoalCard,
                            isDark && styles.cardDark,
                        ]}
                    >
                        <View style={styles.cardHeaderRow}>
                            <ThemedText
                                style={[
                                    styles.cardLabel,
                                    isDark && styles.cardLabelDark,
                                ]}
                            >
                                MAIN GOAL
                            </ThemedText>
                            <ThemedText
                                style={[
                                    styles.cardTag,
                                    isDark && styles.cardTagDark,
                                ]}
                            >
                                Weight
                            </ThemedText>
                        </View>

                        <View style={styles.weightRow}>
                            <View style={styles.weightBlock}>
                                <ThemedText
                                    style={[
                                        styles.weightValue,
                                        isDark && styles.weightValueDark,
                                    ]}
                                >
                                    {dataLoaded ? currentWeight || '—' : '...'}
                                </ThemedText>
                                <ThemedText
                                    style={[
                                        styles.weightCaption,
                                        isDark && styles.weightCaptionDark,
                                    ]}
                                >
                                    Current (lbs)
                                </ThemedText>
                            </View>
                            <ThemedText
                                style={[
                                    styles.weightArrow,
                                    isDark && styles.weightArrowDark,
                                ]}
                            >
                                →
                            </ThemedText>
                            <View style={styles.weightBlock}>
                                <ThemedText style={styles.weightTargetValue}>
                                    {dataLoaded ? goalWeight || '—' : '...'}
                                </ThemedText>
                                <ThemedText
                                    style={[
                                        styles.weightCaption,
                                        isDark && styles.weightCaptionDark,
                                    ]}
                                >
                                    Goal (lbs)
                                </ThemedText>
                            </View>
                        </View>

                        {renderProgressBar(
                            dataLoaded && startingWeight > goalWeight 
                                ? Math.min(1, Math.max(0, (startingWeight - currentWeight) / (startingWeight - goalWeight)))
                                : 0,
                            isDark ? "#1F2933" : "#E5E7EB",
                            "#10B981",
                        )}

                        <ThemedText
                            style={[
                                styles.goalSummary,
                                isDark && styles.goalSummaryDark,
                            ]}
                        >
                            {dataLoaded && currentWeight > 0 && goalWeight > 0 
                                ? `${Math.max(0, currentWeight - goalWeight).toFixed(1)} lbs to lose • ${(Math.max(0, startingWeight - currentWeight) / Math.max(1, startingWeight - goalWeight) * 100).toFixed(0)}% there`
                                : 'Loading your progress...'}
                        </ThemedText>
                    </View>

                    {/* Milestones */}
                    <View style={styles.sectionHeader}>
                        <ThemedText
                            style={[
                                styles.sectionTitle,
                                isDark && styles.sectionTitleDark,
                            ]}
                        >
                            🎯 Milestones
                        </ThemedText>
                    </View>

                    <View style={[styles.card, isDark && styles.cardDark]}>
                        {milestones.map((m, index) => (
                            <View
                                key={m.id}
                                style={[
                                    styles.milestoneRow,
                                    index !== milestones.length - 1 && {
                                        marginBottom: 14,
                                    },
                                ]}
                            >
                                <View style={{ flex: 1, marginRight: 12 }}>
                                    <ThemedText
                                        style={[
                                            styles.milestoneLabel,
                                            isDark && styles.milestoneLabelDark,
                                        ]}
                                    >
                                        {m.label}
                                    </ThemedText>
                                    <ThemedText
                                        style={[
                                            styles.milestoneTarget,
                                            isDark &&
                                                styles.milestoneTargetDark,
                                        ]}
                                    >
                                        {m.target}
                                    </ThemedText>
                                </View>
                                <View style={{ flexBasis: "42%" }}>
                                    {renderProgressBar(
                                        m.progress,
                                        isDark ? "#1F2933" : "#E5E7EB",
                                        "#6366F1",
                                    )}
                                    <ThemedText
                                        style={[
                                            styles.milestonePercent,
                                            isDark &&
                                                styles.milestonePercentDark,
                                        ]}
                                    >
                                        {Math.round(m.progress * 100)}% complete
                                    </ThemedText>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Weekly Habits */}
                    <View style={styles.sectionHeader}>
                        <ThemedText
                            style={[
                                styles.sectionTitle,
                                isDark && styles.sectionTitleDark,
                            ]}
                        >
                            📅 Weekly Habits
                        </ThemedText>
                    </View>

                    <View
                        style={[
                            styles.card,
                            styles.habitCard,
                            isDark && styles.cardDark,
                        ]}
                    >
                        <ThemedText
                            style={[
                                styles.habitHint,
                                isDark && styles.habitHintDark,
                            ]}
                        >
                            Tap the circles to update this week’s progress
                        </ThemedText>

                        {habits.map((habit, index) => {
                            const done = habitProgress[habit.id] ?? 0;
                            const ratio =
                                habit.targetPerWeek === 0
                                    ? 0
                                    : Math.min(done / habit.targetPerWeek, 1);

                            return (
                                <View
                                    key={habit.id}
                                    style={[
                                        styles.habitRow,
                                        index !== habits.length - 1 && {
                                            marginBottom: 14,
                                        },
                                    ]}
                                >
                                    <View style={{ flex: 1, marginRight: 12 }}>
                                        <ThemedText
                                            style={[
                                                styles.habitLabel,
                                                isDark && styles.habitLabelDark,
                                            ]}
                                        >
                                            {habit.label}
                                        </ThemedText>
                                        <ThemedText
                                            style={[
                                                styles.habitMeta,
                                                isDark && styles.habitMetaDark,
                                            ]}
                                        >
                                            {done}/{habit.targetPerWeek} days
                                            this week
                                        </ThemedText>
                                    </View>

                                    <Pressable
                                        onPress={() => toggleHabitDay(habit.id)}
                                        style={styles.habitControl}
                                    >
                                        {renderProgressBar(
                                            ratio,
                                            isDark ? "#111827" : "#E5E7EB",
                                            "#F97316",
                                        )}
                                        <ThemedText
                                            style={[
                                                styles.habitControlText,
                                                isDark &&
                                                    styles.habitControlTextDark,
                                            ]}
                                        >
                                            + day
                                        </ThemedText>
                                    </Pressable>
                                </View>
                            );
                        })}
                    </View>

                    <View style={{ height: 40 }} />
                </ThemedView>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent",
    },
    containerDark: {
        backgroundColor: "transparent",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    content: {
        flex: 1,
        backgroundColor: "transparent",
    },
    header: {
        marginBottom: 20,
        marginTop: 8,
    },
    title: {
        fontFamily: Fonts.rounded,
        fontSize: 32,
        fontWeight: "bold",
        color: "#1F2937",
        marginBottom: 4,
    },
    titleDark: {
        color: "#FFFFFF",
    },
    subTitle: {
        fontSize: 16,
        color: "#6B7280",
    },
    subTitleDark: {
        color: "#9BA1A6",
    },
    sectionHeader: {
        marginBottom: 12,
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1F2937",
    },
    sectionTitleDark: {
        color: "#FFFFFF",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    cardDark: {
        backgroundColor: "#111827",
    },

    // Primary goal card
    primaryGoalCard: {
        marginTop: 4,
    },
    cardHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    cardLabel: {
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        color: "#6B7280",
    },
    cardLabelDark: {
        color: "#9CA3AF",
    },
    cardTag: {
        fontSize: 12,
        fontWeight: "600",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: "#EEF2FF",
        color: "#4F46E5",
    },
    cardTagDark: {
        backgroundColor: "rgba(79, 70, 229, 0.18)",
        color: "#E5E7FF",
    },
    weightRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    weightBlock: {
        alignItems: "center",
        flex: 1,
    },
    weightValue: {
        fontSize: 36,
        fontWeight: "800",
        color: "#111827",
    },
    weightValueDark: {
        color: "#F9FAFB",
    },
    weightTargetValue: {
        fontSize: 36,
        fontWeight: "800",
        color: "#10B981",
    },
    weightCaption: {
        marginTop: 4,
        fontSize: 13,
        color: "#6B7280",
    },
    weightCaptionDark: {
        color: "#9CA3AF",
    },
    weightArrow: {
        fontSize: 24,
        color: "#9CA3AF",
        paddingHorizontal: 16,
    },
    weightArrowDark: {
        color: "#6B7280",
    },
    progressBarTrack: {
        height: 10,
        borderRadius: 999,
        overflow: "hidden",
        marginBottom: 8,
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 999,
    },
    goalSummary: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },
    goalSummaryDark: {
        color: "#D1D5DB",
    },

    // Milestones
    milestoneRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    milestoneLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 2,
    },
    milestoneLabelDark: {
        color: "#F9FAFB",
    },
    milestoneTarget: {
        fontSize: 13,
        color: "#6B7280",
    },
    milestoneTargetDark: {
        color: "#9CA3AF",
    },
    milestonePercent: {
        marginTop: 4,
        fontSize: 12,
        color: "#6B7280",
        textAlign: "right",
    },
    milestonePercentDark: {
        color: "#D1D5DB",
    },

    // Habits
    habitCard: {
        marginTop: 4,
    },
    habitHint: {
        fontSize: 13,
        color: "#6B7280",
        marginBottom: 10,
    },
    habitHintDark: {
        color: "#9CA3AF",
    },
    habitRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    habitLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: "#111827",
    },
    habitLabelDark: {
        color: "#F9FAFB",
    },
    habitMeta: {
        fontSize: 13,
        color: "#6B7280",
        marginTop: 2,
    },
    habitMetaDark: {
        color: "#9CA3AF",
    },
    habitControl: {
        flexBasis: "40%",
        alignItems: "flex-end",
        justifyContent: "center",
    },
    habitControlText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#F97316",
        marginTop: 4,
    },
    habitControlTextDark: {
        color: "#FDBA74",
    },
});
