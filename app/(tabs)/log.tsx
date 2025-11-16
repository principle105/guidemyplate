import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type FoodEntry = {
    id: string;
    name: string;
    portion: string;
    mealType: string;
    date: string;
    time: string;
};

export default function LogTab() {
    const colorScheme = useColorScheme();
    const [foodName, setFoodName] = useState("");
    const [portion, setPortion] = useState("");
    const [mealType, setMealType] = useState("Snack");
    const [foodLog, setFoodLog] = useState<FoodEntry[]>([]);
    const [surveyData, setSurveyData] = useState<any>(null);

    useEffect(() => {
        loadFoodLog();
        loadSurveyData();
    }, []);

    const loadSurveyData = async () => {
        try {
            const data = await AsyncStorage.getItem("surveyData");
            if (data) {
                setSurveyData(JSON.parse(data));
            }
        } catch (error) {
            console.error("Error loading survey data:", error);
        }
    };

    const loadFoodLog = async () => {
        try {
            const log = await AsyncStorage.getItem("foodLog");
            if (log) {
                setFoodLog(JSON.parse(log));
            }
        } catch (error) {
            console.error("Error loading food log:", error);
        }
    };

    const getSmartFeedback = (food: string): string => {
        const foodLower = food.toLowerCase();

        // Protein-rich foods
        const proteinFoods = [
            "chicken",
            "beef",
            "fish",
            "salmon",
            "tuna",
            "egg",
            "tofu",
            "protein",
            "steak",
            "turkey",
            "pork",
        ];
        // Vegetables
        const veggies = [
            "salad",
            "broccoli",
            "spinach",
            "kale",
            "vegetable",
            "carrot",
            "pepper",
            "tomato",
            "cucumber",
            "lettuce",
        ];
        // Processed/fast food
        const processed = [
            "pizza",
            "burger",
            "fries",
            "chips",
            "candy",
            "soda",
            "donut",
            "cookie",
            "ice cream",
            "cake",
        ];

        const hasProtein = proteinFoods.some((p) => foodLower.includes(p));
        const hasVeggies = veggies.some((v) => foodLower.includes(v));
        const isProcessed = processed.some((p) => foodLower.includes(p));

        // Personalized feedback based on survey
        if (hasVeggies && hasProtein) {
            return "🥗 Perfect balance! This will keep you satisfied.";
        } else if (hasProtein && surveyData?.satietyLevel === "Still hungry") {
            return "🍗 Great protein choice! This should help you feel fuller longer.";
        } else if (
            hasVeggies &&
            surveyData?.biggestChallenge === "Not feeling full"
        ) {
            return "🥦 Excellent! High-fiber foods help with satiety.";
        } else if (
            isProcessed &&
            surveyData?.biggestChallenge === "Too many processed foods"
        ) {
            return "⚠️ Try pairing this with a vegetable or protein next time!";
        } else if (
            isProcessed &&
            surveyData?.problemFoods?.includes("Fast food")
        ) {
            return "💪 Noticed this is a challenge food for you. You've got this!";
        } else if (hasProtein) {
            return "💪 Good protein source!";
        } else if (hasVeggies) {
            return "🌱 Love the veggies!";
        } else if (isProcessed) {
            return "💡 Consider adding protein or veggies to balance this meal.";
        } else {
            return "✅ Logged! Keep building that habit.";
        }
    };

    const saveFoodEntry = async () => {
        if (!foodName.trim()) {
            Alert.alert("Error", "Please enter a food name");
            return;
        }

        const feedback = getSmartFeedback(foodName);

        const now = new Date();
        const newEntry: FoodEntry = {
            id: Date.now().toString(),
            name: foodName,
            portion: portion || "1 serving",
            mealType,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        const updatedLog = [newEntry, ...foodLog];
        setFoodLog(updatedLog);
        await AsyncStorage.setItem("foodLog", JSON.stringify(updatedLog));

        // Show smart feedback
        Alert.alert("Food Logged!", feedback, [{ text: "Got it!", style: "default" }]);

        // Clear form
        setFoodName("");
        setPortion("");
        setMealType("Snack");
    };

    const deleteEntry = async (id: string) => {
        Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    const updatedLog = foodLog.filter((entry) => entry.id !== id);
                    setFoodLog(updatedLog);
                    await AsyncStorage.setItem("foodLog", JSON.stringify(updatedLog));
                },
            },
        ]);
    };

    const getTodayStats = () => {
        const today = new Date().toLocaleDateString();
        const todayEntries = foodLog.filter((entry) => entry.date === today);
        
        const mealCounts = {
            Breakfast: todayEntries.filter(e => e.mealType === "Breakfast").length,
            Lunch: todayEntries.filter(e => e.mealType === "Lunch").length,
            Dinner: todayEntries.filter(e => e.mealType === "Dinner").length,
            Snack: todayEntries.filter(e => e.mealType === "Snack").length,
        };
        
        return {
            total: todayEntries.length,
            mealCounts,
        };
    };

    const todayStats = getTodayStats();

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: Colors[colorScheme ?? "light"].background },
            ]}
        >
            <ThemedView style={styles.header}>
                <ThemedText type="title">Food Log</ThemedText>
                <ThemedText style={styles.subtitle}>Track your meals</ThemedText>
            </ThemedView>

            {/* Today's Summary */}
            <ThemedView style={styles.summaryCard}>
                <ThemedText type="subtitle" style={styles.summaryTitle}>
                    Today's Meals
                </ThemedText>
                <View style={styles.summaryGrid}>
                    <View style={styles.summaryItem}>
                        <ThemedText style={styles.summaryValue}>
                            {todayStats.total}
                        </ThemedText>
                        <ThemedText style={styles.summaryLabel}>Total Items</ThemedText>
                    </View>
                    <View style={styles.summaryItem}>
                        <ThemedText style={styles.summaryValue}>
                            {todayStats.mealCounts.Breakfast}
                        </ThemedText>
                        <ThemedText style={styles.summaryLabel}>Breakfast</ThemedText>
                    </View>
                    <View style={styles.summaryItem}>
                        <ThemedText style={styles.summaryValue}>
                            {todayStats.mealCounts.Lunch}
                        </ThemedText>
                        <ThemedText style={styles.summaryLabel}>Lunch</ThemedText>
                    </View>
                    <View style={styles.summaryItem}>
                        <ThemedText style={styles.summaryValue}>
                            {todayStats.mealCounts.Dinner}
                        </ThemedText>
                        <ThemedText style={styles.summaryLabel}>Dinner</ThemedText>
                    </View>
                </View>
            </ThemedView>

            {/* Add Food Form */}
            <ThemedView style={styles.formCard}>
                <ThemedText type="subtitle" style={styles.formTitle}>
                    What did you eat?
                </ThemedText>

                <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Food or Meal *</ThemedText>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor:
                                    Colors[colorScheme ?? "light"].background,
                                color: Colors[colorScheme ?? "light"].text,
                                borderColor: Colors[colorScheme ?? "light"].icon,
                            },
                        ]}
                        placeholder="e.g., Pizza, Salad, Chicken Sandwich"
                        placeholderTextColor={Colors[colorScheme ?? "light"].icon}
                        value={foodName}
                        onChangeText={setFoodName}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Portion Size (optional)</ThemedText>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor:
                                    Colors[colorScheme ?? "light"].background,
                                color: Colors[colorScheme ?? "light"].text,
                                borderColor: Colors[colorScheme ?? "light"].icon,
                            },
                        ]}
                        placeholder="e.g., 2 slices, Small bowl, 1 plate"
                        placeholderTextColor={Colors[colorScheme ?? "light"].icon}
                        value={portion}
                        onChangeText={setPortion}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Meal Type</ThemedText>
                    <View style={styles.mealTypeRow}>
                        {["Breakfast", "Lunch", "Dinner", "Snack"].map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.mealTypeButton,
                                    {
                                        borderColor: Colors[colorScheme ?? "light"].icon,
                                        backgroundColor:
                                            mealType === type
                                                ? Colors[colorScheme ?? "light"].tint
                                                : "transparent",
                                    },
                                ]}
                                onPress={() => setMealType(type)}
                            >
                                <ThemedText
                                    style={[
                                        styles.mealTypeText,
                                        {
                                            color:
                                                mealType === type
                                                    ? "#FFFFFF"
                                                    : Colors[colorScheme ?? "light"].text,
                                        },
                                    ]}
                                >
                                    {type}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.addButton,
                        { backgroundColor: Colors[colorScheme ?? "light"].tint },
                    ]}
                    onPress={saveFoodEntry}
                >
                    <ThemedText style={styles.addButtonText}>Log Food</ThemedText>
                </TouchableOpacity>
            </ThemedView>

            {/* Food History */}
            <ThemedView style={styles.historyCard}>
                <ThemedText type="subtitle" style={styles.historyTitle}>
                    Food History
                </ThemedText>

                {foodLog.length === 0 ? (
                    <ThemedText style={styles.emptyText}>
                        No entries yet. Add your first meal above!
                    </ThemedText>
                ) : (
                    foodLog.map((entry) => (
                        <View
                            key={entry.id}
                            style={[
                                styles.entryCard,
                                {
                                    backgroundColor:
                                        Colors[colorScheme ?? "light"].background,
                                    borderColor: Colors[colorScheme ?? "light"].icon,
                                },
                            ]}
                        >
                            <View style={styles.entryHeader}>
                                <View style={styles.entryInfo}>
                                    <View style={styles.entryTopRow}>
                                        <ThemedText style={styles.entryName}>
                                            {entry.name}
                                        </ThemedText>
                                        <View
                                            style={[
                                                styles.mealBadge,
                                                {
                                                    backgroundColor:
                                                        entry.mealType === "Breakfast"
                                                            ? "#FF9500"
                                                            : entry.mealType === "Lunch"
                                                            ? "#34C759"
                                                            : entry.mealType === "Dinner"
                                                            ? "#5856D6"
                                                            : "#AF52DE",
                                                },
                                            ]}
                                        >
                                            <ThemedText style={styles.mealBadgeText}>
                                                {entry.mealType}
                                            </ThemedText>
                                        </View>
                                    </View>
                                    <ThemedText style={styles.entryPortion}>
                                        {entry.portion}
                                    </ThemedText>
                                    <ThemedText style={styles.entryTime}>
                                        {entry.date} at {entry.time}
                                    </ThemedText>
                                </View>
                                <TouchableOpacity
                                    onPress={() => deleteEntry(entry.id)}
                                    style={styles.deleteButton}
                                >
                                    <IconSymbol
                                        name="trash"
                                        size={20}
                                        color="#FF3B30"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginTop: 60,
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
        marginTop: 4,
    },
    summaryCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
    },
    summaryTitle: {
        marginBottom: 16,
        fontSize: 18,
    },
    summaryGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    summaryItem: {
        alignItems: "center",
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: "bold",
    },
    summaryLabel: {
        fontSize: 12,
        opacity: 0.7,
        marginTop: 4,
    },
    formCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
    },
    formTitle: {
        marginBottom: 16,
        fontSize: 18,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    addButton: {
        height: 52,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
    },
    addButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    historyCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 40,
    },
    historyTitle: {
        marginBottom: 16,
        fontSize: 18,
    },
    emptyText: {
        textAlign: "center",
        opacity: 0.5,
        paddingVertical: 32,
    },
    entryCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    entryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    entryInfo: {
        flex: 1,
    },
    entryName: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    entryTime: {
        fontSize: 12,
        opacity: 0.6,
    },
    deleteButton: {
        padding: 4,
    },
    mealTypeRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    mealTypeButton: {
        flex: 1,
        minWidth: "22%",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: "center",
    },
    mealTypeText: {
        fontSize: 14,
        fontWeight: "600",
    },
    entryTopRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 6,
    },
    mealBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    mealBadgeText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "600",
    },
    entryPortion: {
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 4,
    },
});
