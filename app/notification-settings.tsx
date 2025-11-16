import NotificationManager from "@/services/NotificationManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function NotificationSettings() {
    const [mealReminders, setMealReminders] = useState(true);
    const [goalReminders, setGoalReminders] = useState(true);
    const [motivation, setMotivation] = useState(true);
    const [hydration, setHydration] = useState(true);
    const [scheduledCount, setScheduledCount] = useState(0);

    useEffect(() => {
        loadSettings();
        updateScheduledCount();
    }, []);

    const loadSettings = async () => {
        try {
            const meal = await AsyncStorage.getItem("mealRemindersEnabled");
            const goal = await AsyncStorage.getItem("goalRemindersEnabled");
            const motiv = await AsyncStorage.getItem("motivationEnabled");
            const water = await AsyncStorage.getItem("hydrationEnabled");

            setMealReminders(meal !== "false");
            setGoalReminders(goal !== "false");
            setMotivation(motiv !== "false");
            setHydration(water !== "false");
        } catch (error) {
            console.error("Error loading settings:", error);
        }
    };

    const updateScheduledCount = async () => {
        const count = await NotificationManager.getScheduledCount();
        setScheduledCount(count);
    };

    const toggleMealReminders = async (value: boolean) => {
        setMealReminders(value);
        await AsyncStorage.setItem("mealRemindersEnabled", String(value));
        await NotificationManager.scheduleAllNotifications();
        await updateScheduledCount();
    };

    const toggleGoalReminders = async (value: boolean) => {
        setGoalReminders(value);
        await AsyncStorage.setItem("goalRemindersEnabled", String(value));
        await NotificationManager.scheduleAllNotifications();
        await updateScheduledCount();
    };

    const toggleMotivation = async (value: boolean) => {
        setMotivation(value);
        await AsyncStorage.setItem("motivationEnabled", String(value));
        await NotificationManager.scheduleAllNotifications();
        await updateScheduledCount();
    };

    const toggleHydration = async (value: boolean) => {
        setHydration(value);
        await AsyncStorage.setItem("hydrationEnabled", String(value));
        await NotificationManager.scheduleAllNotifications();
        await updateScheduledCount();
    };

    const handleTestNotification = async () => {
        await NotificationManager.sendTestNotification();
        Alert.alert(
            "Test Sent! 📬",
            "You should receive a notification in 2 seconds",
            [{ text: "Got it!" }]
        );
    };

    const handleEnableAll = async () => {
        const granted = await NotificationManager.requestPermissions();

        if (granted) {
            await NotificationManager.scheduleAllNotifications();
            await updateScheduledCount();
            Alert.alert(
                "All Set! 🎉",
                "We'll send you gentle, supportive reminders throughout your day",
                [{ text: "Awesome!" }]
            );
        } else {
            Alert.alert(
                "Permission Needed",
                "Please enable notifications in your device settings",
                [{ text: "OK" }]
            );
        }
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
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
            >
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>
                        💚 Get gentle nudges, not nagging reminders
                    </Text>
                    <Text style={styles.infoText}>
                        Our notifications feel like a supportive friend texting
                        you - encouraging, actionable, never overwhelming.
                    </Text>
                </View>

                <View style={styles.statsCard}>
                    <Text style={styles.statsNumber}>{scheduledCount}</Text>
                    <Text style={styles.statsLabel}>
                        Active notifications scheduled
                    </Text>
                </View>

                {/* Meal Support */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🍽️ Meal Support</Text>

                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Text style={styles.settingTitle}>
                                Meal ideas & tips
                            </Text>
                            <Text style={styles.settingDescription}>
                                Gentle reminders with simple meal suggestions
                            </Text>
                        </View>
                        <Switch
                            value={mealReminders}
                            onValueChange={toggleMealReminders}
                            trackColor={{ false: "#374151", true: "#8B5CF6" }}
                            thumbColor="#FFFFFF"
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Text style={styles.settingTitle}>
                                Hydration reminders
                            </Text>
                            <Text style={styles.settingDescription}>
                                3x daily - quick water break nudges
                            </Text>
                        </View>
                        <Switch
                            value={hydration}
                            onValueChange={toggleHydration}
                            trackColor={{ false: "#374151", true: "#8B5CF6" }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                </View>

                {/* Goals & Check-ins */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        🎯 Goals & Check-ins
                    </Text>

                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Text style={styles.settingTitle}>
                                Daily goal reminders
                            </Text>
                            <Text style={styles.settingDescription}>
                                Check-ins for your micro-goals
                            </Text>
                        </View>
                        <Switch
                            value={goalReminders}
                            onValueChange={toggleGoalReminders}
                            trackColor={{ false: "#374151", true: "#8B5CF6" }}
                            thumbColor="#FFFFFF"
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Text style={styles.settingTitle}>
                                Encouraging messages
                            </Text>
                            <Text style={styles.settingDescription}>
                                2-3 times per week, never overwhelming
                            </Text>
                        </View>
                        <Switch
                            value={motivation}
                            onValueChange={toggleMotivation}
                            trackColor={{ false: "#374151", true: "#8B5CF6" }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                </View>

                {/* Action Buttons */}
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleEnableAll}
                >
                    <Text style={styles.primaryButtonText}>
                        🔔 Enable All Notifications
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleTestNotification}
                >
                    <Text style={styles.secondaryButtonText}>
                        📬 Send Test Notification
                    </Text>
                </TouchableOpacity>

                <View style={styles.examplesCard}>
                    <Text style={styles.examplesTitle}>
                        📱 Example Notifications:
                    </Text>
                    <View style={styles.exampleItem}>
                        <Text style={styles.exampleEmoji}>☀️</Text>
                        <View style={styles.exampleText}>
                            <Text style={styles.exampleTitle}>
                                Good morning!
                            </Text>
                            <Text style={styles.exampleBody}>
                                Start with protein: eggs, yogurt, or nuts. Your
                                body will thank you! 💪
                            </Text>
                        </View>
                    </View>

                    <View style={styles.exampleItem}>
                        <Text style={styles.exampleEmoji}>🎯</Text>
                        <View style={styles.exampleText}>
                            <Text style={styles.exampleTitle}>
                                Today's micro-goal
                            </Text>
                            <Text style={styles.exampleBody}>
                                Pick ONE thing: drink water, take stairs, or add
                                a veggie. That's it!
                            </Text>
                        </View>
                    </View>

                    <View style={styles.exampleItem}>
                        <Text style={styles.exampleEmoji}>💌</Text>
                        <View style={styles.exampleText}>
                            <Text style={styles.exampleTitle}>
                                A note for you
                            </Text>
                            <Text style={styles.exampleBody}>
                                Small steps lead to big changes. You're doing
                                amazing!
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
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
    infoCard: {
        backgroundColor: "#1E3A5F",
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: "#93C5FD",
        lineHeight: 20,
    },
    statsCard: {
        backgroundColor: "#1F2937",
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 24,
    },
    statsNumber: {
        fontSize: 48,
        fontWeight: "bold",
        color: "#8B5CF6",
        marginBottom: 4,
    },
    statsLabel: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1F2937",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    settingLeft: {
        flex: 1,
        marginRight: 16,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    primaryButton: {
        backgroundColor: "#8B5CF6",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 12,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    secondaryButton: {
        backgroundColor: "#1F2937",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#374151",
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    examplesCard: {
        backgroundColor: "#111827",
        padding: 16,
        borderRadius: 12,
    },
    examplesTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 16,
    },
    exampleItem: {
        flexDirection: "row",
        marginBottom: 16,
    },
    exampleEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    exampleText: {
        flex: 1,
    },
    exampleTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    exampleBody: {
        fontSize: 13,
        color: "#9CA3AF",
        lineHeight: 18,
    },
});
