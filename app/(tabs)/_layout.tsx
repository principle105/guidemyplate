import { Tabs, router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type PlusTabBarButtonProps = {
    style?: any;
    onPress?: () => void;
    [key: string]: any;
};

function PlusTabBarButton({ style, onPress, ...rest }: PlusTabBarButtonProps) {
    return (
        <Pressable
            {...rest}
            onPress={() => {
                router.push("/log");
                onPress?.();
            }}
            // keep the nav-provided style so this tab has the same width/flex
            style={({ pressed }) => [
                style,
                styles.plusButtonWrapper,
                pressed && styles.plusButtonWrapperPressed,
            ]}
        >
            <View style={styles.plusCircle}>
                <IconSymbol name="plus" size={22} color="#FFFFFF" />
            </View>
        </Pressable>
    );
}

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarStyle: {
                    height: 70,
                    paddingBottom: 10,
                },
            }}
        >
            {/* Left 1 */}
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={24} name="house.fill" color={color} />
                    ),
                }}
            />

            {/* Left 2 */}
            <Tabs.Screen
                name="camera"
                options={{
                    href: null,
                }}
            />

            {/* Center + */}
            <Tabs.Screen
                name="log"
                options={{
                    title: "Log Meal",
                    tabBarLabel: "",
                    tabBarIcon: () => null,
                    tabBarButton: (props) => <PlusTabBarButton {...props} />,
                }}
            />

            {/* Right 1 */}
            <Tabs.Screen
                name="progress"
                options={{
                    title: "Progress",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={24} name="chart.bar.fill" color={color} />
                    ),
                }}
            />

            {/* Hidden tabs */}
            <Tabs.Screen
                name="insights"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="goals"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    // Takes the full tab slot & centers the circle, then nudges it up a bit
    plusButtonWrapper: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4, // ⬅️ this pulls the button up to align with other icons
    },
    plusButtonWrapperPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.96 }],
    },
    plusCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#3B82F6",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
});
