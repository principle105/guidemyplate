import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import {
    Alert,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CameraTab() {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [cameraRef, setCameraRef] = useState<any>(null);

    if (!permission) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.message}>Loading camera...</Text>
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionIcon}>📷</Text>
                    <Text style={styles.permissionTitle}>Camera Access Needed</Text>
                    <Text style={styles.permissionMessage}>
                        Take photos of your meals to instantly log calories and
                        macros
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={requestPermission}
                    >
                        <Text style={styles.permissionButtonText}>
                            Grant Camera Access
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const takePicture = async () => {
        if (cameraRef) {
            const photo = await cameraRef.takePictureAsync();
            setPhoto(photo.uri);
            analyzePhoto(photo.uri);
        }
    };

    const analyzePhoto = async (uri: string) => {
        setAnalyzing(true);

        // Mock AI analysis (in real app, call GPT-4 Vision or Gemini API)
        setTimeout(async () => {
            const mockResult = {
                name: "Grilled Chicken Salad",
                calories: Math.floor(Math.random() * 400) + 200,
                protein: Math.floor(Math.random() * 30) + 20,
                carbs: Math.floor(Math.random() * 30) + 10,
                fat: Math.floor(Math.random() * 15) + 5,
                confidence: 85,
            };

            setAnalyzing(false);

            Alert.alert(
                "Meal Detected! 🎉",
                `${mockResult.name}\n\nCalories: ${mockResult.calories}\nProtein: ${mockResult.protein}g\nCarbs: ${mockResult.carbs}g\nFat: ${mockResult.fat}g\n\nConfidence: ${mockResult.confidence}%`,
                [
                    { text: "Retake", onPress: () => setPhoto(null) },
                    {
                        text: "Log Meal",
                        onPress: async () => {
                            // Save to food log
                            const foodLog = {
                                id: Date.now().toString(),
                                ...mockResult,
                                timestamp: new Date().toISOString(),
                                source: "camera",
                            };

                            const existing = await AsyncStorage.getItem(
                                "foodLogs"
                            );
                            const logs = existing ? JSON.parse(existing) : [];
                            logs.push(foodLog);
                            await AsyncStorage.setItem(
                                "foodLogs",
                                JSON.stringify(logs)
                            );

                            Alert.alert(
                                "Success!",
                                "Meal logged successfully"
                            );
                            setPhoto(null);
                        },
                    },
                ]
            );
        }, 2000);
    };

    if (photo) {
        return (
            <SafeAreaView style={styles.container}>
                <Image source={{ uri: photo }} style={styles.preview} />
                {analyzing && (
                    <View style={styles.analyzingOverlay}>
                        <ActivityIndicator size="large" color="#8B5CF6" />
                        <Text style={styles.analyzingText}>
                            Analyzing your meal with AI...
                        </Text>
                    </View>
                )}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                ref={(ref) => setCameraRef(ref)}
            >
                <View style={styles.cameraOverlay}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Snap Your Meal</Text>
                        <Text style={styles.headerSubtitle}>
                            AI will estimate calories & macros
                        </Text>
                    </View>

                    <View style={styles.captureArea}>
                        <View style={styles.frame} />
                    </View>

                    <View style={styles.controls}>
                        <TouchableOpacity
                            style={styles.captureButton}
                            onPress={takePicture}
                        >
                            <View style={styles.captureButtonInner} />
                        </TouchableOpacity>
                    </View>
                </View>
            </CameraView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0A0A",
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: "transparent",
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#E5E7EB",
    },
    captureArea: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    frame: {
        width: 280,
        height: 280,
        borderWidth: 3,
        borderColor: "#8B5CF6",
        borderRadius: 20,
    },
    controls: {
        paddingBottom: 40,
        alignItems: "center",
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255,255,255,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    captureButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#FFFFFF",
    },
    preview: {
        flex: 1,
        resizeMode: "cover",
    },
    analyzingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    analyzingText: {
        marginTop: 16,
        fontSize: 18,
        color: "#FFFFFF",
        fontWeight: "600",
    },
    permissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    permissionIcon: {
        fontSize: 64,
        marginBottom: 20,
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 12,
        textAlign: "center",
    },
    permissionMessage: {
        fontSize: 16,
        color: "#9CA3AF",
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 24,
    },
    permissionButton: {
        backgroundColor: "#8B5CF6",
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    permissionButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    message: {
        color: "#FFFFFF",
        fontSize: 18,
        textAlign: "center",
        marginTop: 100,
    },
});
