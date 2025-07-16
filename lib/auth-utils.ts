/**
 * Utility functions for authentication
 */

/**
 * Get the authentication token from various possible storage locations
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null

  // Try multiple possible token storage keys
  return (
    localStorage.getItem("access_token") || localStorage.getItem("token") || localStorage.getItem("auth_token") || null
  )
}

/**
 * Get the authorization header value for API requests
 */
export function getAuthHeader(): string | null {
  const token = getAuthToken()
  if (!token) return null

  // Try to get token type, default to Bearer
  const tokenType = localStorage.getItem("token_type") || "Bearer"
  const authHeader = `${tokenType} ${token}`

  console.log(`Using auth token type: ${tokenType}`)
  console.log(`Auth header created: ${authHeader.substring(0, 15)}...`)

  return authHeader
}

/**
 * Check if the user is authenticated (has a token)
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null
}

/**
 * Redirect to login page if not authenticated
 */
export function requireAuth(redirectPath = "/login"): boolean {
  if (!isAuthenticated() && typeof window !== "undefined") {
    window.location.href = `${redirectPath}?redirect=${encodeURIComponent(window.location.pathname)}`
    return false
  }
  return true
}
