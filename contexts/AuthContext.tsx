import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (name: string, email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on app start
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const userJson = await AsyncStorage.getItem("user");
            if (userJson) {
                setUser(JSON.parse(userJson));
            }
        } catch (error) {
            console.error("Error checking auth status:", error);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (name: string, email: string, password: string) => {
        // In a real app, you'd call your backend API here
        // For now, we'll simulate creating a user
        const newUser: User = {
            id: Date.now().toString(),
            name,
            email,
        };

        // Store user data
        await AsyncStorage.setItem("user", JSON.stringify(newUser));
        // In a real app, you'd also store the auth token
        await AsyncStorage.setItem("authToken", "fake-token-" + newUser.id);

        setUser(newUser);
    };

    const login = async (email: string, password: string) => {
        // In a real app, you'd call your backend API here to verify credentials
        // For now, we'll simulate a login
        const existingUser: User = {
            id: Date.now().toString(),
            name: email.split("@")[0], // Use email prefix as name for demo
            email,
        };

        // Store user data
        await AsyncStorage.setItem("user", JSON.stringify(existingUser));
        await AsyncStorage.setItem(
            "authToken",
            "fake-token-" + existingUser.id
        );

        setUser(existingUser);
    };

    const logout = async () => {
        // Clear stored data
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("authToken");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signUp,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
