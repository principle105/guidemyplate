import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import YelpService from '../services/YelpService';

type Restaurant = {
    id: string;
    name: string;
    rating: number;
    distance: number;
    categories: string[];
    address: string;
    latitude: number;
    longitude: number;
    healthScore: number;
    strategy: string;
    avoid: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
};

// Pre-defined strategies for popular chains
const CHAIN_STRATEGIES: { [key: string]: { strategy: string; avoid: string } } = {
    chipotle: {
        strategy: "🥙 Bowl: Brown rice + chicken/steak + fajita veggies + lettuce. Skip cheese, get salsa.",
        avoid: "❌ Burrito (tortilla = 300 cal), Chips, Queso, Sour cream",
    },
    "chick-fil-a": {
        strategy: "🍗 Grilled chicken nuggets or sandwich + side salad. Grilled > fried always.",
        avoid: "❌ Fried items, Fries, Milkshakes, Sauces (except mustard)",
    },
    subway: {
        strategy: "🥗 6-inch on whole wheat, load veggies, lean protein (turkey/chicken). Mustard or vinegar.",
        avoid: "❌ Footlong, Cheese, Mayo-based sauces, Meatball/Tuna subs",
    },
    panera: {
        strategy: "🥗 Pick 2: Half salad + soup (broth-based). Load up on protein options.",
        avoid: "❌ Bread bowls, Pastries, Mac & cheese, Creamy soups",
    },
    "olive garden": {
        strategy: "🍝 Herb-grilled salmon + veggies. Ask for light sauce or sauce on side.",
        avoid: "❌ Breadsticks (say no!), Alfredo sauce, Fried appetizers",
    },
    "red lobster": {
        strategy: "🦞 Grilled fish or shrimp + steamed broccoli + garden salad. Lemon not butter.",
        avoid: "❌ Cheddar bay biscuits (hard, I know), Fried seafood, Creamy sauces",
    },
    mcdonalds: {
        strategy: "🍔 Artisan grilled chicken sandwich (no mayo) + side salad or apple slices.",
        avoid: "❌ Big Mac, Fries, Nuggets, All breakfast sandwiches",
    },
    "taco bell": {
        strategy: "🌮 Fresco tacos (chicken/steak) - they replace cheese/sauce with pico. Power bowl is good.",
        avoid: "❌ Chalupas, Quesadillas, Nachos, Anything 'Supreme'",
    },
    "panda express": {
        strategy: "🥡 Grilled teriyaki chicken + mixed veggies. Ask for extra veggies instead of rice.",
        avoid: "❌ Orange chicken, Fried rice, Chow mein, Egg rolls",
    },
    starbucks: {
        strategy: "☕ Egg white bites, protein boxes. Black coffee or unsweetened tea.",
        avoid: "❌ Frappuccinos, Pastries, Sandwiches with croissants",
    },
};

