import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import MotivationEngine, { MotivationInsight } from "../../services/MotivationEngine";

const screenWidth = Dimensions.get("window").width;

export default function ProgressTab() {
    const [surveyData, setSurveyData] = useState<any>(null);
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [weightHistory, setWeightHistory] = useState<any[]>([]);
    const [newWeight, setNewWeight] = useState('');
    const [showWeightInput, setShowWeightInput] = useState(false);
    const [motivationInsights, setMotivationInsights] = useState<MotivationInsight[]>([]);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        loadData();
    }, []);
    
    useEffect(() => {
        if (surveyData && weightHistory) {
            loadMotivationInsights();
        }
    }, [surveyData, weightHistory]);
    
    // Reload data when survey data updates to ensure goal weight is current
    useEffect(() => {
        if (surveyData) {
            // Force re-render with updated survey data
            loadData();
        }
    }, [surveyData?.goalWeight, surveyData?.currentWeight]);

    const loadData = async () => {
        const survey = await AsyncStorage.getItem("surveyData");
        if (survey) setSurveyData(JSON.parse(survey));

        // Load weight history
        const history = await AsyncStorage.getItem("weightHistory");
        if (history) {
            setWeightHistory(JSON.parse(history));
        }

        // Load motivational insights
        await loadMotivationInsights();
        
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
        
        // Debug log to check loaded data
        console.log('Progress tab loaded data:', {
            surveyCurrentWeight: surveyData?.currentWeight,
            surveyGoalWeight: surveyData?.goalWeight,
            weightHistoryLength: history ? JSON.parse(history).length : 0
        });
        
        setDataLoaded(true);
    };

    const loadMotivationInsights = async () => {
        try {
            if (surveyData && weightHistory.length > 0) {
                const currentWeight = weightHistory[0]?.weight || Number(surveyData.currentWeight);
                const insights = await MotivationEngine.generateMotivationalInsights(
                    surveyData,
                    weightHistory,
                    currentWeight
                );
                setMotivationInsights(insights);
            } else if (surveyData) {
                // New user with no weight history yet
                const currentWeight = Number(surveyData.currentWeight);
                const insights = await MotivationEngine.generateMotivationalInsights(
                    surveyData,
                    [],
                    currentWeight
                );
                setMotivationInsights(insights);
            }
        } catch (error) {
            console.error('Error loading motivation insights:', error);
        }
    };

    const logWeight = async () => {
        if (!newWeight || isNaN(Number(newWeight))) {
            Alert.alert('Invalid Weight', 'Please enter a valid weight');
            return;
        }

        const weightEntry = {
            weight: parseFloat(newWeight),
            date: new Date().toISOString(),
        };

        const updatedHistory = [weightEntry, ...weightHistory];
        setWeightHistory(updatedHistory);
        await AsyncStorage.setItem('weightHistory', JSON.stringify(updatedHistory));
        
        // Also update the current weight key for immediate sync
        await AsyncStorage.setItem('currentWeight', newWeight);
        
        setNewWeight('');
        setShowWeightInput(false);
        
        Alert.alert(
            'Weight Logged! 🎉',
            `Your weight of ${newWeight} lbs has been recorded.`,
            [{ text: 'Great!', style: 'default' }]
        );
        
        // Refresh motivation insights with new weight
        await loadMotivationInsights();
    };

    const deleteWeightEntry = async (index: number) => {
        Alert.alert(
            'Delete Weight Entry',
            'Are you sure you want to delete this weight entry?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const updatedHistory = weightHistory.filter((_, i) => i !== index);
                        setWeightHistory(updatedHistory);
                        await AsyncStorage.setItem('weightHistory', JSON.stringify(updatedHistory));
                        
                        // If deleting the most recent entry, update current weight to next most recent or survey data
                        if (index === 0) {
                            const newCurrentWeight = updatedHistory.length > 0 
                                ? updatedHistory[0].weight 
                                : (surveyData?.currentWeight ? Number(surveyData.currentWeight) : 185);
                            await AsyncStorage.setItem('currentWeight', newCurrentWeight.toString());
                        }
                        
                        await loadMotivationInsights();
                        Alert.alert('Deleted!', 'Weight entry has been removed.');
                    }
                }
            ]
        );
    };

    const resetToSurveyData = async () => {
        Alert.alert(
            'Reset Weight Data',
            'This will clear all weight history and reset to your survey starting weight. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('weightHistory');
                        await AsyncStorage.removeItem('currentWeight');
                        setWeightHistory([]);
                        await loadMotivationInsights();
                        Alert.alert('Reset Complete!', 'Weight data has been reset to your survey starting weight.');
                    }
                }
            ]
        );
    };

    // Show survey weight first for new users, then most recent logged weight
    const currentWeight = weightHistory.length > 0 ? weightHistory[0].weight : (surveyData?.currentWeight ? Number(surveyData.currentWeight) : (dataLoaded ? 185 : 0));
    const goalWeight = surveyData?.goalWeight ? Number(surveyData.goalWeight) : (dataLoaded ? 165 : 0);
    const startingWeight = surveyData?.currentWeight ? Number(surveyData.currentWeight) : (dataLoaded ? 185 : 0);
    const weightLost = Math.max(0, startingWeight - currentWeight);
    const remaining = Math.max(0, currentWeight - goalWeight);

    // Show loading screen while data loads
    if (!dataLoaded) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading your progress...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
            >
                <Text style={styles.title}>Your Progress 📊</Text>

                {/* Interactive Weight Journey Timeline */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Weight Journey Timeline</Text>
                    
                    {/* Current Status */}
                    <View style={styles.weightRow}>
                        <View style={styles.weightItem}>
                            <Text style={styles.weightLabel}>Start</Text>
                            <Text style={styles.weightValue}>{surveyData?.currentWeight || currentWeight}</Text>
                            <Text style={styles.weightUnit}>lbs</Text>
                        </View>
                        <Text style={styles.arrow}>→</Text>
                        <View style={styles.weightItem}>
                            <Text style={styles.weightLabel}>Current</Text>
                            <Text style={[styles.weightValue, {color: "#8B5CF6"}]}>
                                {weightHistory.length > 0 ? weightHistory[0].weight : (surveyData?.currentWeight || currentWeight)}
                            </Text>
                            <Text style={styles.weightUnit}>lbs</Text>
                        </View>
                        <Text style={styles.arrow}>→</Text>
                        <View style={styles.weightItem}>
                            <Text style={styles.weightLabel}>Goal</Text>
                            <Text style={[styles.weightValue, {color: "#10B981"}]}>{goalWeight}</Text>
                            <Text style={styles.weightUnit}>lbs</Text>
                        </View>
                    </View>

                    {/* Real Progress Bar */}
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${startingWeight !== goalWeight ? 
                                        Math.min(100, Math.max(0, ((startingWeight - currentWeight) / (startingWeight - goalWeight)) * 100))
                                        : 100}%`,
                                },
                            ]}
                        />
                    </View>

                    <Text style={styles.progressText}>
                        {weightHistory.length > 0 
                            ? `🎉 ${Math.abs(Number(surveyData?.currentWeight || currentWeight) - weightHistory[0].weight).toFixed(1)} lbs ${Number(surveyData?.currentWeight || currentWeight) > weightHistory[0].weight ? 'lost' : 'gained'} so far!`
                            : '📊 Start logging your weight to track real progress'
                        }
                    </Text>
                    
                    {/* Weight Input Section */}
                    {showWeightInput ? (
                        <View style={styles.weightInputContainer}>
                            <TextInput
                                style={styles.weightInput}
                                value={newWeight}
                                onChangeText={setNewWeight}
                                placeholder="Enter today's weight"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                            />
                            <View style={styles.inputButtons}>
                                <TouchableOpacity 
                                    style={[styles.inputButton, {backgroundColor: '#10B981'}]}
                                    onPress={logWeight}
                                >
                                    <Text style={styles.inputButtonText}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.inputButton, {backgroundColor: '#6B7280'}]}
                                    onPress={() => {setShowWeightInput(false); setNewWeight('');}}
                                >
                                    <Text style={styles.inputButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity 
                            style={styles.logButton}
                            onPress={() => setShowWeightInput(true)}
                        >
                            <Text style={styles.logButtonText}>
                                📝 Log Today's Weight
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Weight History Timeline */}
                    {weightHistory.length > 0 && (
                        <View style={styles.timeline}>
                            <View style={styles.timelineHeader}>
                                <Text style={styles.timelineTitle}>Recent Entries</Text>
                                <TouchableOpacity onPress={resetToSurveyData} style={styles.resetButton}>
                                    <Text style={styles.resetButtonText}>Reset</Text>
                                </TouchableOpacity>
                            </View>
                            {weightHistory.slice(0, 5).map((entry: any, index: number) => {
                                // Validate and format date
                                const entryDate = entry.date ? new Date(entry.date) : new Date();
                                const isValidDate = !isNaN(entryDate.getTime());
                                const formattedDate = isValidDate 
                                    ? entryDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
                                    : 'Invalid Date';
                                
                                return (
                                    <View key={index} style={styles.timelineEntry}>
                                        <View style={styles.entryInfo}>
                                            <Text style={styles.timelineDate}>{formattedDate}</Text>
                                            <Text style={styles.timelineWeight}>{entry.weight} lbs</Text>
                                            {index > 0 && (
                                                <Text style={[
                                                    styles.timelineChange,
                                                    {color: entry.weight < weightHistory[index-1].weight ? '#10B981' : '#F59E0B'}
                                                ]}>
                                                    {entry.weight < weightHistory[index-1].weight ? '-' : '+'}
                                                    {Math.abs(entry.weight - weightHistory[index-1].weight).toFixed(1)}
                                                </Text>
                                            )}
                                        </View>
                                        <TouchableOpacity 
                                            onPress={() => deleteWeightEntry(index)}
                                            style={styles.deleteButton}
                                        >
                                            <Text style={styles.deleteButtonText}>🗑️</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* AI Food Analyzer Feature */}
                <TouchableOpacity 
                    style={styles.aiAnalyzerCard}
                    onPress={() => {
                        const router = require('expo-router');
                        router.router.push("/ai-food-analyzer");
                    }}
                    activeOpacity={0.8}
                >
                    <View style={styles.aiHeader}>
                        <Text style={styles.aiIcon}>📸</Text>
                        <View style={styles.aiBadge}>
                            <Text style={styles.aiBadgeText}>NEW</Text>
                        </View>
                    </View>
                    <Text style={styles.aiTitle}>AI Food Photo Analyzer</Text>
                    <Text style={styles.aiSubtitle}>
                        Snap a photo → Get health score → Learn how to fix it
                    </Text>
                    
                    <View style={styles.aiFeatures}>
                        <View style={styles.aiFeature}>
                            <Text style={styles.aiFeatureIcon}>📸</Text>
                            <Text style={styles.aiFeatureText}>Detect foods</Text>
                        </View>
                        <View style={styles.aiFeature}>
                            <Text style={styles.aiFeatureIcon}>💯</Text>
                            <Text style={styles.aiFeatureText}>Health score</Text>
                        </View>
                        <View style={styles.aiFeature}>
                            <Text style={styles.aiFeatureIcon}>🔄</Text>
                            <Text style={styles.aiFeatureText}>Smart swaps</Text>
                        </View>
                    </View>
                    
                    <View style={styles.aiButton}>
                        <Text style={styles.aiButtonText}>Try AI Analyzer →</Text>
                    </View>
                </TouchableOpacity>

                {/* Dynamic Motivational Insights */}
                {motivationInsights.map((insight, index) => (
                    <View key={index} style={[
                        styles.card,
                        insight.type === 'milestone' && styles.milestoneCard,
                        insight.type === 'progress' && styles.progressCard
                    ]}>
                        <View style={styles.insightHeader}>
                            <Text style={styles.insightIcon}>{insight.icon}</Text>
                            <Text style={styles.cardTitle}>{insight.title}</Text>
                        </View>
                        
                        <Text style={styles.insightMessage}>{insight.message}</Text>
                        
                        {insight.statistic && (
                            <View style={styles.statisticContainer}>
                                <Text style={styles.statisticText}>{insight.statistic}</Text>
                            </View>
                        )}
                        
                        <Text style={styles.encouragementText}>{insight.encouragement}</Text>
                    </View>
                ))}
                
                {motivationInsights.length === 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>🎯 Your Journey Awaits</Text>
                        <Text style={styles.insightMessage}>
                            Start tracking your weight to see personalized motivation and insights!
                        </Text>
                        <Text style={styles.encouragementText}>
                            Every step forward is progress worth celebrating.
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
        color: "#D1D5DB",
        textAlign: "center",
        lineHeight: 20,
    },
    // Motivation Insight Styles
    milestoneCard: {
        backgroundColor: "#065F46",
        borderWidth: 2,
        borderColor: "#10B981",
    },
    progressCard: {
        backgroundColor: "#1E3A8A",
        borderWidth: 2,
        borderColor: "#3B82F6",
    },
    insightHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    insightIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    insightMessage: {
        fontSize: 16,
        color: "#F3F4F6",
        lineHeight: 24,
        marginBottom: 12,
    },
    statisticContainer: {
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: 8,
        marginBottom: 12,
        alignSelf: "flex-start",
    },
    statisticText: {
        fontSize: 14,
        color: "#FBBF24",
        fontWeight: "600",
    },
    encouragementText: {
        fontSize: 14,
        color: "#A7F3D0",
        fontStyle: "italic",
        textAlign: "center",
        lineHeight: 20,
    },
    timelineHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    resetButton: {
        backgroundColor: "#F59E0B",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    resetButtonText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
    entryInfo: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    deleteButton: {
        marginLeft: 12,
        padding: 8,
    },
    deleteButtonText: {
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#9CA3AF",
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
    weightInputContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: "#374151",
        borderRadius: 12,
    },
    weightInput: {
        backgroundColor: "#1F2937",
        color: "#FFFFFF",
        padding: 12,
        borderRadius: 8,
        fontSize: 18,
        textAlign: "center",
        marginBottom: 12,
    },
    inputButtons: {
        flexDirection: "row",
        gap: 12,
    },
    inputButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    inputButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 16,
    },
    logButton: {
        backgroundColor: "#8B5CF6",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 16,
    },
    logButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 16,
    },
    timeline: {
        marginTop: 20,
    },
    timelineTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 12,
    },
    timelineEntry: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#374151",
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    timelineDate: {
        fontSize: 14,
        color: "#9CA3AF",
        flex: 1,
    },
    timelineWeight: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        flex: 1,
        textAlign: "center",
    },
    timelineChange: {
        fontSize: 14,
        fontWeight: "600",
        flex: 1,
        textAlign: "right",
    },
    challengeContent: {
        marginTop: 12,
    },
    challengeDescription: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 16,
        lineHeight: 20,
    },
    challengeActions: {
        gap: 12,
    },
    challengeAction: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#374151",
        padding: 12,
        borderRadius: 8,
        gap: 12,
    },
    actionIcon: {
        fontSize: 20,
    },
    actionText: {
        flex: 1,
        fontSize: 14,
        color: "#FFFFFF",
        fontWeight: "500",
    },
    actionStatus: {
        fontSize: 12,
        color: "#9CA3AF",
        backgroundColor: "#1F2937",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    challengeTip: {
        fontSize: 13,
        color: "#6B7280",
        fontStyle: "italic",
        textAlign: "center",
        marginTop: 16,
        padding: 12,
        backgroundColor: "#374151",
        borderRadius: 8,
    },
    
    // AI Analyzer Card Styles
    aiAnalyzerCard: {
        backgroundColor: "#7C3AED",
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        shadowColor: "#7C3AED",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    aiHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    aiIcon: {
        fontSize: 48,
    },
    aiBadge: {
        backgroundColor: "#10B981",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    aiBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    aiTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    aiSubtitle: {
        fontSize: 16,
        color: "#E9D5FF",
        marginBottom: 20,
        lineHeight: 22,
    },
    aiFeatures: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    aiFeature: {
        alignItems: "center",
        flex: 1,
    },
    aiFeatureIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    aiFeatureText: {
        fontSize: 12,
        color: "#E9D5FF",
        fontWeight: "600",
        textAlign: "center",
    },
    aiButton: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 14,
        alignItems: "center",
    },
    aiButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#7C3AED",
    },
});
