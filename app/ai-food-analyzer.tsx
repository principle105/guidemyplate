import AIFoodAnalyzer from "@/services/AIFoodAnalyzer";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function AIFoodAnalyzerScreen() {
    const router = useRouter();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (!permissionResult.granted) {
            Alert.alert("Permission needed", "Please allow access to your photos");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
            analyzeImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        
        if (!permissionResult.granted) {
            Alert.alert("Permission needed", "Please allow access to your camera");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
            analyzeImage(result.assets[0].uri);
        }
    };

    const analyzeImage = async (uri: string) => {
        setAnalyzing(true);
        setAnalysis(null);

        // Simulate AI processing time
        setTimeout(async () => {
            const result = await AIFoodAnalyzer.analyzeFood(uri);
            setAnalysis(result);
            setAnalyzing(false);
        }, 2000);
    };

    const resetAnalysis = () => {
        setImageUri(null);
        setAnalysis(null);
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

                <Text style={styles.title}>AI Food Analyzer</Text>
                <Text style={styles.subtitle}>
                    Snap a photo and get instant health insights
                </Text>

                {!imageUri ? (
                    <View style={styles.uploadSection}>
                        <View style={styles.uploadPlaceholder}>
                            <Text style={styles.uploadIcon}>📸</Text>
                            <Text style={styles.uploadText}>
                                Take a photo of your meal
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, styles.cameraButton]}
                            onPress={takePhoto}
                        >
                            <Text style={styles.buttonText}>📷 Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.galleryButton]}
                            onPress={pickImage}
                        >
                            <Text style={styles.buttonText}>🖼️ Choose from Gallery</Text>
                        </TouchableOpacity>

                        <View style={styles.infoCard}>
                            <Text style={styles.infoTitle}>✨ What AI Can Do:</Text>
                            <Text style={styles.infoItem}>• Detect foods in your photo</Text>
                            <Text style={styles.infoItem}>• Give health score (0-100)</Text>
                            <Text style={styles.infoItem}>• Show how to improve it</Text>
                            <Text style={styles.infoItem}>• Suggest healthy swaps</Text>
                        </View>
                    </View>
                ) : (
                    <>
                        {/* Image Preview */}
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: imageUri }} style={styles.image} />
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={resetAnalysis}
                            >
                                <Text style={styles.resetText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {analyzing ? (
                            <View style={styles.analyzingCard}>
                                <Text style={styles.analyzingText}>🔍 Analyzing your food...</Text>
                                <Text style={styles.analyzingSubtext}>
                                    AI is detecting foods and calculating health score
                                </Text>
                            </View>
                        ) : analysis ? (
                            <>
                                {/* Detected Foods */}
                                <View style={styles.detectionCard}>
                                    <Text style={styles.sectionTitle}>🍽️ Detected Foods</Text>
                                    <View style={styles.foodTags}>
                                        {analysis.detectedFoods.map((food: string, index: number) => (
                                            <View key={index} style={styles.foodTag}>
                                                <Text style={styles.foodTagText}>{food}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                {/* Health Score */}
                                <View style={styles.scoreCard}>
                                    <View style={styles.scoreHeader}>
                                        <Text style={styles.sectionTitle}>Health Score</Text>
                                        <Text style={[
                                            styles.scoreLabel,
                                            { color: AIFoodAnalyzer.getHealthScoreColor(analysis.healthScore) }
                                        ]}>
                                            {AIFoodAnalyzer.getHealthScoreLabel(analysis.healthScore)}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.scoreCircle}>
                                        <Text style={[
                                            styles.scoreNumber,
                                            { color: AIFoodAnalyzer.getHealthScoreColor(analysis.healthScore) }
                                        ]}>
                                            {analysis.healthScore}
                                        </Text>
                                        <Text style={styles.scoreMax}>/100</Text>
                                    </View>

                                    <View style={styles.calorieInfo}>
                                        <Text style={styles.calorieText}>
                                            ⚡ ~{analysis.calories} calories
                                        </Text>
                                    </View>
                                </View>

                                {/* Nutrition Breakdown */}
                                <View style={styles.nutritionCard}>
                                    <Text style={styles.sectionTitle}>📊 Nutrition Breakdown</Text>
                                    <View style={styles.nutritionGrid}>
                                        {Object.entries(analysis.nutritionBreakdown).map(([key, value]: [string, any]) => (
                                            <View key={key} style={styles.nutritionItem}>
                                                <Text style={styles.nutritionLabel}>
                                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                                </Text>
                                                <Text style={[
                                                    styles.nutritionValue,
                                                    { color: AIFoodAnalyzer.getNutritionColor(value) }
                                                ]}>
                                                    {value}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                {/* Improvements */}
                                <View style={styles.improvementsCard}>
                                    <Text style={styles.sectionTitle}>💡 How to Fix This Meal</Text>
                                    <Text style={styles.improvementsSubtitle}>
                                        Make these swaps to reach {analysis.improvedScore}/100
                                    </Text>
                                    
                                    {analysis.improvements.map((improvement: any, index: number) => (
                                        <View key={index} style={styles.improvementItem}>
                                            <Text style={styles.improvementIcon}>{improvement.icon}</Text>
                                            <View style={styles.improvementContent}>
                                                <Text style={styles.improvementText}>
                                                    {improvement.text}
                                                </Text>
                                                <Text style={styles.improvementImpact}>
                                                    {improvement.impact}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Action Buttons */}
                                <TouchableOpacity
                                    style={styles.newPhotoButton}
                                    onPress={resetAnalysis}
                                >
                                    <Text style={styles.newPhotoButtonText}>
                                        📸 Analyze Another Meal
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : null}
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
    uploadSection: {
        gap: 16,
    },
    uploadPlaceholder: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 48,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#374151",
        borderStyle: "dashed",
    },
    uploadIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    uploadText: {
        fontSize: 18,
        color: "#9CA3AF",
        textAlign: "center",
    },
    button: {
        borderRadius: 16,
        padding: 18,
        alignItems: "center",
    },
    cameraButton: {
        backgroundColor: "#8B5CF6",
    },
    galleryButton: {
        backgroundColor: "#374151",
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    infoCard: {
        backgroundColor: "#1E3A8A",
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 12,
    },
    infoItem: {
        fontSize: 14,
        color: "#BFDBFE",
        marginBottom: 8,
        lineHeight: 20,
    },
    imageContainer: {
        position: "relative",
        marginBottom: 24,
    },
    image: {
        width: "100%",
        height: 300,
        borderRadius: 16,
    },
    resetButton: {
        position: "absolute",
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    resetText: {
        fontSize: 20,
        color: "#FFFFFF",
    },
    analyzingCard: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 32,
        alignItems: "center",
    },
    analyzingText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    analyzingSubtext: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
    },
    detectionCard: {
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
    foodTags: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    foodTag: {
        backgroundColor: "#374151",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    foodTagText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    scoreCard: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        alignItems: "center",
    },
    scoreHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 20,
    },
    scoreLabel: {
        fontSize: 14,
        fontWeight: "600",
    },
    scoreCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "#374151",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    scoreNumber: {
        fontSize: 48,
        fontWeight: "bold",
    },
    scoreMax: {
        fontSize: 18,
        color: "#9CA3AF",
    },
    calorieInfo: {
        backgroundColor: "#374151",
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    calorieText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    nutritionCard: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    nutritionGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    nutritionItem: {
        flex: 1,
        minWidth: "45%",
        backgroundColor: "#374151",
        borderRadius: 12,
        padding: 16,
    },
    nutritionLabel: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 4,
    },
    nutritionValue: {
        fontSize: 16,
        fontWeight: "700",
    },
    improvementsCard: {
        backgroundColor: "#065F46",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    improvementsSubtitle: {
        fontSize: 14,
        color: "#A7F3D0",
        marginBottom: 16,
    },
    improvementItem: {
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: "center",
    },
    improvementIcon: {
        fontSize: 28,
        marginRight: 12,
    },
    improvementContent: {
        flex: 1,
    },
    improvementText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    improvementImpact: {
        fontSize: 13,
        color: "#10B981",
        fontWeight: "600",
    },
    newPhotoButton: {
        backgroundColor: "#8B5CF6",
        borderRadius: 16,
        padding: 18,
        alignItems: "center",
    },
    newPhotoButtonText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
