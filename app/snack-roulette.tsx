import SnackRoulette from "@/services/SnackRoulette";
import { useRouter } from "expo-router";
import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useState } from "react";
import {
    Animated,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";

export default function SnackRouletteScreen() {
    const router = useRouter();
    const [snack, setSnack] = useState<any>(null);
    const [shakeDetected, setShakeDetected] = useState(false);
    const [isListening, setIsListening] = useState(true);
    const [shakeAnimation] = useState(new Animated.Value(0));
    const [subscription, setSubscription] = useState<any>(null);

    useEffect(() => {
        // Start listening for shake
        startShakeDetection();

        return () => {
            // Cleanup
            if (subscription) {
                subscription.remove();
            }
        };
    }, []);

    const startShakeDetection = () => {
        // Lower threshold = more sensitive (triggers faster than Expo's dev menu)
        const SHAKE_THRESHOLD = 1.2;
        let lastShakeTime = 0;

        const sub = Accelerometer.addListener(accelerometerData => {
            if (!isListening) return;

            const { x, y, z } = accelerometerData;
            const acceleration = Math.sqrt(x * x + y * y + z * z);
            
            const now = Date.now();
            // Reduced cooldown to 500ms so it triggers quickly
            if (acceleration > SHAKE_THRESHOLD && now - lastShakeTime > 500) {
                lastShakeTime = now;
                handleShake();
            }
        });

        // Faster update interval = quicker detection
        Accelerometer.setUpdateInterval(50);
        setSubscription(sub);
    };

    const handleShake = () => {
        setShakeDetected(true);
        setIsListening(false);
        
        // Vibrate for feedback
        Vibration.vibrate(100);
        
        // Animate shake icon
        Animated.sequence([
            Animated.timing(shakeAnimation, {
                toValue: 10,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: -10,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: 10,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: 0,
                duration: 50,
                useNativeDriver: true,
            }),
        ]).start();

        // Generate random snack after animation
        setTimeout(() => {
            const randomSnack = SnackRoulette.getRandomSnack();
            setSnack(randomSnack);
            setShakeDetected(false);
            
            // Re-enable listening after 2 seconds
            setTimeout(() => {
                setIsListening(true);
            }, 2000);
        }, 500);
    };

    const manualShuffle = () => {
        handleShake();
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

                <Text style={styles.title}>🎲 Snack Roulette</Text>
                <Text style={styles.subtitle}>
                    Shake your phone for a healthy snack idea!
                </Text>

                {/* Shake Prompt */}
                {!snack && !shakeDetected && (
                    <View style={styles.shakePrompt}>
                        <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
                            <Text style={styles.shakeIcon}>🎲</Text>
                        </Animated.View>
                        <Text style={styles.shakeText}>
                            Get a Random Healthy Snack!
                        </Text>
                        <TouchableOpacity 
                            style={styles.manualButton}
                            onPress={manualShuffle}
                        >
                            <Text style={styles.manualButtonText}>
                                🎰 Spin for Snack Idea
                            </Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.orText}>or shake your phone</Text>
                        
                        <View style={styles.infoBox}>
                            <Text style={styles.infoText}>
                                💡 Get random healthy snacks that replace junk food with delicious alternatives
                            </Text>
                        </View>
                    </View>
                )}

                {/* Loading State */}
                {shakeDetected && (
                    <View style={styles.loadingContainer}>
                        <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
                            <Text style={styles.loadingIcon}>🎰</Text>
                        </Animated.View>
                        <Text style={styles.loadingText}>Finding your perfect snack...</Text>
                    </View>
                )}

                {/* Snack Display */}
                {snack && !shakeDetected && (
                    <>
                        {/* Main Snack Card */}
                        <View style={styles.snackCard}>
                            <Text style={styles.snackEmoji}>{snack.emoji}</Text>
                            <Text style={styles.snackName}>{snack.name}</Text>
                            
                            <View style={styles.snackMeta}>
                                <View style={[styles.caloriesBadge, { backgroundColor: SnackRoulette.getCalorieColor(snack.calories) }]}>
                                    <Text style={styles.caloriesText}>{snack.calories} cal</Text>
                                </View>
                                <View style={styles.timeBadge}>
                                    <Text style={styles.timeText}>⏱️ {snack.prepTime}</Text>
                                </View>
                            </View>

                            <View style={styles.benefitContainer}>
                                <Text style={styles.benefitLabel}>Health Benefit:</Text>
                                <Text style={styles.benefitText}>{snack.healthBenefit}</Text>
                            </View>

                            <View style={styles.replacesContainer}>
                                <Text style={styles.replacesLabel}>✅ Replaces:</Text>
                                <Text style={styles.replacesText}>{snack.replacesUnhealthy}</Text>
                            </View>
                        </View>

                        {/* Recipe Card */}
                        <View style={styles.recipeCard}>
                            <Text style={styles.sectionTitle}>📝 Quick Recipe</Text>
                            <Text style={styles.recipeText}>{snack.recipe}</Text>
                        </View>

                        {/* Ingredients Card */}
                        <View style={styles.ingredientsCard}>
                            <Text style={styles.sectionTitle}>🛒 Ingredients</Text>
                            {snack.ingredients.map((ingredient: string, index: number) => (
                                <View key={index} style={styles.ingredientItem}>
                                    <Text style={styles.ingredientBullet}>•</Text>
                                    <Text style={styles.ingredientText}>{ingredient}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Shuffle Again Button */}
                        <TouchableOpacity 
                            style={styles.shuffleButton}
                            onPress={manualShuffle}
                        >
                            <Text style={styles.shuffleButtonText}>
                                🎲 Get Another Snack Idea
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.shakeHint}>
                            💡 Tip: Shake your phone anytime for a new snack!
                        </Text>
                    </>
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
    shakePrompt: {
        alignItems: "center",
        paddingVertical: 60,
    },
    shakeIcon: {
        fontSize: 100,
        marginBottom: 24,
    },
    shakeText: {
        fontSize: 20,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 24,
        textAlign: "center",
    },
    manualButton: {
        backgroundColor: "#8B5CF6",
        borderRadius: 16,
        paddingHorizontal: 40,
        paddingVertical: 20,
        marginBottom: 16,
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    manualButtonText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    orText: {
        fontSize: 14,
        color: "#6B7280",
        fontStyle: "italic",
        marginBottom: 16,
    },
    infoBox: {
        backgroundColor: "#1F2937",
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
    },
    infoText: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
        lineHeight: 20,
    },
    loadingContainer: {
        alignItems: "center",
        paddingVertical: 80,
    },
    loadingIcon: {
        fontSize: 100,
        marginBottom: 24,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#9CA3AF",
    },
    snackCard: {
        backgroundColor: "#10B981",
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        marginBottom: 16,
    },
    snackEmoji: {
        fontSize: 80,
        marginBottom: 16,
    },
    snackName: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 16,
    },
    snackMeta: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 20,
    },
    caloriesBadge: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    caloriesText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    timeBadge: {
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    timeText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    benefitContainer: {
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 12,
        padding: 16,
        width: "100%",
        marginBottom: 12,
    },
    benefitLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 4,
        textTransform: "uppercase",
    },
    benefitText: {
        fontSize: 15,
        color: "#FFFFFF",
        lineHeight: 22,
    },
    replacesContainer: {
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 12,
        padding: 16,
        width: "100%",
    },
    replacesLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 4,
        textTransform: "uppercase",
    },
    replacesText: {
        fontSize: 15,
        color: "#FFFFFF",
        fontWeight: "600",
        fontStyle: "italic",
    },
    recipeCard: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 16,
    },
    recipeText: {
        fontSize: 16,
        color: "#E5E7EB",
        lineHeight: 24,
    },
    ingredientsCard: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    ingredientItem: {
        flexDirection: "row",
        marginBottom: 12,
        alignItems: "flex-start",
    },
    ingredientBullet: {
        fontSize: 16,
        color: "#10B981",
        marginRight: 12,
        fontWeight: "bold",
    },
    ingredientText: {
        fontSize: 15,
        color: "#E5E7EB",
        flex: 1,
        lineHeight: 22,
    },
    shuffleButton: {
        backgroundColor: "#8B5CF6",
        borderRadius: 16,
        padding: 18,
        alignItems: "center",
        marginBottom: 16,
    },
    shuffleButtonText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    shakeHint: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        fontStyle: "italic",
    },
});
