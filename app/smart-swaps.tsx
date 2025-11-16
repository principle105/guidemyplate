import { router } from "expo-router";
import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Swap = {
    from: string;
    to: string;
    savings: string;
    reason: string;
    emoji: string;
};

const SMART_SWAPS: Swap[] = [
    {
        emoji: "🍔",
        from: "Big Mac",
        to: "Grilled chicken sandwich",
        savings: "350 calories",
        reason: "Same filling, way less fat & calories",
    },
    {
        emoji: "🍕",
        from: "Pizza slice",
        to: "Thin crust + veggies",
        savings: "200 calories",
        reason: "More nutrients, less dough",
    },
    {
        emoji: "🥤",
        from: "Regular soda",
        to: "Sparkling water + lemon",
        savings: "140 calories",
        reason: "Zero sugar, still refreshing",
    },
    {
        emoji: "🍝",
        from: "Alfredo pasta",
        to: "Marinara pasta",
        savings: "400 calories",
        reason: "Tomato sauce vs heavy cream",
    },
    {
        emoji: "🍦",
        from: "Ice cream",
        to: "Greek yogurt + berries",
        savings: "250 calories",
        reason: "High protein, natural sweetness",
    },
    {
        emoji: "🥓",
        from: "Bacon",
        to: "Turkey bacon",
        savings: "80 calories",
        reason: "Less fat, same savory taste",
    },
    {
        emoji: "🍞",
        from: "White bread",
        to: "Whole wheat bread",
        savings: "Fiber boost",
        reason: "Keeps you full 3x longer",
    },
    {
        emoji: "🍔",
        from: "Burger + fries",
        to: "Burger + side salad",
        savings: "300 calories",
        reason: "Same satisfaction, more nutrients",
    },
    {
        emoji: "🥛",
        from: "Whole milk",
        to: "Almond milk (unsweetened)",
        savings: "100 calories per cup",
        reason: "Low calorie, vitamin fortified",
    },
    {
        emoji: "🍪",
        from: "Cookies",
        to: "Apple + peanut butter",
        savings: "180 calories",
        reason: "Protein + fiber = sustained energy",
    },
];

export default function SmartSwaps() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredSwaps = SMART_SWAPS.filter(
        (swap) =>
            swap.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
            swap.to.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Smart Swaps</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
            >
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>
                        🔄 Simple Swaps = Big Results
                    </Text>
                    <Text style={styles.infoText}>
                        Small changes add up! Making just 2-3 of these swaps
                        daily can lead to 1-2 lbs of weight loss per week.
                    </Text>
                </View>

                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a food..."
                    placeholderTextColor="#6B7280"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />

                {filteredSwaps.map((swap, index) => (
                    <View key={index} style={styles.swapCard}>
                        <Text style={styles.swapEmoji}>{swap.emoji}</Text>

                        <View style={styles.swapContent}>
                            <View style={styles.swapRow}>
                                <View style={styles.swapItem}>
                                    <Text style={styles.swapLabel}>❌ Skip</Text>
                                    <Text style={styles.swapFood}>
                                        {swap.from}
                                    </Text>
                                </View>

                                <Text style={styles.arrow}>→</Text>

                                <View style={styles.swapItem}>
                                    <Text style={styles.swapLabelGood}>
                                        ✅ Choose
                                    </Text>
                                    <Text style={styles.swapFood}>
                                        {swap.to}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.swapInfo}>
                                <Text style={styles.savings}>
                                    💡 Save: {swap.savings}
                                </Text>
                                <Text style={styles.reason}>{swap.reason}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
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
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: "#93C5FD",
        lineHeight: 20,
    },
    searchInput: {
        backgroundColor: "#1F2937",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: "#FFFFFF",
        marginBottom: 16,
    },
    swapCard: {
        backgroundColor: "#1F2937",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: "row",
        alignItems: "center",
    },
    swapEmoji: {
        fontSize: 40,
        marginRight: 16,
    },
    swapContent: {
        flex: 1,
    },
    swapRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    swapItem: {
        flex: 1,
    },
    swapLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#EF4444",
        marginBottom: 4,
    },
    swapLabelGood: {
        fontSize: 11,
        fontWeight: "600",
        color: "#10B981",
        marginBottom: 4,
    },
    swapFood: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    arrow: {
        fontSize: 20,
        color: "#8B5CF6",
        marginHorizontal: 8,
    },
    swapInfo: {
        backgroundColor: "#111827",
        padding: 10,
        borderRadius: 8,
    },
    savings: {
        fontSize: 13,
        fontWeight: "600",
        color: "#10B981",
        marginBottom: 4,
    },
    reason: {
        fontSize: 12,
        color: "#9CA3AF",
        lineHeight: 16,
    },
});
