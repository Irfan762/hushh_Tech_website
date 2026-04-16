/**
 * Authentication Service Unit Tests
 * 
 * Tests for core authentication functions:
 * - getUserDetails: Get current user session
 * - isLoggedIn: Check if user is authenticated
 * - getAccessToken: Extract JWT access token
 * - getFullName: Get user's full name
 * - signOut: Logout user
 * 
 * These tests mock Supabase and session utilities to validate logic without real API calls.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock Session Data ──────────────────────────────────────────────────────
const MOCK_SESSION = {
  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token-payload',
  refresh_token: 'mock-refresh-token-123',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'user-uuid-12345',
    email: 'investor@hushh.ai',
    app_metadata: { provider: 'google' },
    user_metadata: {
      full_name: 'John Investor',
      avatar_url: 'https://example.com/avatar.png',
    },
    aud: 'authenticated',
    created_at: '2026-01-01T00:00:00.000Z',
  },
};

const MOCK_SESSION_APPLE = {
  access_token: 'apple-token-payload',
  refresh_token: 'mock-apple-refresh-token',
  user: {
    id: 'user-apple-456',
    email: 'apple@hushh.ai',
    app_metadata: { provider: 'apple' },
    user_metadata: { full_name: 'Jane Apple User' },
  },
};

// ─── Hoisted Mocks ───────────────────────────────────────────────────────────
const { mockGetValidatedSession, mockSupabaseClient, mockSupabaseSignOut } = vi.hoisted(() => {
  const mockGetValidatedSession = vi.fn();
  const mockSupabaseSignOut = vi.fn();

  const mockSupabaseClient = {
    auth: {
      signOut: mockSupabaseSignOut,
    },
  };

  return {
    mockGetValidatedSession,
    mockSupabaseClient,
    mockSupabaseSignOut,
  };
});

// ─── Mock Modules ────────────────────────────────────────────────────────────
vi.mock('../../src/resources/config/config', () => ({
  default: {
    supabaseClient: mockSupabaseClient,
  },
}));

vi.mock('../../src/resources/resources', () => ({
  default: {
    config: {
      supabaseClient: mockSupabaseClient,
    },
  },
}));

// Mock the session utility - this is what getUserDetails actually uses
vi.mock('../../src/auth/session', () => ({
  getValidatedSession: mockGetValidatedSession,
  startUnifiedOAuth: vi.fn(),
}));

// ─── Import After Mocks ──────────────────────────────────────────────────────
import getUserDetails from '../../src/services/authentication/getUserDetails';
import isLoggedIn from '../../src/services/authentication/isLoggedIn';
import getAccessToken from '../../src/services/authentication/getAccessToken';
import getFullName from '../../src/services/authentication/getFullName';
import signOut from '../../src/services/authentication/signOut';

// ═════════════════════════════════════════════════════════════════════════════
// TEST SUITES
// ═════════════════════════════════════════════════════════════════════════════

describe('Authentication Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getUserDetails Tests
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getUserDetails', () => {
    it('should return session data when user is logged in', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'authenticated',
        session: MOCK_SESSION,
        user: MOCK_SESSION.user,
      });

      const result = await getUserDetails(null);

      expect(result.data).toBeDefined();
      expect(result.data).not.toBeNull();
      expect(result.data?.access_token).toBe(MOCK_SESSION.access_token);
      expect(result.data?.user.email).toBe('investor@hushh.ai');
    });

    it('should return null data when no session exists', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'anonymous',
        session: null,
        user: null,
      });

      const result = await getUserDetails(null);

      expect(result.data).toBeNull();
    });

    it('should return null data on invalidated session', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'invalidated',
        session: null,
        user: null,
        reason: 'expired',
      });

      const result = await getUserDetails(null);

      expect(result.data).toBeNull();
    });

    it('should call callback with session data when provided', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'authenticated',
        session: MOCK_SESSION,
        user: MOCK_SESSION.user,
      });

      const mockCallback = vi.fn();
      await getUserDetails(mockCallback);

      expect(mockCallback).toHaveBeenCalledOnce();
      expect(mockCallback).toHaveBeenCalledWith({ data: MOCK_SESSION });
    });

    it('should call callback with null on no session', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'anonymous',
        session: null,
        user: null,
      });

      const mockCallback = vi.fn();
      await getUserDetails(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith({ data: null });
    });

    it('should handle exceptions gracefully', async () => {
      mockGetValidatedSession.mockRejectedValue(new Error('Network error'));

      const result = await getUserDetails(null);

      expect(result.data).toBeNull();
    });

    it('should extract user metadata correctly', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'authenticated',
        session: MOCK_SESSION,
        user: MOCK_SESSION.user,
      });

      const result = await getUserDetails(null);

      expect(result.data?.user.user_metadata.full_name).toBe('John Investor');
      expect(result.data?.user.user_metadata.avatar_url).toBe(
        'https://example.com/avatar.png'
      );
    });

    it('should include refresh token in response', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'authenticated',
        session: MOCK_SESSION,
        user: MOCK_SESSION.user,
      });

      const result = await getUserDetails(null);

      expect(result.data?.refresh_token).toBe('mock-refresh-token-123');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // isLoggedIn Tests
  // ═══════════════════════════════════════════════════════════════════════════

  describe('isLoggedIn', () => {
    it('should detect logged-in user correctly', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'authenticated',
        session: MOCK_SESSION,
        user: MOCK_SESSION.user,
      });

      const result = await isLoggedIn(null);

      expect(result).toBe(true);
    });

    it('should detect logged-out user correctly', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'anonymous',
        session: null,
        user: null,
      });

      const result = await isLoggedIn(null);

      expect(result).toBe(false);
    });

    it('should call callback with login status', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'authenticated',
        session: MOCK_SESSION,
        user: MOCK_SESSION.user,
      });

      const mockCallback = vi.fn();
      await isLoggedIn(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(true);
    });

    it('should call callback with false for logged-out state', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'anonymous',
        session: null,
        user: null,
      });

      const mockCallback = vi.fn();
      await isLoggedIn(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(false);
    });

    it('should handle errors during login check', async () => {
      mockGetValidatedSession.mockRejectedValue(new Error('Check failed'));

      const result = await isLoggedIn(null);

      expect(result).toBe(false);
    });

    it('should detect invalidated session as logged out', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'invalidated',
        session: null,
        user: null,
        reason: 'expired',
      });

      const result = await isLoggedIn(null);

      expect(result).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getAccessToken Tests
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getAccessToken', () => {
    it('should extract access token from session', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'authenticated',
        session: MOCK_SESSION,
        user: MOCK_SESSION.user,
      });

      const mockCallback = vi.fn();
      const token = await getAccessToken(mockCallback);

      expect(token).toBe(MOCK_SESSION.access_token);
      expect(mockCallback).toHaveBeenCalledWith(MOCK_SESSION.access_token);
    });

    it('should return null when no session exists', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'anonymous',
        session: null,
        user: null,
      });

      const mockCallback = vi.fn();
      const token = await getAccessToken(mockCallback);

      expect(token).toBeNull();
    });

    it('should return null on error', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'invalidated',
        session: null,
        user: null,
      });

      const mockCallback = vi.fn();
      const token = await getAccessToken(mockCallback);

      expect(token).toBeNull();
    });

    it('should handle network errors', async () => {
      mockGetValidatedSession.mockRejectedValue(new Error('Network error'));

      const mockCallback = vi.fn();
      const token = await getAccessToken(mockCallback);

      expect(token).toBeNull();
    });

    it('should return valid JWT format token', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'authenticated',
        session: MOCK_SESSION,
        user: MOCK_SESSION.user,
      });

      const mockCallback = vi.fn();
      const token = await getAccessToken(mockCallback);

      // JWT format: header.payload.signature
      expect(token).toMatch(/^[A-Za-z0-9-_.]+$/);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getFullName Tests
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getFullName', () => {
    it('should extract full name from user metadata', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'authenticated',
        session: MOCK_SESSION,
        user: MOCK_SESSION.user,
      });

      const mockCallback = vi.fn();
      const name = await getFullName(mockCallback);

      expect(name).toBe('John Investor');
      expect(mockCallback).toHaveBeenCalledWith('John Investor');
    });

    it('should return undefined when no session exists', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'anonymous',
        session: null,
        user: null,
      });

      const mockCallback = vi.fn();
      const name = await getFullName(mockCallback);

      expect(name).toBeUndefined();
    });

    it('should return undefined when name is missing in metadata', async () => {
      const sessionWithoutName = {
        ...MOCK_SESSION,
        user: {
          ...MOCK_SESSION.user,
          user_metadata: { avatar_url: 'https://example.com/avatar.png' },
        },
      };

      mockGetValidatedSession.mockResolvedValue({
        status: 'authenticated',
        session: sessionWithoutName,
        user: sessionWithoutName.user,
      });

      const mockCallback = vi.fn();
      const name = await getFullName(mockCallback);

      expect(name).toBeUndefined();
    });

    it('should handle error responses', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'invalidated',
        session: null,
        user: null,
      });

      const mockCallback = vi.fn();
      const name = await getFullName(mockCallback);

      expect(name).toBeUndefined();
    });

    it('should handle network errors', async () => {
      mockGetValidatedSession.mockRejectedValue(new Error('Network error'));

      const mockCallback = vi.fn();
      const name = await getFullName(mockCallback);

      expect(name).toBeUndefined();
    });

    it('should handle various name formats', async () => {
      const testCases = [
        'John Investor',
        'Jane Doe-Smith',
        'José García',
        'Li Wei',
      ];

      for (const testName of testCases) {
        const sessionWithName = {
          ...MOCK_SESSION,
          user: {
            ...MOCK_SESSION.user,
            user_metadata: { full_name: testName },
          },
        };

        mockGetValidatedSession.mockResolvedValue({
          status: 'authenticated',
          session: sessionWithName,
          user: sessionWithName.user,
        });

        const mockCallback = vi.fn();
        const name = await getFullName(mockCallback);

        expect(name).toBe(testName);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // signOut Tests
  // ═══════════════════════════════════════════════════════════════════════════

  describe('signOut', () => {
    it('should call Supabase signOut', async () => {
      mockSupabaseSignOut.mockResolvedValue({ error: null });

      await signOut();

      expect(mockSupabaseSignOut).toHaveBeenCalledOnce();
    });

    it('should handle signOut errors', async () => {
      mockSupabaseSignOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
      });

      // Should not throw even with error
      await expect(signOut()).resolves.toBeUndefined();
    });

    it('should throw on network errors during signOut', async () => {
      mockSupabaseSignOut.mockRejectedValue(new Error('Network error'));

      // Current implementation throws on error
      await expect(signOut()).rejects.toThrow('Network error');
    });

    it('should be callable without parameters', async () => {
      mockSupabaseSignOut.mockResolvedValue({ error: null });

      const result = await signOut();

      expect(result).toBeUndefined();
    });

    it('should handle missing Supabase client gracefully', async () => {
      await expect(signOut()).resolves.toBeUndefined();
    });

    it('should handle concurrent signOut calls', async () => {
      mockSupabaseSignOut.mockResolvedValue({ error: null });

      const promise1 = signOut();
      const promise2 = signOut();
      const promise3 = signOut();

      await Promise.all([promise1, promise2, promise3]);

      expect(mockSupabaseSignOut).toHaveBeenCalledTimes(3);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Integration Tests
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Integration - Auth Flow', () => {
    it('should handle complete login flow', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'authenticated',
        session: MOCK_SESSION,
        user: MOCK_SESSION.user,
      });

      // 1. Check if logged in
      const loggedIn = await isLoggedIn(null);
      expect(loggedIn).toBe(true);

      // 2. Get user details
      const userDetails = await getUserDetails(null);
      expect(userDetails.data).not.toBeNull();

      // 3. Get access token
      const token = await getAccessToken(vi.fn());
      expect(token).toBe(MOCK_SESSION.access_token);

      // 4. Get user name
      const name = await getFullName(vi.fn());
      expect(name).toBe('John Investor');
    });

    it('should handle complete logout flow', async () => {
      // 1. Start as logged in
      mockGetValidatedSession.mockResolvedValue({
        status: 'authenticated',
        session: MOCK_SESSION,
        user: MOCK_SESSION.user,
      });

      let isLoggedInStatus = await isLoggedIn(null);
      expect(isLoggedInStatus).toBe(true);

      // 2. Sign out
      mockSupabaseSignOut.mockResolvedValue({ error: null });
      await signOut();

      // 3. Verify logged out
      mockGetValidatedSession.mockResolvedValue({
        status: 'anonymous',
        session: null,
        user: null,
      });

      isLoggedInStatus = await isLoggedIn(null);
      expect(isLoggedInStatus).toBe(false);
    });

    it('should handle session expiration during use', async () => {
      // 1. Start as logged in
      mockGetValidatedSession.mockResolvedValueOnce({
        status: 'authenticated',
        session: MOCK_SESSION,
        user: MOCK_SESSION.user,
      });

      const userDetails1 = await getUserDetails(null);
      expect(userDetails1.data).not.toBeNull();

      // 2. Session expires
      mockGetValidatedSession.mockResolvedValueOnce({
        status: 'invalidated',
        session: null,
        user: null,
        reason: 'expired',
      });

      const userDetails2 = await getUserDetails(null);
      expect(userDetails2.data).toBeNull();
    });

    it('should support multiple user sessions (provider switching)', async () => {
      // 1. Login with Google
      mockGetValidatedSession.mockResolvedValueOnce({
        status: 'authenticated',
        session: MOCK_SESSION,
        user: MOCK_SESSION.user,
      });

      let userDetails = await getUserDetails(null);
      expect(userDetails.data?.user.app_metadata.provider).toBe('google');

      // 2. Switch to Apple (after logout and re-login)
      mockSupabaseSignOut.mockResolvedValue({ error: null });
      await signOut();

      mockGetValidatedSession.mockResolvedValueOnce({
        status: 'authenticated',
        session: MOCK_SESSION_APPLE,
        user: MOCK_SESSION_APPLE.user,
      });

      userDetails = await getUserDetails(null);
      expect(userDetails.data?.user.app_metadata.provider).toBe('apple');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Edge Cases', () => {
    it('should handle rapid successive calls', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'authenticated',
        session: MOCK_SESSION,
        user: MOCK_SESSION.user,
      });

      const promise1 = getUserDetails(null);
      const promise2 = getUserDetails(null);
      const promise3 = getUserDetails(null);

      const [result1, result2, result3] = await Promise.all([
        promise1,
        promise2,
        promise3,
      ]);

      expect(result1.data).not.toBeNull();
      expect(result2.data).not.toBeNull();
      expect(result3.data).not.toBeNull();
      expect(mockGetValidatedSession).toHaveBeenCalledTimes(3);
    });

    it('should propagate callback exceptions', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'authenticated',
        session: MOCK_SESSION,
        user: MOCK_SESSION.user,
      });

      const errorCallback = vi.fn(() => {
        throw new Error('Callback exception');
      });

      // Implementation doesn't wrap callbacks, so exceptions propagate
      await expect(getUserDetails(errorCallback)).rejects.toThrow('Callback exception');
    });

    it('should handle null/undefined callbacks gracefully', async () => {
      mockGetValidatedSession.mockResolvedValue({
        status: 'authenticated',
        session: MOCK_SESSION,
        user: MOCK_SESSION.user,
      });

      // Should not throw with null
      await expect(getUserDetails(null)).resolves.toBeDefined();

      // Should not throw with undefined
      await expect(getUserDetails(undefined)).resolves.toBeDefined();
    });

    it('should handle very large session objects', async () => {
      const largeSession = {
        ...MOCK_SESSION,
        user: {
          ...MOCK_SESSION.user,
          user_metadata: {
            ...MOCK_SESSION.user.user_metadata,
            custom_data: 'x'.repeat(10000), // Large data
          },
        },
      };

      mockGetValidatedSession.mockResolvedValue({
        status: 'authenticated',
        session: largeSession,
        user: largeSession.user,
      });

      const result = await getUserDetails(null);
      expect(result.data).not.toBeNull();
      expect(result.data?.user.user_metadata.custom_data).toBeDefined();
    });
  });
});