export default function RestaurantFinder() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        requestLocationAndFetch();
    }, []);

    const requestLocationAndFetch = async () => {
        try {
            setLoading(true);
            setError("");

            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                setError("Location permission denied. Enable it in Settings.");
                setLoading(false);
                return;
            }

            // Get location
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            setLocation(loc);

            // Fetch restaurants
            await fetchRestaurants(loc.coords.latitude, loc.coords.longitude);
        } catch (err: any) {
            setError("Failed to get location: " + err.message);
            setLoading(false);
        }
    };

    const fetchRestaurants = async (latitude: number, longitude: number) => {
        try {
            console.log('Fetching restaurants with Yelp API...');
            const data = await YelpService.searchHealthyRestaurants(latitude, longitude, 20);
            console.log('Yelp API success:', data.businesses?.length, 'restaurants found');

            // Process and score restaurants
            const processedRestaurants: Restaurant[] = data.businesses.map(
                (business: any) => {
                    const healthScore = calculateHealthScore(
                        business.name,
                        business.categories
                    );
                    const strategy = getStrategy(business.name);

                    return {
                        id: business.id,
                        name: business.name,
                        rating: business.rating,
                        distance: parseFloat((business.distance / 1609.34).toFixed(1)), // meters to miles
                        categories: business.categories.map((c: any) => c.title),
                        address: business.location.address1,
                        latitude: business.coordinates.latitude,
                        longitude: business.coordinates.longitude,
                        healthScore,
                        strategy: strategy.strategy,
                        avoid: strategy.avoid,
                        coordinates: business.coordinates,
                    };
                }
            );

            // Sort by health score
            processedRestaurants.sort((a, b) => b.healthScore - a.healthScore);

            setRestaurants(processedRestaurants);
            setLoading(false);
        } catch (err: any) {
            console.log("Yelp API failed, using mock data");
            console.error("Error details:", err);
            // Use mock data as fallback
            setRestaurants(getMockRestaurants(latitude, longitude));
            setLoading(false);
        }
    };

    const calculateHealthScore = (name: string, categories: any[]): number => {
        let score = 50; // Base score

        const nameLower = name.toLowerCase();
        const categoryNames = categories.map((c) => c.title?.toLowerCase() || "");

        // Check for healthy keywords
        const healthyKeywords = [
            "salad",
            "fresh",
            "grill",
            "healthy",
            "bowl",
            "juice",
            "smoothie",
            "organic",
            "vegan",
            "mediterranean",
        ];
        const unhealthyKeywords = [
            "burger",
            "pizza",
            "fried",
            "wing",
            "buffet",
            "donut",
            "ice cream",
            "candy",
        ];

        healthyKeywords.forEach((keyword) => {
            if (
                nameLower.includes(keyword) ||
                categoryNames.some((c) => c.includes(keyword))
            ) {
                score += 10;
            }
        });

        unhealthyKeywords.forEach((keyword) => {
            if (
                nameLower.includes(keyword) ||
                categoryNames.some((c) => c.includes(keyword))
            ) {
                score -= 15;
            }
        });

        // Bonus for known healthy chains
        if (
            nameLower.includes("chipotle") ||
            nameLower.includes("sweetgreen") ||
            nameLower.includes("cava") ||
            nameLower.includes("panera")
        ) {
            score += 20;
        }

        return Math.max(0, Math.min(100, score));
    };

    const getStrategy = (
        name: string
    ): { strategy: string; avoid: string } => {
        const nameLower = name.toLowerCase();

        // Check for known chains
        for (const [chain, tips] of Object.entries(CHAIN_STRATEGIES)) {
            if (nameLower.includes(chain)) {
                return tips;
            }
        }

        // Generic healthy strategy
        return {
            strategy:
                "🥗 Choose: Grilled protein + vegetables + whole grains. Ask for dressing/sauce on the side.",
            avoid: "❌ Avoid: Fried items, creamy sauces, bread/chips, sugary drinks.",
        };
    };

    const getMockRestaurants = (
        lat: number,
        lon: number
    ): Restaurant[] => {
        return [
            {
                id: "1",
                name: "Chipotle Mexican Grill",
                rating: 4.2,
                distance: 0.3,
                categories: ["Mexican", "Fast Food"],
                address: "123 Main St",
                latitude: lat,
                longitude: lon,
                healthScore: 85,
                strategy: CHAIN_STRATEGIES.chipotle.strategy,
                avoid: CHAIN_STRATEGIES.chipotle.avoid,
            },
            {
                id: "2",
                name: "Sweetgreen",
                rating: 4.5,
                distance: 0.5,
                categories: ["Salads", "Healthy"],
                address: "456 Oak Ave",
                latitude: lat + 0.001,
                longitude: lon + 0.001,
                healthScore: 95,
                strategy:
                    "🥗 Any salad or warm bowl. Load up on veggies, lean protein. Their portions are perfect.",
                avoid: "❌ None - everything here is solid!",
            },
            {
                id: "3",
                name: "McDonald's",
                rating: 3.8,
                distance: 0.2,
                categories: ["Fast Food", "Burgers"],
                address: "789 Elm St",
                latitude: lat - 0.001,
                longitude: lon - 0.001,
                healthScore: 40,
                strategy: CHAIN_STRATEGIES.mcdonalds.strategy,
                avoid: CHAIN_STRATEGIES.mcdonalds.avoid,
            },
            {
                id: "4",
                name: "Panera Bread",
                rating: 4.3,
                distance: 0.7,
                categories: ["Bakery", "Cafe"],
                address: "321 Pine Rd",
                latitude: lat + 0.002,
                longitude: lon - 0.002,
                healthScore: 75,
                strategy: CHAIN_STRATEGIES.panera.strategy,
                avoid: CHAIN_STRATEGIES.panera.avoid,
            },
            {
                id: "5",
                name: "Local Pizza Place",
                rating: 4.0,
                distance: 0.4,
                categories: ["Pizza", "Italian"],
                address: "555 Broadway",
                latitude: lat - 0.002,
                longitude: lon + 0.002,
                healthScore: 35,
                strategy:
                    "🍕 Thin crust veggie pizza, share it. Side salad to fill up.",
                avoid: "❌ Stuffed crust, meat lovers, garlic knots",
            },
        ];
    };

    const openMaps = (restaurant: Restaurant) => {
        const scheme = Platform.select({
            ios: "maps:",
            android: "geo:",
        });
        const url = Platform.select({
            ios: `maps:0,0?q=${restaurant.name}@${restaurant.latitude},${restaurant.longitude}`,
            android: `geo:0,0?q=${restaurant.latitude},${restaurant.longitude}(${restaurant.name})`,
        });

        Linking.openURL(url!);
    };

    const logVisit = async (restaurant: Restaurant) => {
        Alert.alert(
            "Going to " + restaurant.name + "? 🚗",
            "I'll check in with you later to see how it went!",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Navigate",
                    onPress: () => {
                        openMaps(restaurant);
                        // Save for later check-in
                        AsyncStorage.setItem(
                            "pendingCheckIn",
                            JSON.stringify({
                                restaurant: restaurant.name,
                                time: new Date().toISOString(),
                            })
                        );
                    },
                },
            ]
        );
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return "#10B981"; // Green
        if (score >= 50) return "#F59E0B"; // Orange
        return "#EF4444"; // Red
    };

    const getScoreLabel = (score: number) => {
        if (score >= 70) return "Great Choice";
        if (score >= 50) return "Decent Option";
        return "Be Careful";
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
                <Text style={styles.headerTitle}>Healthy Restaurants</Text>
                <TouchableOpacity
                    onPress={requestLocationAndFetch}
                    style={styles.refreshButton}
                >
                    <Text style={styles.refreshText}>🔄</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8B5CF6" />
                    <Text style={styles.loadingText}>
                        Finding healthy spots nearby...
                    </Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        onPress={requestLocationAndFetch}
                        style={styles.retryButton}
                    >
                        <Text style={styles.retryText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.content}
                >
                    <View style={styles.infoCard}>
                        <Text style={styles.infoTitle}>
                            📍 Found {restaurants.length} restaurants nearby
                        </Text>
                        <Text style={styles.infoSubtitle}>
                            Sorted by health score - best options first!
                        </Text>
                    </View>

                    {restaurants.map((restaurant, index) => (
                        <View key={restaurant.id} style={styles.restaurantCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardLeft}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.restaurantName}>
                                            {restaurant.name}
                                        </Text>
                                        {index === 0 && (
                                            <Text style={styles.topBadge}>👑 TOP</Text>
                                        )}
                                    </View>
                                    <View style={styles.metaRow}>
                                        <Text style={styles.rating}>
                                            ⭐ {restaurant.rating}
                                        </Text>
                                        <Text style={styles.distance}>
                                            📍 {restaurant.distance} mi
                                        </Text>
                                    </View>
                                    <Text style={styles.categories}>
                                        {restaurant.categories.join(", ")}
                                    </Text>
                                </View>

                                <View
                                    style={[
                                        styles.scoreCircle,
                                        {
                                            backgroundColor: getScoreColor(
                                                restaurant.healthScore
                                            ),
                                        },
                                    ]}
                                >
                                    <Text style={styles.scoreNumber}>
                                        {restaurant.healthScore}
                                    </Text>
                                    <Text style={styles.scoreLabel}>
                                        {getScoreLabel(restaurant.healthScore)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.strategySection}>
                                <Text style={styles.strategyTitle}>
                                    ✅ What to Order:
                                </Text>
                                <Text style={styles.strategyText}>
                                    {restaurant.strategy}
                                </Text>

                                <Text style={styles.avoidTitle}>❌ Avoid:</Text>
                                <Text style={styles.avoidText}>
                                    {restaurant.avoid}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.navigateButton}
                                onPress={() => logVisit(restaurant)}
                            >
                                <Text style={styles.navigateText}>
                                    🧭 Navigate & Check In
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}
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
    refreshButton: {
        padding: 8,
    },
    refreshText: {
        fontSize: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#9CA3AF",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    errorText: {
        fontSize: 16,
        color: "#EF4444",
        textAlign: "center",
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: "#8B5CF6",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryText: {
        fontSize: 16,
        fontWeight: "600",
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
        marginBottom: 4,
    },
    infoSubtitle: {
        fontSize: 14,
        color: "#93C5FD",
    },
    restaurantCard: {
        backgroundColor: "#1F2937",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#374151",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    cardLeft: {
        flex: 1,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        flex: 1,
    },
    topBadge: {
        backgroundColor: "#F59E0B",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        fontSize: 10,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    metaRow: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 4,
    },
    rating: {
        fontSize: 14,
        color: "#E5E7EB",
    },
    distance: {
        fontSize: 14,
        color: "#E5E7EB",
    },
    categories: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    scoreCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 12,
    },
    scoreNumber: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    scoreLabel: {
        fontSize: 9,
        fontWeight: "600",
        color: "#FFFFFF",
        textAlign: "center",
    },
    strategySection: {
        backgroundColor: "#111827",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    strategyTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#10B981",
        marginBottom: 4,
    },
    strategyText: {
        fontSize: 13,
        color: "#E5E7EB",
        marginBottom: 12,
        lineHeight: 18,
    },
    avoidTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#EF4444",
        marginBottom: 4,
    },
    avoidText: {
        fontSize: 13,
        color: "#E5E7EB",
        lineHeight: 18,
    },
    navigateButton: {
        backgroundColor: "#3B82F6",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    navigateText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
