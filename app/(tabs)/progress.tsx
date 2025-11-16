import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Dimensions,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function ProgressTab() {
    const [surveyData, setSurveyData] = useState<any>(null);
    const [weeklyData, setWeeklyData] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const survey = await AsyncStorage.getItem("surveyData");
        if (survey) setSurveyData(JSON.parse(survey));

        // Mock weekly calorie data
        const mockWeekly = [
            { day: "Mon", calories: 1850, target: 1900 },
            { day: "Tue", calories: 1920, target: 1900 },
            { day: "Wed", calories: 1780, target: 1900 },
            { day: "Thu", calories: 1950, target: 1900 },
            { day: "Fri", calories: 1890, target: 1900 },
            { day: "Sat", calories: 2100, target: 1900 },
            { day: "Sun", calories: 1800, target: 1900 },
        ];
        setWeeklyData(mockWeekly);
    };

    const currentWeight = surveyData?.currentWeight || 185;
    const goalWeight = surveyData?.goalWeight || 165;
    const lost = 5; // Mock weight lost
    const remaining = currentWeight - goalWeight - lost;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
            >
                <Text style={styles.title}>Your Progress 📊</Text>

                {/* Weight Progress */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Weight Journey</Text>
                    <View style={styles.weightRow}>
                        <View style={styles.weightItem}>
                            <Text style={styles.weightLabel}>Start</Text>
                            <Text style={styles.weightValue}>
                                {currentWeight}
                            </Text>
                            <Text style={styles.weightUnit}>lbs</Text>
                        </View>
                        <Text style={styles.arrow}>→</Text>
                        <View style={styles.weightItem}>
                            <Text style={styles.weightLabel}>Current</Text>
                            <Text style={[styles.weightValue, { color: "#8B5CF6" }]}>
                                {currentWeight - lost}
                            </Text>
                            <Text style={styles.weightUnit}>lbs</Text>
                        </View>
                        <Text style={styles.arrow}>→</Text>
                        <View style={styles.weightItem}>
                            <Text style={styles.weightLabel}>Goal</Text>
                            <Text style={[styles.weightValue, { color: "#10B981" }]}>
                                {goalWeight}
                            </Text>
                            <Text style={styles.weightUnit}>lbs</Text>
                        </View>
                    </View>

                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${((currentWeight - (currentWeight - lost)) / (currentWeight - goalWeight)) * 100}%`,
                                },
                            ]}
                        />
                    </View>

                    <Text style={styles.progressText}>
                        🎉 Lost {lost} lbs • {remaining} lbs to go
                    </Text>
                </View>

                {/* Weekly Calorie Chart */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Weekly Calories</Text>
                    <View style={styles.chart}>
                        {weeklyData.map((day, index) => {
                            const maxCalories = 2200;
                            const height = (day.calories / maxCalories) * 150;
                            const targetHeight = (day.target / maxCalories) * 150;
                            const isUnder = day.calories <= day.target;

                            return (
                                <View key={index} style={styles.bar}>
                                    <View style={styles.barContainer}>
                                        {/* Target line */}
                                        <View
                                            style={[
                                                styles.targetLine,
                                                { bottom: targetHeight },
                                            ]}
                                        />
                                        {/* Actual bar */}
                                        <View
                                            style={[
                                                styles.barFill,
                                                {
                                                    height: height,
                                                    backgroundColor: isUnder
                                                        ? "#10B981"
                                                        : "#F59E0B",
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.barLabel}>
                                        {day.day}
                                    </Text>
                                    <Text style={styles.barValue}>
                                        {day.calories}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View
                                style={[
                                    styles.legendDot,
                                    { backgroundColor: "#10B981" },
                                ]}
                            />
                            <Text style={styles.legendText}>Under target</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View
                                style={[
                                    styles.legendDot,
                                    { backgroundColor: "#F59E0B" },
                                ]}
                            />
                            <Text style={styles.legendText}>Over target</Text>
                        </View>
                    </View>
                </View>

                {/* Streak */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Current Streak 🔥</Text>
                    <View style={styles.streakContainer}>
                        <Text style={styles.streakNumber}>12</Text>
                        <Text style={styles.streakText}>days</Text>
                    </View>
                    <Text style={styles.streakMessage}>
                        You've logged meals for 12 days in a row! Keep it up!
                    </Text>
                </View>

                {/* Achievements */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Achievements 🏆</Text>
                    <View style={styles.achievements}>
                        <View style={styles.achievement}>
                            <Text style={styles.achievementIcon}>🎯</Text>
                            <Text style={styles.achievementText}>
                                First Week Complete
                            </Text>
                        </View>
                        <View style={styles.achievement}>
                            <Text style={styles.achievementIcon}>💪</Text>
                            <Text style={styles.achievementText}>
                                5 lbs Lost
                            </Text>
                        </View>
                        <View style={styles.achievement}>
                            <Text style={styles.achievementIcon}>📸</Text>
                            <Text style={styles.achievementText}>
                                Photo Logger
                            </Text>
                        </View>
                        <View style={styles.achievement}>
                            <Text style={styles.achievementIcon}>🔥</Text>
                            <Text style={styles.achievementText}>
                                10 Day Streak
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0A0A",
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 24,
    },
    card: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 16,
    },
    weightRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: 20,
    },
    weightItem: {
        alignItems: "center",
    },
    weightLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        marginBottom: 4,
    },
    weightValue: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    weightUnit: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    arrow: {
        fontSize: 24,
        color: "#9CA3AF",
    },
    progressBar: {
        height: 12,
        backgroundColor: "#374151",
        borderRadius: 6,
        overflow: "hidden",
        marginBottom: 12,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#8B5CF6",
        borderRadius: 6,
    },
    progressText: {
        fontSize: 14,
        color: "#E5E7EB",
        textAlign: "center",
    },
    chart: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
        height: 180,
        marginBottom: 16,
    },
    bar: {
        alignItems: "center",
        flex: 1,
    },
    barContainer: {
        width: "100%",
        height: 150,
        justifyContent: "flex-end",
        alignItems: "center",
        position: "relative",
    },
    targetLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: "#6B7280",
        borderStyle: "dashed",
    },
    barFill: {
        width: "80%",
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
    },
    barLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 4,
    },
    barValue: {
        fontSize: 10,
        color: "#6B7280",
    },
    legend: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    streakContainer: {
        alignItems: "center",
        marginBottom: 12,
    },
    streakNumber: {
        fontSize: 64,
        fontWeight: "bold",
        color: "#F59E0B",
    },
    streakText: {
        fontSize: 18,
        color: "#9CA3AF",
    },
    streakMessage: {
        fontSize: 14,
        color: "#E5E7EB",
        textAlign: "center",
        lineHeight: 20,
    },
    achievements: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    achievement: {
        width: "48%",
        backgroundColor: "#374151",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    achievementIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    achievementText: {
        fontSize: 12,
        color: "#E5E7EB",
        textAlign: "center",
    },
});
