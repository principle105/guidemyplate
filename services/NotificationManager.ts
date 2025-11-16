import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

class NotificationManager {
    static async requestPermissions(): Promise<boolean> {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return false;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#8B5CF6',
            });
        }

        return true;
    }

    static async scheduleAllNotifications() {
        await this.cancelAllNotifications();

        const mealReminders = await AsyncStorage.getItem('mealRemindersEnabled');
        const goalReminders = await AsyncStorage.getItem('goalRemindersEnabled');
        const motivation = await AsyncStorage.getItem('motivationEnabled');
        const hydration = await AsyncStorage.getItem('hydrationEnabled');

        if (mealReminders !== 'false') await this.scheduleMealReminders();
        if (goalReminders !== 'false') await this.scheduleGoalReminders();
        if (motivation !== 'false') await this.scheduleMotivationalMessages();
        if (hydration !== 'false') await this.scheduleHydrationReminders();
    }

    static async scheduleMealReminders() {
        // Simplified for now - notifications will be handled by user settings
        console.log('Meal reminders would be scheduled here');
    }

    static async scheduleGoalReminders() {
        // Simplified for now - notifications will be handled by user settings
        console.log('Goal reminders would be scheduled here');
    }

    static async scheduleMotivationalMessages() {
        const messages = [
            '💚 Small steps lead to big changes. You\'re doing amazing!',
            '🌟 Progress isn\'t linear. Up days, down days - both are progress',
            '🎉 Celebrate yourself today. You\'re showing up!',
        ];

        // Simplified for now - motivational messages will be handled by user settings
        console.log('Motivational messages would be scheduled here');
    }

    static async scheduleHydrationReminders() {
        // Simplified for now - notifications will be handled by user settings
        console.log('Hydration reminders would be scheduled here');
    }

    static async sendTestNotification() {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🎉 Great job!',
                body: 'You\'re building healthy habits one step at a time!',
                sound: true,
            },
            trigger: null,
        });
    }

    static async cancelAllNotifications() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }

    static async getScheduledCount(): Promise<number> {
        const notifications = await Notifications.getAllScheduledNotificationsAsync();
        return notifications.length;
    }
}

export default NotificationManager;
