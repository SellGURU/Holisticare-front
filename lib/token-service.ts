/**
 * Token Service
 *
 * Provides secure methods for storing, retrieving, and managing authentication tokens.
 */

// Constants
const TOKEN_KEY = 'access_token';
const TOKEN_TYPE_KEY = 'token_type';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

/**
 * Get the access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get the token type
 */
export function getTokenType(): string {
  if (typeof window === 'undefined') return 'Bearer';
  return localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer';
}

/**
 * Get the refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if the token is expired
 */
export function isTokenExpired(): boolean {
  if (typeof window === 'undefined') return true;

  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryStr) return false; // If no expiry time is set, assume token is valid

  const expiryTime = Number.parseInt(expiryStr, 10);
  return Date.now() > expiryTime;
}

/**
 * Get the full authorization header
 */
export function getAuthorizationHeader(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  const tokenType = getTokenType();
  return `${tokenType} ${token}`;
}

/**
 * Attempt to refresh the access token
 * Returns true if successful, false otherwise
 */
export async function refreshAccessToken(): Promise<boolean> {
  // Skip refresh if no refresh token is available
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.log('No refresh token available, skipping token refresh');
    return false;
  }

  try {
    console.log('Attempting to refresh access token...');

    const response = await fetch(
      'https://vercel-landing-kappa.vercel.app/landing_2/api/auth/refresh',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      },
    );

    if (!response.ok) {
      console.error(`Token refresh failed with status: ${response.status}`);
      return false;
    }

    const data = await response.json();
    if (data.access_token) {
      console.log('Token refresh successful');

      // Store the new tokens
      localStorage.setItem(TOKEN_KEY, data.access_token);
      if (data.token_type) {
        localStorage.setItem(TOKEN_TYPE_KEY, data.token_type);
      }
      if (data.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
      }
      if (data.expires_in) {
        const expiryTime = Date.now() + data.expires_in * 1000;
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      }

      return true;
    }

    console.error('No access token in refresh response');
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

/**
 * Clear all tokens (logout)
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_TYPE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}
