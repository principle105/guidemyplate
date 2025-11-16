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

export default function SatietyTrackerScreen() {
    const router = useRouter();
    const [recentMeal, setRecentMeal] = useState<any>(null);
    const [fullnessRating, setFullnessRating] = useState<number>(0);
    const [hoursUntilHungry, setHoursUntilHungry] = useState<string>("");
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
            const data = await PersonalizedAI.getSatietyInsights();
            setInsights(data);
        } catch (error) {
            console.error("Error loading insights:", error);
        }
        setLoading(false);
    };

    const saveSatietyRating = async () => {
        if (!recentMeal) {
            Alert.alert("No Meal", "Log a meal first to track satiety!");
            return;
        }

        if (fullnessRating === 0) {
            Alert.alert("Rate Fullness", "How full did this meal make you? (1-10)");
            return;
        }

        if (!hoursUntilHungry) {
            Alert.alert("Hours Until Hungry", "How many hours until you felt hungry again?");
            return;
        }

        try {
            await PersonalizedAI.saveSatietyData({
                foodName: recentMeal.foodName,
                fullnessRating,
                hoursUntilHungry: parseFloat(hoursUntilHungry),
                mealType: recentMeal.mealType,
            });

            Alert.alert(
                "✅ Saved!",
                "Your Satiety Score is learning what keeps you full!",
                [{ text: "Got it", onPress: () => {
                    setFullnessRating(0);
                    setHoursUntilHungry("");
                    loadInsights();
                }}]
            );
        } catch (error) {
            Alert.alert("Error", "Failed to save satiety data");
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

                <Text style={styles.title}>🎯 Satiety Score™</Text>
                <Text style={styles.subtitle}>
                    Track how long meals keep YOU full
                </Text>

                {/* Rate Recent Meal */}
                {recentMeal && (
                    <View style={styles.ratingCard}>
                        <Text style={styles.cardTitle}>Rate Your Last Meal</Text>
                        <Text style={styles.mealName}>{recentMeal.foodName}</Text>
                        <Text style={styles.mealMeta}>
                            {recentMeal.mealType} • {recentMeal.calories} cal
                        </Text>

                        {/* Fullness Rating */}
                        <Text style={styles.questionLabel}>How full did you feel? (1-10)</Text>
                        <View style={styles.ratingButtons}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={[
                                        styles.ratingButton,
                                        fullnessRating === num && styles.ratingButtonActive,
                                    ]}
                                    onPress={() => setFullnessRating(num)}
                                >
                                    <Text
                                        style={[
                                            styles.ratingButtonText,
                                            fullnessRating === num && styles.ratingButtonTextActive,
                                        ]}
                                    >
                                        {num}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Hours Until Hungry */}
                        <Text style={styles.questionLabel}>Hours until hungry again?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 3.5"
                            keyboardType="decimal-pad"
                            value={hoursUntilHungry}
                            onChangeText={setHoursUntilHungry}
                            placeholderTextColor="#6B7280"
                        />

                        <TouchableOpacity style={styles.saveButton} onPress={saveSatietyRating}>
                            <Text style={styles.saveButtonText}>💾 Save Satiety Score</Text>
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
                {insights && (insights.highSatiety.length > 0 || insights.lowSatiety.length > 0) && (
                    <>
                        <View style={styles.insightsSection}>
                            <Text style={styles.sectionTitle}>📊 Your Satiety Patterns</Text>
                            <Text style={styles.recommendation}>{insights.recommendation}</Text>
                        </View>

                        {/* High Satiety Foods */}
                        {insights.highSatiety.length > 0 && (
                            <View style={styles.insightCard}>
                                <Text style={styles.insightTitle}>✅ High Satiety (Keeps You Full)</Text>
                                {insights.highSatiety.map((item: any, index: number) => (
                                    <View key={index} style={styles.foodItem}>
                                        <Text style={styles.foodName}>{item.food}</Text>
                                        <View style={styles.foodStats}>
                                            <Text style={styles.statText}>
                                                {item.avgFullness.toFixed(1)}/10 fullness
                                            </Text>
                                            <Text style={styles.statText}>
                                                {item.avgHours.toFixed(1)}h full
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Low Satiety Foods */}
                        {insights.lowSatiety.length > 0 && (
                            <View style={[styles.insightCard, styles.insightCardWarning]}>
                                <Text style={styles.insightTitle}>⚠️ Low Satiety (Quick Hunger)</Text>
                                {insights.lowSatiety.map((item: any, index: number) => (
                                    <View key={index} style={styles.foodItem}>
                                        <Text style={styles.foodName}>{item.food}</Text>
                                        <View style={styles.foodStats}>
                                            <Text style={styles.statText}>
                                                {item.avgFullness.toFixed(1)}/10 fullness
                                            </Text>
                                            <Text style={styles.statText}>
                                                {item.avgHours.toFixed(1)}h full
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
                    <Text style={styles.whyTitle}>🧠 Why Satiety Score™ Matters</Text>
                    <Text style={styles.whyText}>
                        Generic calorie apps tell everyone the same thing. Your Satiety Score learns
                        what keeps YOUR body full longest - not generic advice.
                    </Text>
                    <Text style={styles.whyText}>
                        Choose more high-satiety foods to naturally eat less without feeling hungry!
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
        color: "#10B981",
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
        backgroundColor: "#8B5CF6",
        borderColor: "#A78BFA",
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
    saveButton: {
        backgroundColor: "#10B981",
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
        color: "#10B981",
        fontWeight: "600",
        lineHeight: 22,
    },
    insightCard: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#10B981",
    },
    insightCardWarning: {
        borderLeftColor: "#F59E0B",
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
        backgroundColor: "#1E3A8A",
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
        color: "#BFDBFE",
        lineHeight: 22,
        marginBottom: 12,
    },
});
