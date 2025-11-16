import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
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

type SurveyData = {
    mainReason: string;
    biggestChallenge: string;
    eatingPattern: string;
    satietyLevel: string;
    currentWeight: string;
    goalWeight: string;
    timeline: string;
    activityLevel: string;
    problemFoods: string[];
};

export default function SurveyScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 8;

    // Survey state
    const [mainReason, setMainReason] = useState("");
    const [biggestChallenge, setBiggestChallenge] = useState("");
    const [eatingPattern, setEatingPattern] = useState("");
    const [satietyLevel, setSatietyLevel] = useState("");
    const [currentWeight, setCurrentWeight] = useState("");
    const [goalWeight, setGoalWeight] = useState("");
    const [timeline, setTimeline] = useState("");
    const [activityLevel, setActivityLevel] = useState("");
    const [problemFoods, setProblemFoods] = useState<string[]>([]);

    const handleNext = () => {
        // Validate current step
        if (currentStep === 1 && !mainReason) {
            Alert.alert("Required", "Please select your main reason");
            return;
        }
        if (currentStep === 2 && !biggestChallenge) {
            Alert.alert("Required", "Please select your biggest challenge");
            return;
        }
        if (currentStep === 3 && !eatingPattern) {
            Alert.alert("Required", "Please select your eating pattern");
            return;
        }
        if (currentStep === 4 && !satietyLevel) {
            Alert.alert("Required", "Please tell us how you feel after eating");
            return;
        }
        if (currentStep === 5 && (!currentWeight || !goalWeight)) {
            Alert.alert("Required", "Please enter both weights");
            return;
        }
        if (currentStep === 6 && !timeline) {
            Alert.alert("Required", "Please select a timeline");
            return;
        }
        if (currentStep === 7 && !activityLevel) {
            Alert.alert("Required", "Please select your activity level");
            return;
        }

        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        const surveyData: SurveyData = {
            mainReason,
            biggestChallenge,
            eatingPattern,
            satietyLevel,
            currentWeight,
            goalWeight,
            timeline,
            activityLevel,
            problemFoods,
        };

        try {
            // Save survey data
            await AsyncStorage.setItem(
                "surveyData",
                JSON.stringify(surveyData)
            );
            await AsyncStorage.setItem("surveyCompleted", "true");

            Alert.alert(
                "All Set! 🎉",
                "We've personalized your experience based on your answers.",
                [
                    {
                        text: "Start Your Journey",
                        onPress: () => router.replace("/(tabs)"),
                    },
                ]
            );
        } catch (error) {
            Alert.alert("Error", "Failed to save your responses");
        }
    };

    const toggleProblemFood = (food: string) => {
        if (problemFoods.includes(food)) {
            setProblemFoods(problemFoods.filter((f) => f !== food));
        } else {
            setProblemFoods([...problemFoods, food]);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>
                            What's your main reason for wanting to change your
                            health?
                        </Text>
                        <Text style={styles.stepSubtitle}>
                            This helps us understand what matters most to you
                        </Text>
                        {[
                            { emoji: "⚡", text: "Feel more energetic" },
                            { emoji: "👨‍👩‍👧‍👦", text: "Keep up with my kids" },
                            { emoji: "🏥", text: "Health scare/concern" },
                            { emoji: "✨", text: "Feel confident again" },
                            { emoji: "👨‍⚕️", text: "Doctor recommended" },
                            { emoji: "💭", text: "Other reason" },
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.text}
                                style={[
                                    styles.optionButton,
                                    mainReason === option.text &&
                                        styles.optionButtonSelected,
                                ]}
                                onPress={() => setMainReason(option.text)}
                            >
                                <Text style={styles.optionEmoji}>
                                    {option.emoji}
                                </Text>
                                <Text
                                    style={[
                                        styles.optionText,
                                        mainReason === option.text &&
                                            styles.optionTextSelected,
                                    ]}
                                >
                                    {option.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>
                            What's been your biggest challenge with losing
                            weight?
                        </Text>
                        <Text style={styles.stepSubtitle}>
                            We'll help you overcome this specific barrier
                        </Text>
                        {[
                            { emoji: "🌙", text: "Late-night snacking" },
                            {
                                emoji: "🍽️",
                                text: "Skipping meals then overeating",
                            },
                            { emoji: "😋", text: "Not feeling full" },
                            { emoji: "😰", text: "Eating when stressed/bored" },
                            { emoji: "🍕", text: "Too many processed foods" },
                            { emoji: "❓", text: "Don't know where to start" },
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.text}
                                style={[
                                    styles.optionButton,
                                    biggestChallenge === option.text &&
                                        styles.optionButtonSelected,
                                ]}
                                onPress={() =>
                                    setBiggestChallenge(option.text)
                                }
                            >
                                <Text style={styles.optionEmoji}>
                                    {option.emoji}
                                </Text>
                                <Text
                                    style={[
                                        styles.optionText,
                                        biggestChallenge === option.text &&
                                            styles.optionTextSelected,
                                    ]}
                                >
                                    {option.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 3:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>
                            When do you tend to eat the most?
                        </Text>
                        <Text style={styles.stepSubtitle}>
                            Understanding your pattern helps us give better
                            advice
                        </Text>
                        {[
                            {
                                emoji: "☀️",
                                text: "Morning person (big breakfast)",
                            },
                            {
                                emoji: "🌙",
                                text: "Night eater (most calories after 6pm)",
                            },
                            {
                                emoji: "🍽️",
                                text: "Grazer (small meals all day)",
                            },
                            { emoji: "⏭️", text: "Skipper (skip meals often)" },
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.text}
                                style={[
                                    styles.optionButton,
                                    eatingPattern === option.text &&
                                        styles.optionButtonSelected,
                                ]}
                                onPress={() => setEatingPattern(option.text)}
                            >
                                <Text style={styles.optionEmoji}>
                                    {option.emoji}
                                </Text>
                                <Text
                                    style={[
                                        styles.optionText,
                                        eatingPattern === option.text &&
                                            styles.optionTextSelected,
                                    ]}
                                >
                                    {option.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 4:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>
                            How do you usually feel 2 hours after eating?
                        </Text>
                        <Text style={styles.stepSubtitle}>
                            This helps us recommend foods that keep you
                            satisfied
                        </Text>
                        {[
                            { emoji: "😋", text: "Still hungry" },
                            { emoji: "😊", text: "Satisfied and comfortable" },
                            { emoji: "😫", text: "Too full/uncomfortable" },
                            { emoji: "🤔", text: "Depends on what I ate" },
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.text}
                                style={[
                                    styles.optionButton,
                                    satietyLevel === option.text &&
                                        styles.optionButtonSelected,
                                ]}
                                onPress={() => setSatietyLevel(option.text)}
                            >
                                <Text style={styles.optionEmoji}>
                                    {option.emoji}
                                </Text>
                                <Text
                                    style={[
                                        styles.optionText,
                                        satietyLevel === option.text &&
                                            styles.optionTextSelected,
                                    ]}
                                >
                                    {option.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 5:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>
                            Let's set your weight goals
                        </Text>
                        <Text style={styles.stepSubtitle}>
                            We'll track your progress and celebrate your wins
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Current Weight (lbs)
                            </Text>
                            <TextInput
                                style={styles.numberInput}
                                placeholder="185"
                                placeholderTextColor="#6B7280"
                                value={currentWeight}
                                onChangeText={setCurrentWeight}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Goal Weight (lbs)
                            </Text>
                            <TextInput
                                style={styles.numberInput}
                                placeholder="165"
                                placeholderTextColor="#6B7280"
                                value={goalWeight}
                                onChangeText={setGoalWeight}
                                keyboardType="numeric"
                            />
                        </View>

                        {currentWeight && goalWeight && (
                            <View style={styles.goalSummary}>
                                <Text style={styles.goalSummaryText}>
                                    📊 Goal: Lose{" "}
                                    {Number(currentWeight) -
                                        Number(goalWeight)}{" "}
                                    lbs
                                </Text>
                            </View>
                        )}
                    </View>
                );

            case 6:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>
                            When would you like to reach your goal?
                        </Text>
                        <Text style={styles.stepSubtitle}>
                            Realistic timelines lead to lasting results
                        </Text>
                        {[
                            { emoji: "🏃", text: "3 months (aggressive)" },
                            { emoji: "🚶", text: "6 months (moderate)" },
                            { emoji: "🧘", text: "1 year (sustainable)" },
                            {
                                emoji: "💭",
                                text: "I just want to feel better",
                            },
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.text}
                                style={[
                                    styles.optionButton,
                                    timeline === option.text &&
                                        styles.optionButtonSelected,
                                ]}
                                onPress={() => setTimeline(option.text)}
                            >
                                <Text style={styles.optionEmoji}>
                                    {option.emoji}
                                </Text>
                                <Text
                                    style={[
                                        styles.optionText,
                                        timeline === option.text &&
                                            styles.optionTextSelected,
                                    ]}
                                >
                                    {option.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 7:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>
                            How active are you currently?
                        </Text>
                        <Text style={styles.stepSubtitle}>
                            We'll adjust recommendations to match your lifestyle
                        </Text>
                        {[
                            { emoji: "💺", text: "Mostly sitting/desk job" },
                            { emoji: "🚶‍♀️", text: "Light activity/walking" },
                            {
                                emoji: "🏋️",
                                text: "Moderate exercise 3x/week",
                            },
                            { emoji: "⚡", text: "Very active/athlete" },
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.text}
                                style={[
                                    styles.optionButton,
                                    activityLevel === option.text &&
                                        styles.optionButtonSelected,
                                ]}
                                onPress={() => setActivityLevel(option.text)}
                            >
                                <Text style={styles.optionEmoji}>
                                    {option.emoji}
                                </Text>
                                <Text
                                    style={[
                                        styles.optionText,
                                        activityLevel === option.text &&
                                            styles.optionTextSelected,
                                    ]}
                                >
                                    {option.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 8:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>
                            Which foods make you feel out of control?
                        </Text>
                        <Text style={styles.stepSubtitle}>
                            Select all that apply - we'll help you find
                            healthier alternatives
                        </Text>
                        {[
                            { emoji: "🍰", text: "Sweets/desserts" },
                            { emoji: "🍞", text: "Bread/pasta" },
                            { emoji: "🍿", text: "Salty snacks" },
                            { emoji: "🍔", text: "Fast food" },
                            { emoji: "🥤", text: "Sugary drinks" },
                            { emoji: "✅", text: "None really" },
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.text}
                                style={[
                                    styles.optionButton,
                                    problemFoods.includes(option.text) &&
                                        styles.optionButtonSelected,
                                ]}
                                onPress={() => toggleProblemFood(option.text)}
                            >
                                <Text style={styles.optionEmoji}>
                                    {option.emoji}
                                </Text>
                                <Text
                                    style={[
                                        styles.optionText,
                                        problemFoods.includes(option.text) &&
                                            styles.optionTextSelected,
                                    ]}
                                >
                                    {option.text}
                                </Text>
                                {problemFoods.includes(option.text) && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${(currentStep / totalSteps) * 100}%`,
                                },
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {currentStep} of {totalSteps}
                    </Text>
                </View>

                {/* Current Step */}
                {renderStep()}

                {/* Navigation Buttons */}
                <View style={styles.buttonContainer}>
                    {currentStep > 1 && (
                        <TouchableOpacity
                            style={styles.backButtonNav}
                            onPress={handleBack}
                        >
                            <Text style={styles.backButtonNavText}>
                                ← Back
                            </Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[
                            styles.nextButton,
                            currentStep === 1 && styles.nextButtonFull,
                        ]}
                        onPress={handleNext}
                    >
                        <Text style={styles.nextButtonText}>
                            {currentStep === totalSteps
                                ? "Complete ✓"
                                : "Next →"}
                        </Text>
                    </TouchableOpacity>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 60,
    },
    progressContainer: {
        marginBottom: 32,
    },
    progressBar: {
        height: 8,
        backgroundColor: "#1F2937",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 8,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#8B5CF6",
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
    },
    stepContainer: {
        marginBottom: 32,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: 16,
        color: "#9CA3AF",
        marginBottom: 24,
    },
    optionButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1F2937",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: "#1F2937",
    },
    optionButtonSelected: {
        borderColor: "#8B5CF6",
        backgroundColor: "#2D1B4E",
    },
    optionEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    optionText: {
        fontSize: 16,
        color: "#E5E7EB",
        flex: 1,
    },
    optionTextSelected: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    checkmark: {
        fontSize: 20,
        color: "#8B5CF6",
        fontWeight: "bold",
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#E5E7EB",
        marginBottom: 8,
    },
    numberInput: {
        backgroundColor: "#1F2937",
        borderRadius: 12,
        padding: 16,
        fontSize: 18,
        color: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#374151",
    },
    goalSummary: {
        backgroundColor: "#2D1B4E",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#8B5CF6",
    },
    goalSummaryText: {
        fontSize: 16,
        color: "#FFFFFF",
        textAlign: "center",
        fontWeight: "600",
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 24,
    },
    backButtonNav: {
        flex: 1,
        backgroundColor: "#1F2937",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
    },
    backButtonNavText: {
        fontSize: 16,
        color: "#E5E7EB",
        fontWeight: "600",
    },
    nextButton: {
        flex: 2,
        backgroundColor: "#8B5CF6",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    },
    nextButtonFull: {
        flex: 1,
    },
    nextButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
});
