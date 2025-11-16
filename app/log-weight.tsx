import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
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
import StreakManager from "../services/StreakManager";

type WeightEntry = {
    weight: number;
    date: string;
    time: string;
};

export default function LogWeight() {
    const [weight, setWeight] = useState("");
    const [history, setHistory] = useState<WeightEntry[]>([]);
    const [goalWeight, setGoalWeight] = useState(165);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const surveyData = await AsyncStorage.getItem("surveyData");
            if (surveyData) {
                const parsed = JSON.parse(surveyData);
                setGoalWeight(Number(parsed.goalWeight) || 165);
            }

            const savedHistory = await AsyncStorage.getItem("weightHistory");
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (error) {
            console.error("Error loading weight data:", error);
        }
    };

    const saveWeight = async () => {
        if (!weight || isNaN(Number(weight))) {
            Alert.alert("Invalid Weight", "Please enter a valid number");
            return;
        }

        const newEntry: WeightEntry = {
            weight: Number(weight),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        const updatedHistory = [newEntry, ...history];
        setHistory(updatedHistory);
        await AsyncStorage.setItem(
            "weightHistory",
            JSON.stringify(updatedHistory)
        );

        // Log activity for streak tracking
        await StreakManager.logActivity('weight', { weight: Number(weight) });

        const diff = Number(weight) - goalWeight;
        const message =
            diff > 0
                ? `${Math.abs(diff).toFixed(1)} lbs to go! 💪`
                : "You hit your goal! 🎉";

        Alert.alert("Weight Logged!", message, [
            { text: "Done", onPress: () => router.back() },
        ]);
    };

    const deleteEntry = async (index: number) => {
        const updatedHistory = history.filter((_, i) => i !== index);
        setHistory(updatedHistory);
        await AsyncStorage.setItem(
            "weightHistory",
            JSON.stringify(updatedHistory)
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Log Weight</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
            >
                <View style={styles.inputCard}>
                    <Text style={styles.label}>Current Weight (lbs)</Text>
                    <TextInput
                        style={styles.input}
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="decimal-pad"
                        placeholder="185.5"
                        placeholderTextColor="#6B7280"
                    />

                    <View style={styles.goalInfo}>
                        <Text style={styles.goalText}>
                            Goal: {goalWeight} lbs
                        </Text>
                        {weight && !isNaN(Number(weight)) && (
                            <Text style={styles.diffText}>
                                {Number(weight) - goalWeight > 0
                                    ? `${(Number(weight) - goalWeight).toFixed(1)} lbs to lose`
                                    : "Goal reached! 🎉"}
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={saveWeight}
                    >
                        <Text style={styles.saveButtonText}>Log Weight</Text>
                    </TouchableOpacity>
                </View>

                {history.length > 0 && (
                    <View style={styles.historySection}>
                        <Text style={styles.historyTitle}>Weight History</Text>
                        {history.map((entry, index) => (
                            <View key={index} style={styles.historyCard}>
                                <View style={styles.historyLeft}>
                                    <Text style={styles.historyWeight}>
                                        {entry.weight} lbs
                                    </Text>
                                    <Text style={styles.historyDate}>
                                        {entry.date} at {entry.time}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => deleteEntry(index)}
                                    style={styles.deleteButton}
                                >
                                    <Text style={styles.deleteText}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#1F2937",
    },
    backButton: {
        padding: 8,
    },
    backText: {
        fontSize: 24,
        color: "#FFFFFF",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    inputCard: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 12,
    },
    input: {
        backgroundColor: "#111827",
        borderRadius: 12,
        padding: 16,
        fontSize: 18,
        color: "#FFFFFF",
        marginBottom: 16,
    },
    goalInfo: {
        backgroundColor: "#111827",
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    goalText: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 4,
    },
    diffText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#8B5CF6",
    },
    saveButton: {
        backgroundColor: "#3B82F6",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    historySection: {
        marginBottom: 20,
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 12,
    },
    historyCard: {
        backgroundColor: "#1F2937",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    historyLeft: {
        flex: 1,
    },
    historyWeight: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    historyDate: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    deleteButton: {
        padding: 4,
    },
    deleteText: {
        fontSize: 20,
    },
});
