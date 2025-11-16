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
    View
} from "react-native";

type MealComponent = {
    protein?: string;
    carb?: string;
    veggie?: string;
    other?: string;
    portion: string;
};

type FoodEntry = {
    id: string;
    components: MealComponent;
    mealType: string;
    date: string;
    time: string;
};

const PROTEINS = [
    { name: "Chicken Breast", emoji: "🍗" },
    { name: "Salmon", emoji: "🐟" },
    { name: "Beef", emoji: "🥩" },
    { name: "Eggs", emoji: "🥚" },
    { name: "Tofu", emoji: "🥙" },
    { name: "Turkey", emoji: "🦃" },
    { name: "Tuna", emoji: "🐠" },
    { name: "Shrimp", emoji: "🍤" },
    { name: "Pork", emoji: "🥓" },
    { name: "Greek Yogurt", emoji: "🥛" },
    { name: "Cottage Cheese", emoji: "🧀" },
    { name: "Protein Shake", emoji: "🥤" },
];

const CARBS = [
    { name: "White Rice", emoji: "🍚" },
    { name: "Brown Rice", emoji: "🌾" },
    { name: "Pasta", emoji: "🍝" },
    { name: "Whole Wheat Bread", emoji: "🍞" },
    { name: "Sweet Potato", emoji: "🍠" },
    { name: "Regular Potato", emoji: "🥔" },
    { name: "Quinoa", emoji: "🌰" },
    { name: "Oatmeal", emoji: "🥣" },
    { name: "Tortilla", emoji: "🌮" },
    { name: "Couscous", emoji: "🍚" },
];

const VEGGIES = [
    { name: "Broccoli", emoji: "🥦" },
    { name: "Mixed Salad", emoji: "🥗" },
    { name: "Carrots", emoji: "🥕" },
    { name: "Bell Peppers", emoji: "🫑" },
    { name: "Spinach", emoji: "🥬" },
    { name: "Green Beans", emoji: "🫘" },
    { name: "Asparagus", emoji: "🌿" },
    { name: "Cauliflower", emoji: "🥦" },
    { name: "Zucchini", emoji: "🥒" },
    { name: "Tomatoes", emoji: "🍅" },
    { name: "Cucumber", emoji: "🥒" },
    { name: "Kale", emoji: "🥬" },
];

const OTHER_FOODS = [
    { name: "Pizza", emoji: "🍕", type: "processed" },
    { name: "Burger", emoji: "🍔", type: "processed" },
    { name: "Sandwich", emoji: "🥪", type: "mixed" },
    { name: "Burrito", emoji: "🌯", type: "mixed" },
    { name: "Soup", emoji: "🍲", type: "mixed" },
    { name: "Stir Fry", emoji: "🍜", type: "mixed" },
    { name: "Sushi", emoji: "🍣", type: "mixed" },
    { name: "Tacos", emoji: "🌮", type: "mixed" },
    { name: "Fruit", emoji: "🍎", type: "healthy" },
    { name: "Nuts", emoji: "🥜", type: "healthy" },
    { name: "Beans", emoji: "🫘", type: "healthy" },
    { name: "Avocado", emoji: "🥑", type: "healthy" },
];

const PORTIONS = ["Small", "Medium", "Large", "Extra Large"];

