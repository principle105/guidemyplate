import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";

export default function InsightsTab() {
    return (
        <ScrollView style={styles.container}>
            <ThemedView style={styles.content}>
                <ThemedText type="title" style={styles.title}>
                    Your Diet This Week
                </ThemedText>

                {/* High Added Sugar Card */}
                <View style={[styles.card, styles.highCard]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.checkboxRow}>
                            <View
                                style={[styles.checkbox, styles.highCheckbox]}
                            />
                            <View style={styles.headerTextContainer}>
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={styles.cardTitle}
                                >
                                    High Added Sugar
                                </ThemedText>
                                <View style={[styles.badge, styles.highBadge]}>
                                    <ThemedText style={styles.badgeText}>
                                        200%
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                    </View>
                    <ThemedText style={styles.subtitle}>
                        Top Contributors
                    </ThemedText>
                    <View style={styles.itemContainer}>
                        <ThemedText style={styles.item}>
                            🥤 Coke Zero
                        </ThemedText>
                        <ThemedText style={styles.itemAmount}>80g</ThemedText>
                    </View>
                    <View style={styles.itemContainer}>
                        <ThemedText style={styles.item}>🧁 Cupcakes</ThemedText>
                        <ThemedText style={styles.itemAmount}>200g</ThemedText>
                    </View>
                </View>

                {/* High Saturated Fats Card */}
                <View style={[styles.card, styles.highCard]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.checkboxRow}>
                            <View
                                style={[styles.checkbox, styles.highCheckbox]}
                            />
                            <View style={styles.headerTextContainer}>
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={styles.cardTitle}
                                >
                                    High Saturated Fats
                                </ThemedText>
                                <View style={[styles.badge, styles.highBadge]}>
                                    <ThemedText style={styles.badgeText}>
                                        200%
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                    </View>
                    <ThemedText style={styles.subtitle}>
                        Top Contributors
                    </ThemedText>
                    <View style={styles.itemContainer}>
                        <ThemedText style={styles.item}>🍔 Burger</ThemedText>
                        <ThemedText style={styles.itemAmount}>150g</ThemedText>
                    </View>
                    <View style={styles.itemContainer}>
                        <ThemedText style={styles.item}>🧈 Butter</ThemedText>
                        <ThemedText style={styles.itemAmount}>50g</ThemedText>
                    </View>
                </View>

                {/* Low Vitamin D Card */}
                <View style={[styles.card, styles.lowCard]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.checkboxRow}>
                            <View
                                style={[styles.checkbox, styles.lowCheckbox]}
                            />
                            <View style={styles.headerTextContainer}>
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={styles.cardTitle}
                                >
                                    Low Vitamin D
                                </ThemedText>
                                <View style={[styles.badge, styles.lowBadge]}>
                                    <ThemedText style={styles.badgeText}>
                                        10%
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                    </View>
                    <ThemedText style={styles.subtitle}>
                        Foods to Add
                    </ThemedText>
                    <View style={styles.itemContainer}>
                        <ThemedText style={styles.item}>🐟 Salmon</ThemedText>
                        <ThemedText style={styles.itemAmount}>100g</ThemedText>
                    </View>
                    <View style={styles.itemContainer}>
                        <ThemedText style={styles.item}>
                            🥚 Egg Yolks
                        </ThemedText>
                        <ThemedText style={styles.itemAmount}>
                            2 eggs
                        </ThemedText>
                    </View>
                </View>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontFamily: Fonts.rounded,
        fontSize: 32,
        marginBottom: 24,
    },
    card: {
        borderWidth: 2,
        borderColor: "#000",
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    highCard: {
        backgroundColor: "#FFF5F5",
    },
    lowCard: {
        backgroundColor: "#FFF8F0",
    },
    cardHeader: {
        marginBottom: 16,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderWidth: 2,
        borderColor: "#000",
        borderRadius: 8,
        marginTop: 2,
    },
    highCheckbox: {
        backgroundColor: "#FF4444",
    },
    lowCheckbox: {
        backgroundColor: "#FFB84D",
    },
    headerTextContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 8,
    },
    cardTitle: {
        fontSize: 18,
        flex: 1,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#000",
    },
    highBadge: {
        backgroundColor: "#FF4444",
    },
    lowBadge: {
        backgroundColor: "#FFB84D",
    },
    badgeText: {
        fontSize: 16,
        color: "#FFF",
        fontWeight: "700",
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 12,
        fontWeight: "600",
        opacity: 0.7,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    itemContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#FFF",
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
    },
    item: {
        fontSize: 15,
        fontWeight: "500",
    },
    itemAmount: {
        fontSize: 14,
        opacity: 0.6,
        fontWeight: "600",
    },
});
