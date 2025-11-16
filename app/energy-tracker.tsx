import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import PersonalizedAI from "../services/PersonalizedAI";

export default function EnergyTrackerScreen() {
    const router = useRouter();
    const [recentMeal, setRecentMeal] = useState<any>(null);
    const [energyRating, setEnergyRating] = useState<number>(0);
    const [hoursSustained, setHoursSustained] = useState<string>("");
    const [crashExperienced, setCrashExperienced] = useState<boolean>(false);
    const [insights, setInsights] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadRecentMeal();
        loadInsights();
    }, []);

    const loadRecentMeal = async () => {
        try {
            const foodLog = await AsyncStorage.getItem("foodLog");
            if (foodLog) {
                const logs = JSON.parse(foodLog);
                if (logs.length > 0) {
                    setRecentMeal(logs[0]);
                }
            }
        } catch (error) {
            console.error("Error loading recent meal:", error);
        }
    };

    const loadInsights = async () => {
        setLoading(true);
        try {
            const data = await PersonalizedAI.getEnergyInsights();
            setInsights(data);
        } catch (error) {
            console.error("Error loading insights:", error);
        }
        setLoading(false);
    };

    const saveEnergyRating = async () => {
        if (!recentMeal) {
            Alert.alert("No Meal", "Log a meal first to track energy!");
            return;
        }

        if (energyRating === 0) {
            Alert.alert("Rate Energy", "How's your energy level? (1-10)");
            return;
        }

        if (!hoursSustained) {
            Alert.alert("Hours Sustained", "How many hours did the energy last?");
            return;
        }

        try {
            await PersonalizedAI.saveEnergyData({
                foodName: recentMeal.foodName,
                energyRating,
                hoursSustained: parseFloat(hoursSustained),
                mealType: recentMeal.mealType,
                crashExperienced,
            });

            Alert.alert(
                "⚡ Energy Tracked!",
                "Finding foods that give you sustained energy!",
                [{ text: "Got it", onPress: () => {
                    setEnergyRating(0);
                    setHoursSustained("");
                    setCrashExperienced(false);
                    loadInsights();
                }}]
            );
        } catch (error) {
            Alert.alert("Error", "Failed to save energy data");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.title}>⚡ Energy Tracker</Text>
                <Text style={styles.subtitle}>
                    Find foods that give YOU sustained energy
                </Text>

                {/* Rate Recent Meal */}
                {recentMeal && (
                    <View style={styles.ratingCard}>
                        <Text style={styles.cardTitle}>How's Your Energy?</Text>
                        <Text style={styles.mealName}>{recentMeal.foodName}</Text>
                        <Text style={styles.mealMeta}>
                            {recentMeal.mealType} • Logged {new Date(recentMeal.timestamp).toLocaleTimeString()}
                        </Text>

                        {/* Energy Rating */}
                        <Text style={styles.questionLabel}>Energy Level Right Now (1-10)</Text>
                        <View style={styles.ratingButtons}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={[
                                        styles.ratingButton,
                                        energyRating === num && styles.ratingButtonActive,
                                    ]}
                                    onPress={() => setEnergyRating(num)}
                                >
                                    <Text
                                        style={[
                                            styles.ratingButtonText,
                                            energyRating === num && styles.ratingButtonTextActive,
                                        ]}
                                    >
                                        {num}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Hours Sustained */}
                        <Text style={styles.questionLabel}>Hours of sustained energy?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 4"
                            keyboardType="decimal-pad"
                            value={hoursSustained}
                            onChangeText={setHoursSustained}
                            placeholderTextColor="#6B7280"
                        />

                        {/* Crash Check */}
                        <TouchableOpacity
                            style={styles.crashCheckbox}
                            onPress={() => setCrashExperienced(!crashExperienced)}
                        >
                            <View style={[styles.checkbox, crashExperienced && styles.checkboxActive]}>
                                {crashExperienced && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.crashLabel}>I experienced an energy crash</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.saveButton} onPress={saveEnergyRating}>
                            <Text style={styles.saveButtonText}>⚡ Track Energy</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!recentMeal && (
                    <View style={styles.noMealCard}>
                        <Text style={styles.noMealIcon}>🍽️</Text>
                        <Text style={styles.noMealText}>Log a meal first!</Text>
                        <TouchableOpacity
                            style={styles.logMealButton}
                            onPress={() => router.push("/(tabs)/log")}
                        >
                            <Text style={styles.logMealButtonText}>Go to Log Tab</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Insights */}
                {insights && (insights.highEnergy.length > 0 || insights.lowEnergy.length > 0) && (
                    <>
                        <View style={styles.insightsSection}>
                            <Text style={styles.sectionTitle}>📊 Your Energy Patterns</Text>
                            <Text style={styles.recommendation}>{insights.pattern}</Text>
                        </View>

                        {/* High Energy Foods */}
                        {insights.highEnergy.length > 0 && (
                            <View style={styles.insightCard}>
                                <Text style={styles.insightTitle}>⚡ High Energy Foods</Text>
                                {insights.highEnergy.map((item: any, index: number) => (
                                    <View key={index} style={styles.foodItem}>
                                        <Text style={styles.foodName}>{item.food}</Text>
                                        <View style={styles.foodStats}>
                                            <Text style={styles.statText}>
                                                {item.avgRating.toFixed(1)}/10 energy
                                            </Text>
                                            <Text style={styles.statText}>
                                                {item.avgHours.toFixed(1)}h sustained
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Low Energy Foods */}
                        {insights.lowEnergy.length > 0 && (
                            <View style={[styles.insightCard, styles.insightCardWarning]}>
                                <Text style={styles.insightTitle}>⚠️ Energy Crash Foods</Text>
                                {insights.lowEnergy.map((item: any, index: number) => (
                                    <View key={index} style={styles.foodItem}>
                                        <Text style={styles.foodName}>{item.food}</Text>
                                        <View style={styles.foodStats}>
                                            <Text style={styles.statText}>
                                                {item.avgRating.toFixed(1)}/10 energy
                                            </Text>
                                            <Text style={styles.statText}>
                                                {item.crashRate.toFixed(0)}% crash rate
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                )}

                {/* Why This Matters */}
                <View style={styles.whyCard}>
                    <Text style={styles.whyTitle}>💡 Why Energy Tracking Matters</Text>
                    <Text style={styles.whyText}>
                        Not all "healthy" foods give YOU energy. Your body is unique - protein
                        might energize you while carbs cause crashes, or vice versa.
                    </Text>
                    <Text style={styles.whyText}>
                        Track your patterns to discover your personal "rocket fuel" foods!
                    </Text>
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
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
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
    ratingCard: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 12,
    },
    mealName: {
        fontSize: 24,
        fontWeight: "700",
        color: "#F59E0B",
        marginBottom: 4,
    },
    mealMeta: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 24,
    },
    questionLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: "#E5E7EB",
        marginBottom: 12,
    },
    ratingButtons: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 24,
    },
    ratingButton: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: "#374151",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    ratingButtonActive: {
        backgroundColor: "#F59E0B",
        borderColor: "#FBBF24",
    },
    ratingButtonText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#9CA3AF",
    },
    ratingButtonTextActive: {
        color: "#FFFFFF",
    },
    input: {
        backgroundColor: "#374151",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: "#FFFFFF",
        marginBottom: 24,
    },
    crashCheckbox: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#6B7280",
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxActive: {
        backgroundColor: "#EF4444",
        borderColor: "#EF4444",
    },
    checkmark: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "bold",
    },
    crashLabel: {
        fontSize: 15,
        color: "#E5E7EB",
    },
    saveButton: {
        backgroundColor: "#F59E0B",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    noMealCard: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 40,
        alignItems: "center",
        marginBottom: 24,
    },
    noMealIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    noMealText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 16,
    },
    logMealButton: {
        backgroundColor: "#8B5CF6",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    logMealButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    insightsSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    recommendation: {
        fontSize: 15,
        color: "#F59E0B",
        fontWeight: "600",
        lineHeight: 22,
    },
    insightCard: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#F59E0B",
    },
    insightCardWarning: {
        borderLeftColor: "#EF4444",
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 16,
    },
    foodItem: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#374151",
    },
    foodName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#E5E7EB",
        marginBottom: 6,
    },
    foodStats: {
        flexDirection: "row",
        gap: 16,
    },
    statText: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    whyCard: {
        backgroundColor: "#7C2D12",
        borderRadius: 16,
        padding: 24,
        marginTop: 8,
    },
    whyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 12,
    },
    whyText: {
        fontSize: 14,
        color: "#FED7AA",
        lineHeight: 22,
        marginBottom: 12,
    },
});
