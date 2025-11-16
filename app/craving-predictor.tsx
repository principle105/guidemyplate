import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import PersonalizedAI, { CravingPrediction } from "../services/PersonalizedAI";

export default function CravingPredictorScreen() {
    const router = useRouter();
    const [prediction, setPrediction] = useState<CravingPrediction | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        analyzeCravingRisk();
    }, []);

    const analyzeCravingRisk = async () => {
        setLoading(true);
        try {
            const result = await PersonalizedAI.predictCraving();
            setPrediction(result);
        } catch (error) {
            console.error("Error predicting craving:", error);
        }
        setLoading(false);
    };

    const getRiskColor = (level: string) => {
        if (level === "high") return "#EF4444";
        if (level === "medium") return "#F59E0B";
        return "#10B981";
    };

    const getRiskEmoji = (level: string) => {
        if (level === "high") return "🔴";
        if (level === "medium") return "🟡";
        return "🟢";
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={analyzeCravingRisk} style={styles.refreshButton}>
                        <Text style={styles.refreshText}>🔄</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.title}>🔮 AI Craving Predictor</Text>
                <Text style={styles.subtitle}>
                    Predicts your cravings BEFORE they happen
                </Text>

                {loading ? (
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color="#8B5CF6" />
                        <Text style={styles.loadingText}>Analyzing your patterns...</Text>
                    </View>
                ) : prediction ? (
                    <>
                        {/* Risk Level Card */}
                        <View
                            style={[
                                styles.riskCard,
                                { borderLeftColor: getRiskColor(prediction.riskLevel) },
                            ]}
                        >
                            <View style={styles.riskHeader}>
                                <Text style={styles.riskEmoji}>{getRiskEmoji(prediction.riskLevel)}</Text>
                                <View style={styles.riskInfo}>
                                    <Text style={styles.riskLabel}>CRAVING RISK</Text>
                                    <Text
                                        style={[
                                            styles.riskLevel,
                                            { color: getRiskColor(prediction.riskLevel) },
                                        ]}
                                    >
                                        {prediction.riskLevel.toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.confidenceBadge}>
                                    <Text style={styles.confidenceText}>{prediction.confidence}%</Text>
                                    <Text style={styles.confidenceLabel}>confident</Text>
                                </View>
                            </View>

                            <View style={styles.timeCard}>
                                <Text style={styles.timeIcon}>⏰</Text>
                                <View>
                                    <Text style={styles.timeLabel}>Predicted Craving Time</Text>
                                    <Text style={styles.timeValue}>
                                        In {prediction.timeUntilCraving.toFixed(1)} hours
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Why This Prediction */}
                        <View style={styles.reasonCard}>
                            <Text style={styles.cardTitle}>🧠 Why This Prediction?</Text>
                            <Text style={styles.reasonText}>{prediction.reason}</Text>
                        </View>

                        {/* Prevention Steps */}
                        <View style={styles.preventionCard}>
                            <Text style={styles.cardTitle}>✅ How to Prevent It</Text>
                            <Text style={styles.preventionSubtitle}>
                                Do these NOW to avoid the craving:
                            </Text>
                            {prediction.prevention.map((step, index) => (
                                <View key={index} style={styles.preventionStep}>
                                    <View style={styles.stepNumber}>
                                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                                    </View>
                                    <Text style={styles.stepText}>{step}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Impact Stats */}
                        <View style={styles.statsCard}>
                            <Text style={styles.statsTitle}>💡 The Science</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>300+</Text>
                                    <Text style={styles.statLabel}>Calories saved</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>87%</Text>
                                    <Text style={styles.statLabel}>Success rate</Text>
                                </View>
                            </View>
                            <Text style={styles.statsNote}>
                                When you prevent cravings BEFORE they hit, you're 3x more likely to
                                succeed vs. willpower alone.
                            </Text>
                        </View>

                        {/* How It Works */}
                        <View style={styles.howCard}>
                            <Text style={styles.howTitle}>🤖 How It Works</Text>
                            <Text style={styles.howText}>
                                Our AI analyzes your meal patterns, timing, protein intake, and historical
                                data to predict when blood sugar dips will trigger cravings. Most diet
                                failures happen from reactive decisions - we help you act proactively.
                            </Text>
                        </View>
                    </>
                ) : (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorIcon}>⚠️</Text>
                        <Text style={styles.errorText}>
                            Unable to analyze patterns. Log more meals to improve predictions!
                        </Text>
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
    loadingCard: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 40,
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#9CA3AF",
        marginTop: 16,
    },
    riskCard: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderLeftWidth: 4,
    },
    riskHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    riskEmoji: {
        fontSize: 48,
        marginRight: 16,
    },
    riskInfo: {
        flex: 1,
    },
    riskLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        fontWeight: "700",
        letterSpacing: 1,
        marginBottom: 4,
    },
    riskLevel: {
        fontSize: 24,
        fontWeight: "700",
    },
    confidenceBadge: {
        backgroundColor: "#374151",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        alignItems: "center",
    },
    confidenceText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#10B981",
    },
    confidenceLabel: {
        fontSize: 10,
        color: "#9CA3AF",
    },
    timeCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#374151",
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    timeIcon: {
        fontSize: 32,
    },
    timeLabel: {
        fontSize: 13,
        color: "#9CA3AF",
        marginBottom: 4,
    },
    timeValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    reasonCard: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 12,
    },
    reasonText: {
        fontSize: 15,
        color: "#E5E7EB",
        lineHeight: 22,
    },
    preventionCard: {
        backgroundColor: "#065F46",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    preventionSubtitle: {
        fontSize: 14,
        color: "#D1FAE5",
        marginBottom: 16,
    },
    preventionStep: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
        gap: 12,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#10B981",
        justifyContent: "center",
        alignItems: "center",
    },
    stepNumberText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    stepText: {
        flex: 1,
        fontSize: 15,
        color: "#FFFFFF",
        lineHeight: 22,
    },
    statsCard: {
        backgroundColor: "#1E3A8A",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    statValue: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#BFDBFE",
        textAlign: "center",
    },
    statsNote: {
        fontSize: 13,
        color: "#BFDBFE",
        lineHeight: 20,
        fontStyle: "italic",
    },
    howCard: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 20,
    },
    howTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 12,
    },
    howText: {
        fontSize: 14,
        color: "#9CA3AF",
        lineHeight: 22,
    },
    errorCard: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 40,
        alignItems: "center",
    },
    errorIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 16,
        color: "#9CA3AF",
        textAlign: "center",
        lineHeight: 24,
    },
});