export default function LogTab() {
    const router = useRouter();
    const [selectedProtein, setSelectedProtein] = useState<string | null>(null);
    const [selectedCarb, setSelectedCarb] = useState<string | null>(null);
    const [selectedVeggie, setSelectedVeggie] = useState<string | null>(null);
    const [selectedOther, setSelectedOther] = useState<string | null>(null);
    const [selectedPortion, setSelectedPortion] = useState("Medium");
    const [mealType, setMealType] = useState("Lunch");
    const [foodLog, setFoodLog] = useState<FoodEntry[]>([]);
    const [surveyData, setSurveyData] = useState<any>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [customFood, setCustomFood] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [eatingPatterns, setEatingPatterns] = useState<any>(null);
    const [personalizedSuggestions, setPersonalizedSuggestions] = useState<any[]>([]);
    const [aiAnalysis, setAiAnalysis] = useState<string>("");

    useEffect(() => {
        loadData();
        analyzeEatingPatterns();
    }, []);
    
    const loadData = async () => {
        await loadSurveyData();
        await loadFoodLog();
        autoSelectMealType();
    };
    
    const analyzeEatingPatterns = async () => {
        try {
            const patterns = await analyzeUserEatingHistory();
            setEatingPatterns(patterns);
            
            const suggestions = await generatePersonalizedSuggestions(patterns);
            setPersonalizedSuggestions(suggestions);
        } catch (error) {
            console.error('Error analyzing eating patterns:', error);
        }
    };
    
    const analyzeUserEatingHistory = async () => {
        const recentLogs = foodLog.slice(0, 14); // Last 14 meals
        
        const proteinFrequency: {[key: string]: number} = {};
        const carbFrequency: {[key: string]: number} = {};
        const veggieFrequency: {[key: string]: number} = {};
        const mealTimePatterns: {[key: string]: number} = {};
        
        recentLogs.forEach(log => {
            if (log.components.protein) proteinFrequency[log.components.protein] = (proteinFrequency[log.components.protein] || 0) + 1;
            if (log.components.carb) carbFrequency[log.components.carb] = (carbFrequency[log.components.carb] || 0) + 1;
            if (log.components.veggie) veggieFrequency[log.components.veggie] = (veggieFrequency[log.components.veggie] || 0) + 1;
            mealTimePatterns[log.mealType] = (mealTimePatterns[log.mealType] || 0) + 1;
        });
        
        // Find foods they haven't eaten recently
        const unusedProteins = PROTEINS.filter(p => !proteinFrequency[p.name]);
        const unusedCarbs = CARBS.filter(c => !carbFrequency[c.name]);
        const unusedVeggies = VEGGIES.filter(v => !veggieFrequency[v.name]);
        
        return {
            proteinFrequency,
            carbFrequency,
            veggieFrequency,
            mealTimePatterns,
            unusedProteins,
            unusedCarbs,
            unusedVeggies,
            totalMeals: recentLogs.length
        };
    };
    
    const generatePersonalizedSuggestions = async (patterns: any) => {
        const suggestions = [];
        
        // Challenge-specific suggestions
        if (surveyData?.biggestChallenge === "Late-night snacking") {
            suggestions.push({
                type: "challenge",
                title: "Evening Satisfaction",
                message: "Add more protein to dinner to reduce late cravings",
                foods: patterns.unusedProteins.slice(0, 3),
                icon: "🌙"
            });
        }
        
        if (surveyData?.biggestChallenge === "Not feeling full") {
            suggestions.push({
                type: "challenge",
                title: "Satiety Boosters",
                message: "These high-fiber options help you feel fuller longer",
                foods: patterns.unusedVeggies.slice(0, 3),
                icon: "🥗"
            });
        }
        
        // Variety suggestions
        if (patterns.unusedProteins.length > 0) {
            suggestions.push({
                type: "variety",
                title: "Try Something New",
                message: "You haven't had these proteins recently",
                foods: patterns.unusedProteins.slice(0, 3),
                icon: "✨"
            });
        }
        
        // Problem food alternatives
        if (surveyData?.problemFoods) {
            const alternatives = getHealthyAlternatives(surveyData.problemFoods);
            if (alternatives.length > 0) {
                suggestions.push({
                    type: "alternative",
                    title: "Smart Swaps",
                    message: "Healthier alternatives to your trigger foods",
                    foods: alternatives,
                    icon: "🔄"
                });
            }
        }
        
        return suggestions;
    };
    
    const getHealthyAlternatives = (problemFoods: string[]) => {
        const alternatives: {name: string, emoji: string}[] = [];
        
        problemFoods.forEach(food => {
            if (food.toLowerCase().includes('pizza')) {
                alternatives.push({name: "Cauliflower Pizza", emoji: "🥦"});
            }
            if (food.toLowerCase().includes('ice cream')) {
                alternatives.push({name: "Greek Yogurt", emoji: "🥛"});
            }
            if (food.toLowerCase().includes('chips')) {
                alternatives.push({name: "Roasted Chickpeas", emoji: "🫘"});
            }
            if (food.toLowerCase().includes('soda')) {
                alternatives.push({name: "Sparkling Water", emoji: "💧"});
            }
        });
        
        return alternatives;
    };

    const autoSelectMealType = () => {
        const hour = new Date().getHours();
        if (hour < 11) setMealType("Breakfast");
        else if (hour < 16) setMealType("Lunch");
        else setMealType("Dinner");
    };

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

    const analyzeNutritionGaps = async () => {
        const today = new Date().toLocaleDateString();
        const todayMeals = foodLog.filter((entry) => entry.date === today);

        if (todayMeals.length === 0) {
            return "Start logging meals to get personalized insights!";
        }

        // Count food types
        const proteins = todayMeals.filter((m) => m.components.protein).length;
        const veggies = todayMeals.filter((m) => m.components.veggie).length;
        const carbs = todayMeals.filter((m) => m.components.carb).length;

        let analysis = "";
        const gaps = [];

        if (proteins < 3) {
            gaps.push("🍗 Protein");
            analysis += "Low protein can increase hunger and cravings. ";
        }
        if (veggies < 3) {
            gaps.push("🥦 Fiber (veggies)");
            analysis += "Not enough fiber means you'll feel hungry sooner. ";
        }
        if (carbs > 4) {
            gaps.push("⚠️ Too many carbs");
            analysis += "High carb intake without protein/fiber leads to blood sugar spikes. ";
        }

        if (gaps.length === 0) {
            return "✅ Great balance today! You're eating enough protein, veggies, and controlling portions.";
        }

        return `⚠️ Missing: ${gaps.join(", ")}\n\n${analysis}\n\n💡 Next meal: Focus on ${proteins < 3 ? "protein + " : ""}${veggies < 3 ? "vegetables" : "balanced portions"}`;
    };

    const getNextMealSuggestion = () => {
        const today = new Date().toLocaleDateString();
        const todayMeals = foodLog.filter((entry) => entry.date === today);

        if (todayMeals.length === 0) {
            return {
                message: "Start your day strong!",
                protein: "Eggs",
                carb: "Oatmeal",
                veggie: "Spinach",
            };
        }

        // Count what they've eaten today
        const proteins = todayMeals.filter((m) => m.components.protein).length;
        const veggies = todayMeals.filter((m) => m.components.veggie).length;
        const carbs = todayMeals.filter((m) => m.components.carb).length;

        if (proteins < 2) {
            return {
                message: "Add more protein for satiety",
                protein: "Chicken Breast",
                carb: "Brown Rice",
                veggie: "Broccoli",
            };
        } else if (veggies < 2) {
            return {
                message: "You need more veggies today!",
                protein: "Salmon",
                carb: "Quinoa",
                veggie: "Mixed Salad",
            };
        } else if (carbs > 3) {
            return {
                message: "Skip the carbs, focus on protein + veggies",
                protein: "Turkey",
                carb: "",
                veggie: "Green Beans",
            };
        } else {
            return {
                message: "Great balance! Keep it up",
                protein: "Turkey",
                carb: "Sweet Potato",
                veggie: "Asparagus",
            };
        }
    };

    const saveMeal = async () => {
        if (!selectedProtein && !selectedCarb && !selectedVeggie && !selectedOther) {
            Alert.alert("Add Something", "Select at least one food item");
            return;
        }

        const now = new Date();
        const newEntry: FoodEntry = {
            id: Date.now().toString(),
            components: {
                protein: selectedProtein || undefined,
                carb: selectedCarb || undefined,
                veggie: selectedVeggie || undefined,
                other: selectedOther || undefined,
                portion: selectedPortion,
            },
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

        // Analyze nutrition
        const analysis = await analyzeNutritionGaps();
        setAiAnalysis(analysis);

        Alert.alert(
            "Meal Logged! 🎉",
            analysis,
            [{ text: "Got it!", onPress: () => router.back() }]
        );

        // Reset selections
        setSelectedProtein(null);
        setSelectedCarb(null);
        setSelectedVeggie(null);
        setSelectedOther(null);
    };

    const deleteEntry = async (id: string) => {
        const updatedLog = foodLog.filter((entry) => entry.id !== id);
        setFoodLog(updatedLog);
        await AsyncStorage.setItem("foodLog", JSON.stringify(updatedLog));
    };

    const suggestion = getNextMealSuggestion();

    if (showHistory) {
        const today = new Date().toLocaleDateString();
        const todayMeals = foodLog.filter((entry) => entry.date === today);

        return (
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => setShowHistory(false)}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeText}>←</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.title}>Food History 📋</Text>
                    <Text style={styles.subtitle}>
                        {todayMeals.length} meals logged today
                    </Text>

                    {foodLog.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>
                                No meals logged yet!
                            </Text>
                            <Text style={styles.emptySubtext}>
                                Start tracking to see insights
                            </Text>
                        </View>
                    ) : (
                        foodLog.map((entry) => {
                            const isToday = entry.date === today;
                            const foods = [
                                entry.components.protein,
                                entry.components.carb,
                                entry.components.veggie,
                                entry.components.other,
                            ]
                                .filter(Boolean)
                                .join(", ");

                            return (
                                <View
                                    key={entry.id}
                                    style={[
                                        styles.historyCard,
                                        !isToday && styles.historyCardOld,
                                    ]}
                                >
                                    <View style={styles.historyHeader}>
                                        <View style={styles.historyInfo}>
                                            <View style={styles.historyTopRow}>
                                                <Text style={styles.historyMealType}>
                                                    {entry.mealType}
                                                </Text>
                                                <View
                                                    style={[
                                                        styles.historyBadge,
                                                        {
                                                            backgroundColor:
                                                                entry.mealType ===
                                                                "Breakfast"
                                                                    ? "#FF9500"
                                                                    : entry.mealType ===
                                                                      "Lunch"
                                                                    ? "#34C759"
                                                                    : entry.mealType ===
                                                                      "Dinner"
                                                                    ? "#5856D6"
                                                                    : "#AF52DE",
                                                        },
                                                    ]}
                                                >
                                                    <Text style={styles.historyBadgeText}>
                                                        {entry.components.portion}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.historyFoods}>
                                                {foods}
                                            </Text>
                                            <Text style={styles.historyTime}>
                                                {entry.date} at {entry.time}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => deleteEntry(entry.id)}
                                            style={styles.deleteButton}
                                        >
                                            <Text style={styles.deleteText}>🗑️</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => setShowHistory(true)}
                        style={styles.historyButton}
                    >
                        <Text style={styles.historyButtonText}>📋 History</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.closeButton}
                    >
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.title}>What did you eat?</Text>
                <Text style={styles.subtitle}>Build your meal - keep it simple!</Text>

                {/* Smart Personalized Suggestions */}
                {personalizedSuggestions.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
                        {personalizedSuggestions.map((suggestion, index) => (
                            <View key={index} style={styles.smartSuggestionCard}>
                                <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                                <Text style={styles.smartSuggestionTitle}>{suggestion.title}</Text>
                                <Text style={styles.smartSuggestionMessage}>{suggestion.message}</Text>
                                <View style={styles.suggestionFoods}>
                                    {suggestion.foods.map((food: any, foodIndex: number) => (
                                        <TouchableOpacity
                                            key={foodIndex}
                                            style={styles.suggestionFoodButton}
                                            onPress={() => {
                                                if (suggestion.type === 'challenge' && food.name) {
                                                    if (PROTEINS.find(p => p.name === food.name)) {
                                                        setSelectedProtein(food.name);
                                                    } else if (CARBS.find(c => c.name === food.name)) {
                                                        setSelectedCarb(food.name);
                                                    } else if (VEGGIES.find(v => v.name === food.name)) {
                                                        setSelectedVeggie(food.name);
                                                    }
                                                }
                                            }}
                                        >
                                            <Text style={styles.suggestionFoodEmoji}>{food.emoji}</Text>
                                            <Text style={styles.suggestionFoodName}>{food.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}
                
                {/* Challenge-Specific Alert */}
                {surveyData?.biggestChallenge && eatingPatterns && (
                    <View style={styles.challengeAlert}>
                        <Text style={styles.challengeAlertTitle}>
                            🎯 Focus: {surveyData.biggestChallenge}
                        </Text>
                        <Text style={styles.challengeAlertText}>
                            {surveyData.biggestChallenge === "Late-night snacking" && 
                                `Protein count this week: ${Object.values(eatingPatterns.proteinFrequency || {}).reduce((a: any, b: any) => a + b, 0)} meals. More protein = less evening cravings!`}
                            {surveyData.biggestChallenge === "Not feeling full" && 
                                `Veggie count this week: ${Object.values(eatingPatterns.veggieFrequency || {}).reduce((a: any, b: any) => a + b, 0)} meals. Fiber helps you feel satisfied!`}
                            {surveyData.biggestChallenge === "Eating when stressed/bored" && 
                                "Notice: Are you eating because you're hungry or because of emotions?"}
                        </Text>
                    </View>
                )}

                {/* Meal Type */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Meal Type</Text>
                    <View style={styles.mealTypeGrid}>
                        {["Breakfast", "Lunch", "Dinner", "Snack"].map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.mealButton,
                                    mealType === type && styles.mealButtonActive,
                                ]}
                                onPress={() => setMealType(type)}
                            >
                                <Text
                                    style={[
                                        styles.mealButtonText,
                                        mealType === type &&
                                            styles.mealButtonTextActive,
                                    ]}
                                >
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Protein Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🍗 Protein (optional)</Text>
                    <View style={styles.foodGrid}>
                        {PROTEINS.map((item) => (
                            <TouchableOpacity
                                key={item.name}
                                style={[
                                    styles.foodButton,
                                    selectedProtein === item.name &&
                                        styles.foodButtonSelected,
                                ]}
                                onPress={() =>
                                    setSelectedProtein(
                                        selectedProtein === item.name
                                            ? null
                                            : item.name
                                    )
                                }
                            >
                                <Text style={styles.foodEmoji}>{item.emoji}</Text>
                                <Text style={styles.foodName}>{item.name}</Text>
                                {selectedProtein === item.name && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Carb Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🍚 Carbs (optional)</Text>
                    <View style={styles.foodGrid}>
                        {CARBS.map((item) => (
                            <TouchableOpacity
                                key={item.name}
                                style={[
                                    styles.foodButton,
                                    selectedCarb === item.name &&
                                        styles.foodButtonSelected,
                                ]}
                                onPress={() =>
                                    setSelectedCarb(
                                        selectedCarb === item.name ? null : item.name
                                    )
                                }
                            >
                                <Text style={styles.foodEmoji}>{item.emoji}</Text>
                                <Text style={styles.foodName}>{item.name}</Text>
                                {selectedCarb === item.name && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Veggie Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🥦 Vegetables (optional)</Text>
                    <View style={styles.foodGrid}>
                        {VEGGIES.map((item) => (
                            <TouchableOpacity
                                key={item.name}
                                style={[
                                    styles.foodButton,
                                    selectedVeggie === item.name &&
                                        styles.foodButtonSelected,
                                ]}
                                onPress={() =>
                                    setSelectedVeggie(
                                        selectedVeggie === item.name
                                            ? null
                                            : item.name
                                    )
                                }
                            >
                                <Text style={styles.foodEmoji}>{item.emoji}</Text>
                                <Text style={styles.foodName}>{item.name}</Text>
                                {selectedVeggie === item.name && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Other Foods */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🍕 Other Foods (optional)</Text>
                    <View style={styles.foodGrid}>
                        {OTHER_FOODS.map((item) => (
                            <TouchableOpacity
                                key={item.name}
                                style={[
                                    styles.foodButton,
                                    selectedOther === item.name &&
                                        styles.foodButtonSelected,
                                ]}
                                onPress={() =>
                                    setSelectedOther(
                                        selectedOther === item.name
                                            ? null
                                            : item.name
                                    )
                                }
                            >
                                <Text style={styles.foodEmoji}>{item.emoji}</Text>
                                <Text style={styles.foodName}>{item.name}</Text>
                                {selectedOther === item.name && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                        
                        {/* Add Custom Food Button */}
                        <TouchableOpacity
                            style={[styles.foodButton, styles.customFoodButton]}
                            onPress={() => setShowCustomInput(!showCustomInput)}
                        >
                            <Text style={styles.foodEmoji}>➕</Text>
                            <Text style={styles.foodName}>Add Custom</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Custom Food Input */}
                    {showCustomInput && (
                        <View style={styles.customInputContainer}>
                            <Text style={styles.customInputLabel}>What else did you eat?</Text>
                            <TextInput
                                style={styles.customInput}
                                placeholder="e.g., Homemade stir-fry, Thai curry, etc."
                                placeholderTextColor="#9CA3AF"
                                value={customFood}
                                onChangeText={setCustomFood}
                                onSubmitEditing={() => {
                                    if (customFood.trim()) {
                                        setSelectedOther(customFood);
                                        setShowCustomInput(false);
                                    }
                                }}
                            />
                            <TouchableOpacity
                                style={styles.addCustomButton}
                                onPress={() => {
                                    if (customFood.trim()) {
                                        setSelectedOther(customFood);
                                        setShowCustomInput(false);
                                        setCustomFood("");
                                    }
                                }}
                            >
                                <Text style={styles.addCustomButtonText}>Add Food</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Portion Size */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Portion Size</Text>
                    <View style={styles.portionRow}>
                        {PORTIONS.map((portion) => (
                            <TouchableOpacity
                                key={portion}
                                style={[
                                    styles.portionButton,
                                    selectedPortion === portion &&
                                        styles.portionButtonActive,
                                ]}
                                onPress={() => setSelectedPortion(portion)}
                            >
                                <Text
                                    style={[
                                        styles.portionText,
                                        selectedPortion === portion &&
                                            styles.portionTextActive,
                                    ]}
                                >
                                    {portion}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Log Button */}
                <TouchableOpacity style={styles.logButton} onPress={saveMeal}>
                    <Text style={styles.logButtonText}>Log This Meal 🎉</Text>
                </TouchableOpacity>
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
        justifyContent: "flex-end",
        paddingVertical: 10,
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
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#9CA3AF",
        marginBottom: 24,
    },
    suggestionCard: {
        backgroundColor: "#1E3A5F",
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#3B82F6",
    },
    suggestionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#93C5FD",
        marginBottom: 8,
    },
    suggestionText: {
        fontSize: 16,
        color: "#E0E7FF",
        fontWeight: "600",
        marginBottom: 12,
    },
    suggestionRow: {
        flexDirection: "row",
        gap: 12,
        flexWrap: "wrap",
    },
    suggestionItem: {
        backgroundColor: "#2D1B4E",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        fontSize: 13,
        color: "#FFFFFF",
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 12,
    },
    mealTypeGrid: {
        flexDirection: "row",
        gap: 8,
    },
    mealButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: "#1F2937",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    mealButtonActive: {
        backgroundColor: "#8B5CF6",
        borderColor: "#A78BFA",
    },
    mealButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#9CA3AF",
    },
    mealButtonTextActive: {
        color: "#FFFFFF",
    },
    foodGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    foodButton: {
        width: "31%",
        aspectRatio: 1,
        backgroundColor: "#1F2937",
        borderRadius: 12,
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent",
        position: "relative",
    },
    foodButtonSelected: {
        backgroundColor: "#2D1B4E",
        borderColor: "#8B5CF6",
    },
    foodEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    foodName: {
        fontSize: 12,
        color: "#E5E7EB",
        textAlign: "center",
        fontWeight: "600",
    },
    checkmark: {
        position: "absolute",
        top: 8,
        right: 8,
        fontSize: 16,
        color: "#10B981",
        fontWeight: "bold",
    },
    portionRow: {
        flexDirection: "row",
        gap: 8,
    },
    portionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: "#1F2937",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    portionButtonActive: {
        backgroundColor: "#2D1B4E",
        borderColor: "#8B5CF6",
    },
    portionText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#9CA3AF",
    },
    portionTextActive: {
        color: "#FFFFFF",
    },
    logButton: {
        backgroundColor: "#8B5CF6",
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: "center",
        marginTop: 8,
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    },
    logButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    historyButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#1F2937",
        borderRadius: 12,
    },
    historyButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#9CA3AF",
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#6B7280",
    },
    historyCard: {
        backgroundColor: "#1F2937",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: "#8B5CF6",
    },
    historyCardOld: {
        borderColor: "#374151",
        opacity: 0.7,
    },
    historyHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    historyInfo: {
        flex: 1,
    },
    historyTopRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    historyMealType: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    historyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    historyBadgeText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "600",
    },
    historyFoods: {
        fontSize: 14,
        color: "#E5E7EB",
        marginBottom: 8,
    },
    historyTime: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    deleteButton: {
        padding: 4,
    },
    deleteText: {
        fontSize: 20,
    },
    
    // Smart Suggestions Styles
    suggestionsScroll: {
        marginBottom: 20,
    },
    smartSuggestionCard: {
        backgroundColor: "#1E3A8A",
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        width: 280,
        minHeight: 140,
    },
    suggestionIcon: {
        fontSize: 20,
        marginBottom: 8,
    },
    smartSuggestionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    smartSuggestionMessage: {
        fontSize: 13,
        color: "#BFDBFE",
        marginBottom: 12,
        lineHeight: 18,
    },
    suggestionFoods: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    suggestionFoodButton: {
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: 6,
        marginRight: 6,
        marginBottom: 6,
        alignItems: "center",
        minWidth: 60,
    },
    suggestionFoodEmoji: {
        fontSize: 16,
        marginBottom: 2,
    },
    suggestionFoodName: {
        fontSize: 10,
        color: "#FFFFFF",
        textAlign: "center",
        fontWeight: "500",
    },
    
    // Challenge Alert Styles
    challengeAlert: {
        backgroundColor: "#065F46",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#10B981",
    },
    challengeAlertTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    challengeAlertText: {
        fontSize: 14,
        color: "#A7F3D0",
        lineHeight: 20,
    },
    
    // Custom Food Input Styles
    customFoodButton: {
        backgroundColor: "#8B5CF6",
        borderWidth: 2,
        borderColor: "#A855F7",
        borderStyle: "dashed",
    },
    customInputContainer: {
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
    },
    customInputLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 12,
    },
    customInput: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: "#1F2937",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        marginBottom: 12,
    },
    addCustomButton: {
        backgroundColor: "#8B5CF6",
        borderRadius: 8,
        padding: 12,
        alignItems: "center",
    },
    addCustomButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});
