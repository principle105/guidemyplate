import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function InsightsTab() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <SafeAreaView
            style={[styles.container, isDark && styles.containerDark]}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ThemedView
                    style={[styles.content, { backgroundColor: "transparent" }]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <ThemedText
                                type="title"
                                style={[
                                    styles.title,
                                    isDark && styles.titleDark,
                                ]}
                            >
                                Your Diet This Week
                            </ThemedText>
                            <ThemedText
                                style={[
                                    styles.subTitle,
                                    isDark && styles.subTitleDark,
                                ]}
                            >
                                See what’s pushing your weight up or down
                            </ThemedText>
                        </View>
                    </View>

                    {/* High / Risky Patterns */}
                    <View style={styles.sectionHeader}>
                        <ThemedText
                            style={[
                                styles.sectionTitle,
                                isDark && styles.sectionTitleDark,
                            ]}
                        >
                            🚨 Things to Watch
                        </ThemedText>
                    </View>

                    {/* High Added Sugar Card */}
                    <View
                        style={[
                            styles.insightCard,
                            styles.insightHigh,
                            isDark && styles.insightCardDark,
                        ]}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.checkboxRow}>
                                <View
                                    style={[
                                        styles.checkbox,
                                        styles.highCheckbox,
                                    ]}
                                />
                                <View style={styles.headerTextContainer}>
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={[
                                            styles.cardTitle,
                                            isDark && styles.cardTitleDark,
                                        ]}
                                    >
                                        High Added Sugar
                                    </ThemedText>
                                    <View
                                        style={[styles.badge, styles.highBadge]}
                                    >
                                        <ThemedText style={styles.badgeText}>
                                            200%
                                        </ThemedText>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <ThemedText
                            style={[
                                styles.subtitle,
                                isDark && styles.subtitleDark,
                            ]}
                        >
                            Top contributors
                        </ThemedText>

                        <View style={styles.itemContainer}>
                            <ThemedText
                                style={[styles.item, isDark && styles.itemDark]}
                            >
                                🥤 Coke Zero
                            </ThemedText>
                            <ThemedText
                                style={[
                                    styles.itemAmount,
                                    isDark && styles.itemAmountDark,
                                ]}
                            >
                                80g
                            </ThemedText>
                        </View>

                        <View style={styles.itemContainer}>
                            <ThemedText
                                style={[styles.item, isDark && styles.itemDark]}
                            >
                                🧁 Cupcakes
                            </ThemedText>
                            <ThemedText
                                style={[
                                    styles.itemAmount,
                                    isDark && styles.itemAmountDark,
                                ]}
                            >
                                200g
                            </ThemedText>
                        </View>
                    </View>

                    {/* High Saturated Fat Card */}
                    <View
                        style={[
                            styles.insightCard,
                            styles.insightHigh,
                            isDark && styles.insightCardDark,
                        ]}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.checkboxRow}>
                                <View
                                    style={[
                                        styles.checkbox,
                                        styles.highCheckbox,
                                    ]}
                                />
                                <View style={styles.headerTextContainer}>
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={[
                                            styles.cardTitle,
                                            isDark && styles.cardTitleDark,
                                        ]}
                                    >
                                        High Saturated Fats
                                    </ThemedText>
                                    <View
                                        style={[styles.badge, styles.highBadge]}
                                    >
                                        <ThemedText style={styles.badgeText}>
                                            200%
                                        </ThemedText>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <ThemedText
                            style={[
                                styles.subtitle,
                                isDark && styles.subtitleDark,
                            ]}
                        >
                            Top contributors
                        </ThemedText>

                        <View style={styles.itemContainer}>
                            <ThemedText
                                style={[styles.item, isDark && styles.itemDark]}
                            >
                                🍔 Burger
                            </ThemedText>
                            <ThemedText
                                style={[
                                    styles.itemAmount,
                                    isDark && styles.itemAmountDark,
                                ]}
                            >
                                150g
                            </ThemedText>
                        </View>

                        <View style={styles.itemContainer}>
                            <ThemedText
                                style={[styles.item, isDark && styles.itemDark]}
                            >
                                🧈 Butter
                            </ThemedText>
                            <ThemedText
                                style={[
                                    styles.itemAmount,
                                    isDark && styles.itemAmountDark,
                                ]}
                            >
                                50g
                            </ThemedText>
                        </View>
                    </View>

                    {/* Low Nutrient Section */}
                    <View style={styles.sectionHeader}>
                        <ThemedText
                            style={[
                                styles.sectionTitle,
                                isDark && styles.sectionTitleDark,
                            ]}
                        >
                            🧩 Gaps to Fill
                        </ThemedText>
                    </View>

                    {/* Low Vitamin D Card */}
                    <View
                        style={[
                            styles.insightCard,
                            styles.insightLow,
                            isDark && styles.insightCardDarkLow,
                        ]}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.checkboxRow}>
                                <View
                                    style={[
                                        styles.checkbox,
                                        styles.lowCheckbox,
                                    ]}
                                />
                                <View style={styles.headerTextContainer}>
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={[
                                            styles.cardTitle,
                                            isDark && styles.cardTitleDark,
                                        ]}
                                    >
                                        Low Vitamin D
                                    </ThemedText>

                                    <View
                                        style={[styles.badge, styles.lowBadge]}
                                    >
                                        <ThemedText style={styles.badgeText}>
                                            10%
                                        </ThemedText>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <ThemedText
                            style={[
                                styles.subtitle,
                                isDark && styles.subtitleDark,
                            ]}
                        >
                            Foods to add
                        </ThemedText>

                        <View style={styles.itemContainer}>
                            <ThemedText
                                style={[styles.item, isDark && styles.itemDark]}
                            >
                                🐟 Salmon
                            </ThemedText>
                            <ThemedText
                                style={[
                                    styles.itemAmount,
                                    isDark && styles.itemAmountDark,
                                ]}
                            >
                                100g
                            </ThemedText>
                        </View>

                        <View style={styles.itemContainer}>
                            <ThemedText
                                style={[styles.item, isDark && styles.itemDark]}
                            >
                                🥚 Egg yolks
                            </ThemedText>
                            <ThemedText
                                style={[
                                    styles.itemAmount,
                                    isDark && styles.itemAmountDark,
                                ]}
                            >
                                2 eggs
                            </ThemedText>
                        </View>
                    </View>

                    {/* Bottom spacing */}
                    <View style={{ height: 40 }} />
                </ThemedView>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent",
    },
    containerDark: {
        backgroundColor: "transparent",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    content: {
        flex: 1,
        backgroundColor: "transparent",
    },
    header: {
        marginBottom: 20,
        marginTop: 8,
    },
    title: {
        fontFamily: Fonts.rounded,
        fontSize: 32,
        fontWeight: "bold",
        color: "#1F2937",
        marginBottom: 4,
    },
    titleDark: {
        color: "#FFFFFF",
    },
    subTitle: {
        fontSize: 16,
        color: "#6B7280",
    },
    subTitleDark: {
        color: "#9BA1A6",
    },
    sectionHeader: {
        marginBottom: 12,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1F2937",
    },
    sectionTitleDark: {
        color: "#FFFFFF",
    },
    insightCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    insightCardDark: {
        backgroundColor: "#111827",
    },
    insightCardDarkLow: {
        backgroundColor: "#1E3A5F",
        borderColor: "#3B82F6",
        borderWidth: 1,
    },
    insightHigh: {
        borderLeftWidth: 4,
        borderLeftColor: "#F97373",
    },
    insightLow: {
        borderLeftWidth: 4,
        borderLeftColor: "#3B82F6",
        backgroundColor: "#EEF2FF",
    },
    cardHeader: {
        marginBottom: 12,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#FFFFFF",
        marginTop: 2,
    },
    highCheckbox: {
        backgroundColor: "#EF4444",
        borderColor: "#B91C1C",
    },
    lowCheckbox: {
        backgroundColor: "#3B82F6",
        borderColor: "#1D4ED8",
    },
    headerTextContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
        flex: 1,
    },
    cardTitleDark: {
        color: "#F9FAFB",
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 0,
        alignSelf: "flex-start",
    },
    highBadge: {
        backgroundColor: "rgba(239, 68, 68, 0.12)",
    },
    lowBadge: {
        backgroundColor: "rgba(59, 130, 246, 0.12)",
    },
    badgeText: {
        fontSize: 13,
        color: "#111827",
        fontWeight: "700",
    },
    subtitle: {
        fontSize: 13,
        marginBottom: 8,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        color: "#6B7280",
    },
    subtitleDark: {
        color: "#9CA3AF",
    },
    itemContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        marginBottom: 8,
    },
    item: {
        fontSize: 15,
        fontWeight: "500",
        color: "#111827",
    },
    itemDark: {
        color: "#F9FAFB",
    },
    itemAmount: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
    },
    itemAmountDark: {
        color: "#D1D5DB",
    },
});
