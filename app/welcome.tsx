import { Image } from "expo-image";
import { Link } from "expo-router";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function WelcomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Logo at top */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require("@/assets/images/icon.png")}
                        style={styles.logo}
                        contentFit="contain"
                    />
                    <Text style={styles.appName}>GuideMyPlate</Text>
                    <Text style={styles.tagline}>
                        Your path to a healthier you
                    </Text>
                </View>

                {/* Feature highlights */}
                <View style={styles.featuresContainer}>
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>🎯</Text>
                        <Text style={styles.featureText}>
                            Understand what's making you gain weight
                        </Text>
                    </View>
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>💡</Text>
                        <Text style={styles.featureText}>
                            Get personalized insights & actionable steps
                        </Text>
                    </View>
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>📊</Text>
                        <Text style={styles.featureText}>
                            Track progress toward your goals
                        </Text>
                    </View>
                </View>

                {/* CTA Buttons */}
                <View style={styles.buttonContainer}>
                    <Link href="/signup" asChild>
                        <TouchableOpacity
                            style={styles.signUpButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.signUpButtonText}>
                                Sign Up For Free
                            </Text>
                        </TouchableOpacity>
                    </Link>

                    <Link href="/login" asChild>
                        <TouchableOpacity
                            style={styles.logInButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.logInButtonText}>Log In</Text>
                        </TouchableOpacity>
                    </Link>
                </View>

                {/* Version info */}
                <Text style={styles.version}>Version 1.0.0</Text>
            </View>
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
        padding: 24,
        justifyContent: "space-between",
    },
    logoContainer: {
        alignItems: "center",
        marginTop: 60,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 24,
    },
    appName: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: "#9CA3AF",
        textAlign: "center",
    },
    featuresContainer: {
        gap: 24,
        paddingHorizontal: 8,
    },
    feature: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    featureIcon: {
        fontSize: 32,
    },
    featureText: {
        flex: 1,
        fontSize: 16,
        color: "#E5E7EB",
        lineHeight: 24,
    },
    buttonContainer: {
        gap: 16,
        marginBottom: 20,
    },
    signUpButton: {
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
    signUpButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    logInButton: {
        backgroundColor: "transparent",
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#374151",
    },
    logInButtonText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#8B5CF6",
    },
    version: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        marginTop: 8,
    },
});
