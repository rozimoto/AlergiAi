// Mock heavy deps before any imports
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

jest.mock('../config/firebase', () => ({
  db: {},
  auth: { currentUser: null, onAuthStateChanged: jest.fn() },
  functions: {},
}), { virtual: true });

jest.mock('../../config/firebase', () => ({
  db: {},
  auth: { currentUser: null, onAuthStateChanged: jest.fn() },
  functions: {},
}));

jest.mock('firebase/functions', () => ({ httpsCallable: jest.fn() }));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

jest.mock('../emergencyContactService', () => ({
  getEmergencyContact: jest.fn(),
}));

jest.mock('../quietHoursUtils', () => ({
  isInQuietHours: jest.fn(() => false),
}));

import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions } from '../allergenAlertService';

const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;

beforeEach(() => jest.clearAllMocks());

// ─── requestNotificationPermissions ──────────────────────────────────────────

describe('requestNotificationPermissions', () => {
  it('returns true and skips the OS prompt when permission is already granted', async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);

    const result = await requestNotificationPermissions();

    expect(result).toBe(true);
    expect(mockNotifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('triggers the OS prompt and returns true when user grants from undetermined', async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' } as any);
    mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);

    const result = await requestNotificationPermissions();

    expect(result).toBe(true);
    expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('returns false when user denies the OS prompt', async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' } as any);
    mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);

    const result = await requestNotificationPermissions();

    expect(result).toBe(false);
  });

  it('triggers the OS prompt and returns false when current status is denied', async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);
    mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);

    const result = await requestNotificationPermissions();

    expect(result).toBe(false);
    expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });
});
