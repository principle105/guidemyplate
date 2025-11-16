import AsyncStorage from '@react-native-async-storage/async-storage';

type ActivityLog = {
  type: 'weight' | 'goal' | 'win' | 'restaurant' | 'swap';
  date: string;
  data?: any;
};

class StreakManager {
  static async logActivity(type: ActivityLog['type'], data?: any) {
    try {
      const today = new Date().toDateString();
      const activities = await this.getActivities();
      
      // Check if this type was already logged today
      const alreadyLoggedToday = activities.some(
        activity => activity.date === today && activity.type === type
      );
      
      if (!alreadyLoggedToday) {
        const newActivity: ActivityLog = {
          type,
          date: today,
          data
        };
        
        activities.unshift(newActivity);
        await AsyncStorage.setItem('activityLog', JSON.stringify(activities));
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  static async getActivities(): Promise<ActivityLog[]> {
    try {
      const stored = await AsyncStorage.getItem('activityLog');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting activities:', error);
      return [];
    }
  }

  static async getCurrentStreak(): Promise<number> {
    try {
      const activities = await this.getActivities();
      if (activities.length === 0) return 0;

      let streak = 0;
      const today = new Date();
      
      // Check each day going backwards
      for (let i = 0; i < 30; i++) { // Check last 30 days
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toDateString();
        
        // Check if there's any activity on this date
        const hasActivity = activities.some(activity => activity.date === dateString);
        
        if (hasActivity) {
          streak++;
        } else if (i === 0) {
          // If no activity today, streak is 0
          break;
        } else {
          // If we find a gap, stop counting
          break;
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }

  static async getWeeklyProgress(): Promise<{
    thisWeek: number;
    lastWeek: number;
    weeklyGoal: number;
  }> {
    try {
      const activities = await this.getActivities();
      const today = new Date();
      
      // Get start of this week (Sunday)
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      thisWeekStart.setHours(0, 0, 0, 0);
      
      // Get start of last week
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(thisWeekStart.getDate() - 7);
      
      // Count unique days with activities
      const thisWeekDays = new Set();
      const lastWeekDays = new Set();
      
      activities.forEach(activity => {
        const activityDate = new Date(activity.date);
        
        if (activityDate >= thisWeekStart) {
          thisWeekDays.add(activity.date);
        } else if (activityDate >= lastWeekStart && activityDate < thisWeekStart) {
          lastWeekDays.add(activity.date);
        }
      });
      
      return {
        thisWeek: thisWeekDays.size,
        lastWeek: lastWeekDays.size,
        weeklyGoal: 5 // Goal: 5 active days per week
      };
    } catch (error) {
      console.error('Error calculating weekly progress:', error);
      return { thisWeek: 0, lastWeek: 0, weeklyGoal: 5 };
    }
  }

  static async getRecentAchievements(): Promise<string[]> {
    try {
      const activities = await this.getActivities();
      const achievements = [];
      
      // Check for various achievements
      const streak = await this.getCurrentStreak();
      if (streak >= 7) achievements.push(`🔥 ${streak}-day streak!`);
      if (streak >= 3) achievements.push('💪 3+ days consistent');
      
      // Check for weight logging
      const weightLogs = activities.filter(a => a.type === 'weight');
      if (weightLogs.length >= 5) achievements.push('📊 Weight tracking pro');
      
      // Check for completed goals
      const goalLogs = activities.filter(a => a.type === 'goal');
      if (goalLogs.length >= 10) achievements.push('🎯 Goal crusher');
      
      return achievements.slice(0, 3); // Return top 3
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }
}

export default StreakManager;