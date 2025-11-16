import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import PersonalizedAI, { ThirstCheck } from "../services/PersonalizedAI";

export default function HungerThirstScreen() {
    const router = useRouter();
    const [thirstCheck, setThirstCheck] = useState<ThirstCheck | null>(null);
    const [waterIntake, setWaterIntake] = useState({ cups: 0, goal: 8, percentage: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const check = await PersonalizedAI.checkHungerVsThirst();
            const water = await PersonalizedAI.getWaterIntake();
            setThirstCheck(check);
            setWaterIntake(water);
        } catch (error) {
            console.error("Error loading data:", error);
        }
        setLoading(false);
    };

    const logWater = async () => {
        await PersonalizedAI.logWater(1);
        await loadData();
        Alert.alert("💧 Water Logged!", "Keep hydrating to prevent false hunger!");
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
                        <Text style={styles.refreshText}>🔄</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.title}>💧 Hunger vs Thirst</Text>
                <Text style={styles.subtitle}>
                    60% of hunger is actually dehydration
                </Text>

                {/* Water Tracker */}
                <View style={styles.waterCard}>
                    <View style={styles.waterHeader}>
                        <Text style={styles.waterTitle}>Today's Water</Text>
                        <TouchableOpacity style={styles.addWaterButton} onPress={logWater}>
                            <Text style={styles.addWaterText}>+ Add Cup</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.waterProgress}>
                        <View style={styles.cupsDisplay}>
                            <Text style={styles.cupsNumber}>{waterIntake.cups}</Text>
                            <Text style={styles.cupsLabel}>/ {waterIntake.goal} cups</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${waterIntake.percentage}%` },
                                ]}
                            />
                        </View>
                    </View>
                </View>

                {/* Thirst Check Result */}
                {thirstCheck && (
                    <>
                        <View
                            style={[
                                styles.checkCard,
                                thirstCheck.isLikelyThirst
                                    ? styles.checkCardThirst
                                    : styles.checkCardHunger,
                            ]}
                        >
                            <View style={styles.checkHeader}>
                                <Text style={styles.checkIcon}>
                                    {thirstCheck.isLikelyThirst ? "💧" : "🍽️"}
                                </Text>
                                <View style={styles.checkInfo}>
                                    <Text style={styles.checkLabel}>ANALYSIS</Text>
                                    <Text style={styles.checkResult}>
                                        {thirstCheck.isLikelyThirst
                                            ? "Likely THIRST"
                                            : "Likely HUNGER"}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.recommendation}>
                                {thirstCheck.recommendation}
                            </Text>

                            {thirstCheck.caloriesSaved > 0 && (
                                <View style={styles.savingsCard}>
                                    <Text style={styles.savingsIcon}>✨</Text>
                                    <Text style={styles.savingsText}>
                                        Could save ~{thirstCheck.caloriesSaved} calories by
                                        drinking water first!
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Data Points */}
                        <View style={styles.dataCard}>
                            <Text style={styles.dataTitle}>📊 Your Data</Text>

                            <View style={styles.dataRow}>
                                <Text style={styles.dataLabel}>Water today:</Text>
                                <Text style={styles.dataValue}>
                                    {thirstCheck.waterToday} cups ({Math.round((thirstCheck.waterToday / 8) * 100)}% of goal)
                                </Text>
                            </View>

                            <View style={styles.dataRow}>
                                <Text style={styles.dataLabel}>Last meal:</Text>
                                <Text style={styles.dataValue}>{thirstCheck.lastMealTime}</Text>
                            </View>

                            <View style={styles.dataRow}>
                                <Text style={styles.dataLabel}>Last water:</Text>
                                <Text style={styles.dataValue}>
                                    {thirstCheck.lastWaterTime === "Not tracked today"
                                        ? thirstCheck.lastWaterTime
                                        : new Date(thirstCheck.lastWaterTime).toLocaleTimeString()}
                                </Text>
                            </View>
                        </View>
                    </>
                )}

                {/* The Science */}
                <View style={styles.scienceCard}>
                    <Text style={styles.scienceTitle}>🧠 The Science</Text>
                    <View style={styles.scienceStats}>
                        <View style={styles.scienceStat}>
                            <Text style={styles.scienceNumber}>60%</Text>
                            <Text style={styles.scienceLabel}>
                                of "hunger" is dehydration
                            </Text>
                        </View>
                        <View style={styles.scienceStat}>
                            <Text style={styles.scienceNumber}>300+</Text>
                            <Text style={styles.scienceLabel}>
                                calories saved per day
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.scienceText}>
                        Your hypothalamus controls both hunger and thirst signals. When
                        dehydrated, it often sends hunger signals by mistake. Drink water first,
                        wait 10 minutes - if still hungry, it's real hunger!
                    </Text>
                </View>

                {/* Quick Action */}
                {thirstCheck?.isLikelyThirst && (
                    <TouchableOpacity style={styles.actionButton} onPress={logWater}>
                        <Text style={styles.actionButtonText}>💧 I Drank Water (Log It)</Text>
                    </TouchableOpacity>
                )}
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
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        marginTop: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1F2937",
        justifyContent: "center",
        alignItems: "center",
    },
    backText: {
        fontSize: 24,
        color: "#FFFFFF",
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1F2937",
        justifyContent: "center",
        alignItems: "center",
    },
    refreshText: {
        fontSize: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#9CA3AF",
        marginBottom: 32,
    },
    waterCard: {
        backgroundColor: "#0C4A6E",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    waterHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    waterTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    addWaterButton: {
        backgroundColor: "#0EA5E9",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    addWaterText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    waterProgress: {
        gap: 12,
    },
    cupsDisplay: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 4,
    },
    cupsNumber: {
        fontSize: 48,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    cupsLabel: {
        fontSize: 18,
        color: "#BFDBFE",
    },
    progressBar: {
        height: 12,
        backgroundColor: "#1E3A8A",
        borderRadius: 6,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#0EA5E9",
        borderRadius: 6,
    },
    checkCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderLeftWidth: 4,
    },
    checkCardThirst: {
        backgroundColor: "#0C4A6E",
        borderLeftColor: "#0EA5E9",
    },
    checkCardHunger: {
        backgroundColor: "#065F46",
        borderLeftColor: "#10B981",
    },
    checkHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    checkIcon: {
        fontSize: 48,
        marginRight: 16,
    },
    checkInfo: {
        flex: 1,
    },
    checkLabel: {
        fontSize: 12,
        color: "rgba(255,255,255,0.7)",
        fontWeight: "700",
        letterSpacing: 1,
        marginBottom: 4,
    },
    checkResult: {
        fontSize: 24,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    recommendation: {
        fontSize: 16,
        color: "#FFFFFF",
        lineHeight: 24,
        marginBottom: 16,
    },
    savingsCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: 12,
        gap: 12,
    },
    savingsIcon: {
        fontSize: 24,
    },
    savingsText: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    dataCard: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    dataTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 16,
    },
    dataRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#374151",
    },
    dataLabel: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    dataValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    scienceCard: {
        backgroundColor: "#1E3A8A",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    scienceTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 16,
    },
    scienceStats: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 16,
    },
    scienceStat: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    scienceNumber: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    scienceLabel: {
        fontSize: 12,
        color: "#BFDBFE",
        textAlign: "center",
    },
    scienceText: {
        fontSize: 14,
        color: "#BFDBFE",
        lineHeight: 22,
    },
    actionButton: {
        backgroundColor: "#0EA5E9",
        borderRadius: 12,
        padding: 18,
        alignItems: "center",
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});
