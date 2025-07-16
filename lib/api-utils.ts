/**
 * Utility functions for API interactions, especially authentication.
 */

// Token cache to prevent multiple fetches
let cachedAuthHeader: string | null = null
let lastCacheTime = 0
const CACHE_DURATION = 60000 // 1 minute cache

/**
 * Parse JWT token to get payload
 * @param token JWT token
 * @returns Decoded payload or null if invalid
 */
export function parseJwt(token: string): any {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error("Error parsing JWT:", e)
    return null
  }
}

/**
 * Get the access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token") || null
}

/**
 * Get the token type from localStorage
 */
export function getTokenType(): string {
  if (typeof window === "undefined") return "Bearer"
  return localStorage.getItem("token_type") || "Bearer"
}

/**
 * Get the authorization header with caching to prevent multiple requests
 */
export function getAuthorizationHeader(): string | null {
  // Return cached header if it exists and is still valid
  const now = Date.now()
  if (cachedAuthHeader && now - lastCacheTime < CACHE_DURATION) {
    return cachedAuthHeader
  }

  // If no cached header or cache expired, generate a new one
  const token = getAccessToken()
  if (!token) return null

  // Try to get token type, default to Bearer
  const tokenType = localStorage.getItem("token_type") || "Bearer"

  // Ensure token has Bearer prefix
  const formattedToken = token.startsWith(tokenType) ? token : `${tokenType} ${token}`

  // Cache the result
  cachedAuthHeader = formattedToken
  lastCacheTime = now

  return formattedToken
}

/**
 * Check if the token is expired
 */
export function isTokenExpired(): boolean {
  const token = getAccessToken()
  if (!token) return true

  const payload = parseJwt(token)
  if (!payload || !payload.exp) return true

  const expiryTime = payload.exp * 1000 // Convert seconds to milliseconds
  return Date.now() >= expiryTime
}

/**
 * Clear all tokens from localStorage
 */
export function clearTokens(): void {
  localStorage.removeItem("access_token")
  localStorage.removeItem("token_type")
  localStorage.removeItem("refresh_token")
}

/**
 * Attempt to refresh the access token
 * Returns true if successful, false otherwise
 */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) return false

    const response = await fetch("https://vercel-landing-kappa.vercel.app/landing_2/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) return false

    const data = await response.json()
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("token_type", data.token_type || "Bearer")
      return true
    }

    return false
  } catch (error) {
    console.error("Token refresh failed:", error)
    return false
  }
}

/**
 * Validate a client ID before making API calls
 * @param clientId The client ID to validate
 * @returns Boolean indicating if the ID is valid
 */
export function isValidClientId(clientId: string | null | undefined): boolean {
  if (!clientId) return false

  // Add any additional validation logic here
  // For example, ensure it's not "undefined" or "null" as strings
  if (clientId === "undefined" || clientId === "null") return false

  return true
}
