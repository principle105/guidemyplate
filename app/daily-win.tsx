import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function DailyWinScreen() {
    const router = useRouter();
    const [winText, setWinText] = useState("");
    const [selectedEmoji, setSelectedEmoji] = useState("🎉");

    const emojis = ["🎉", "💪", "🌟", "✨", "🔥", "👏", "🙌", "❤️"];

    const saveWin = async () => {
        if (!winText.trim()) {
            Alert.alert("Share Your Win", "Tell us about your success today!");
            return;
        }

        const win = {
            text: winText,
            emoji: selectedEmoji,
            date: new Date().toLocaleDateString(),
        };

        try {
            // Get existing wins
            const winsData = await AsyncStorage.getItem("dailyWins");
            const wins = winsData ? JSON.parse(winsData) : [];
            wins.unshift(win);

            // Keep last 30 wins
            if (wins.length > 30) {
                wins.pop();
            }

            await AsyncStorage.setItem("dailyWins", JSON.stringify(wins));
            
            Alert.alert(
                "Amazing! 🎉",
                "You're building momentum. Every win counts!",
                [
                    {
                        text: "Keep Going!",
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            console.error("Error saving win:", error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.content}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.closeButton}
                    >
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.main}>
                    <Text style={styles.title}>Today's Win 🎯</Text>
                    <Text style={styles.subtitle}>
                        Celebrate your progress - big or small!
                    </Text>

                    <View style={styles.emojiSelector}>
                        {emojis.map((emoji) => (
                            <TouchableOpacity
                                key={emoji}
                                style={[
                                    styles.emojiButton,
                                    selectedEmoji === emoji &&
                                        styles.emojiButtonSelected,
                                ]}
                                onPress={() => setSelectedEmoji(emoji)}
                            >
                                <Text style={styles.emoji}>{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Today I..."
                        placeholderTextColor="#9CA3AF"
                        value={winText}
                        onChangeText={setWinText}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        autoFocus
                    />

                    <View style={styles.examples}>
                        <Text style={styles.examplesTitle}>Ideas:</Text>
                        <Text style={styles.exampleText}>
                            • Chose stairs over elevator
                        </Text>
                        <Text style={styles.exampleText}>
                            • Drank 8 cups of water
                        </Text>
                        <Text style={styles.exampleText}>
                            • Said no to late-night snacking
                        </Text>
                        <Text style={styles.exampleText}>
                            • Cooked a meal instead of ordering
                        </Text>
                        <Text style={styles.exampleText}>
                            • Felt more energetic today
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={saveWin}
                    >
                        <Text style={styles.saveButtonText}>
                            Celebrate This Win!
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.skipText}>Maybe Later</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0A0A",
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "flex-end",
        padding: 20,
        paddingTop: 10,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#1F2937",
        justifyContent: "center",
        alignItems: "center",
    },
    closeText: {
        fontSize: 20,
        color: "#9CA3AF",
    },
    main: {
        flex: 1,
        padding: 24,
        paddingTop: 0,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#9CA3AF",
        textAlign: "center",
        marginBottom: 32,
    },
    emojiSelector: {
        flexDirection: "row",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 24,
    },
    emojiButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#1F2937",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    emojiButtonSelected: {
        borderColor: "#8B5CF6",
        backgroundColor: "#2D1B4E",
    },
    emoji: {
        fontSize: 28,
    },
    input: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: "#FFFFFF",
        minHeight: 120,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#374151",
    },
    examples: {
        backgroundColor: "#1F2937",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    examplesTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#8B5CF6",
        marginBottom: 8,
    },
    exampleText: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 4,
    },
    saveButton: {
        backgroundColor: "#8B5CF6",
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: "center",
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    skipButton: {
        paddingVertical: 16,
        alignItems: "center",
    },
    skipText: {
        fontSize: 16,
        color: "#6B7280",
    },
});
