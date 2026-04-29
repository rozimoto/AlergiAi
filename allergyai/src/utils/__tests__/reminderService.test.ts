// Mock all Expo/RN dependencies before any imports
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadReminders,
  saveReminders,
  scheduleReminder,
  requestPermissions,
  MealReminder,
} from '../reminderService';

const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;
const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

beforeEach(() => jest.clearAllMocks());

// ─── loadReminders ────────────────────────────────────────────────────────────

describe('loadReminders', () => {
  it('returns 4 default reminders when nothing is stored', async () => {
    mockStorage.getItem.mockResolvedValue(null);
    const result = await loadReminders();
    expect(result).toHaveLength(4);
    expect(result.map(r => r.mealType)).toEqual(['breakfast', 'lunch', 'dinner', 'snack']);
    expect(result.every(r => r.enabled === false)).toBe(true);
  });

  it('returns stored reminders when they exist', async () => {
    const stored: MealReminder[] = [{ id: '1', mealType: 'breakfast', time: '07:30', enabled: true }];
    mockStorage.getItem.mockResolvedValue(JSON.stringify(stored));
    const result = await loadReminders();
    expect(result).toHaveLength(1);
    expect(result[0].time).toBe('07:30');
    expect(result[0].enabled).toBe(true);
  });
});

// ─── saveReminders ────────────────────────────────────────────────────────────

describe('saveReminders', () => {
  it('serialises and writes reminders to AsyncStorage', async () => {
    const reminders: MealReminder[] = [{ id: '2', mealType: 'lunch', time: '12:30', enabled: false }];
    await saveReminders(reminders);
    expect(mockStorage.setItem).toHaveBeenCalledWith('@meal_reminders', JSON.stringify(reminders));
  });
});

// ─── scheduleReminder ─────────────────────────────────────────────────────────

describe('scheduleReminder', () => {
  it('does nothing when reminder is disabled', async () => {
    const reminder: MealReminder = { id: '1', mealType: 'breakfast', time: '08:00', enabled: false };
    await scheduleReminder(reminder);
    expect(mockNotifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('schedules a daily notification when reminder is enabled (12h format)', async () => {
    mockStorage.getItem.mockResolvedValue(null); // use24Hour = false
    const reminder: MealReminder = { id: '1', mealType: 'dinner', time: '18:30', enabled: true };
    await scheduleReminder(reminder);
    expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: 'Time to log your dinner',
          body: expect.stringContaining('6:30 PM'),
        }),
        trigger: expect.objectContaining({ hour: 18, minute: 30 }),
      })
    );
  });

  it('schedules a daily notification with 24h format when preference is set', async () => {
    mockStorage.getItem.mockResolvedValue('true'); // use24Hour = true
    const reminder: MealReminder = { id: '1', mealType: 'lunch', time: '13:00', enabled: true };
    await scheduleReminder(reminder);
    expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          body: expect.stringContaining('13:00'),
        }),
      })
    );
  });
});

// ─── requestPermissions ───────────────────────────────────────────────────────

describe('requestPermissions', () => {
  it('returns true without prompting when permission already granted', async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);
    const result = await requestPermissions();
    expect(result).toBe(true);
    expect(mockNotifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('requests permission and returns true when user grants', async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' } as any);
    mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);
    const result = await requestPermissions();
    expect(result).toBe(true);
    expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('requests permission and returns false when user denies', async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' } as any);
    mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);
    const result = await requestPermissions();
    expect(result).toBe(false);
  });

  it('returns false and does not throw if the call errors', async () => {
    mockNotifications.getPermissionsAsync.mockRejectedValue(new Error('unavailable'));
    const result = await requestPermissions();
    expect(result).toBe(false);
  });
});
