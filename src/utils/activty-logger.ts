/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/ActivityLogger.ts
import { v4 as uuidv4 } from 'uuid';
import Log from '../api/Log';

export default class ActivityLogger {
  private static instance: ActivityLogger;
  private sessionId: string;
  private userId: string | null;
  private events: any[] = [];
  private sessionStartTime: number;
  private intervalId: NodeJS.Timeout | null = null;
  private resetIntervalMs = 2 * 60 * 1000;
  private unloadHandler: (() => void) | null = null;
  private pageHideHandler: ((e: PageTransitionEvent) => void) | null = null;

  private constructor() {
    this.userId = null; // Will be set asynchronously
    this.sessionId = uuidv4();
    this.sessionStartTime = Date.now();
    this.init();
    // Initialize browser ID asynchronously
    this.initializeBrowserId();
  }

  /** Initialize browser ID asynchronously */
  private async initializeBrowserId() {
    this.userId = await this.getOrCreateBrowserId();
  }

  /** Get or create a unique browser ID */
  private async getOrCreateBrowserId(): Promise<string> {
    const BROWSER_ID_KEY = 'browser_unique_id';
    let browserId = localStorage.getItem(BROWSER_ID_KEY);

    if (!browserId) {
      // Get user email from localStorage
      const email = localStorage.getItem('email') || '';

      // Try to get user data from localStorage (for auth context)
      let userName = '';
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          userName = user?.name || user?.email || user?.username || '';
        }
      } catch {
        // Ignore parse errors
      }

      // Try to get Chrome account name from Credential Management API
      const chromeAccountName = await this.getChromeAccountName();

      // Get system/platform information
      const platform = this.getSystemInfo();

      // Get a short unique ID (first 8 characters of UUID)
      const shortId = uuidv4().substring(0, 8);

      // Build readable browser ID
      const parts: string[] = [];

      // Priority: Chrome account name > email > user name
      const userIdentifier = chromeAccountName || email || userName;
      if (userIdentifier) {
        // Remove @ and domain for shorter ID, or use first part of email
        const identifierPart = userIdentifier.includes('@')
          ? userIdentifier.split('@')[0]
          : userIdentifier;
        // Clean identifier: remove special characters, keep only alphanumeric and dots/dashes
        const cleanIdentifier = identifierPart
          .replace(/[^a-zA-Z0-9._-]/g, '')
          .slice(0, 30);
        if (cleanIdentifier) {
          parts.push(cleanIdentifier);
        }
      }

      // Add platform name
      parts.push(platform);

      // Add short unique ID
      parts.push(shortId);

      browserId = parts.join('-');
      localStorage.setItem(BROWSER_ID_KEY, browserId);
    }

    return browserId;
  }

  /** Try to get Chrome account name from Credential Management API or Google services */
  private async getChromeAccountName(): Promise<string> {
    try {
      // Method 1: Try Credential Management API (if user has saved credentials)
      if (
        'credentials' in navigator &&
        'get' in (navigator as any).credentials
      ) {
        try {
          const cred = await (navigator.credentials as any).get({
            password: true,
            mediation: 'silent' as any,
          });
          if (cred && (cred as any).id) {
            const accountId = (cred as any).id;
            // If it looks like an email, return it
            if (accountId.includes('@')) {
              return accountId;
            }
          }
        } catch {
          // Credential API not available or user denied
        }
      }

      // Method 2: Try to get from Chrome's stored Google accounts
      // Note: This only works if user has granted permission via Google OAuth
      // Check if there's a Google OAuth token in localStorage
      const googleToken =
        localStorage.getItem('google_oauth_token') ||
        sessionStorage.getItem('google_oauth_token');

      if (googleToken) {
        try {
          const response = await fetch(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            {
              headers: {
                Authorization: `Bearer ${googleToken}`,
              },
            },
          );
          if (response.ok) {
            const userInfo = await response.json();
            return userInfo.name || userInfo.email || '';
          }
        } catch {
          // API call failed
        }
      }

      // Method 3: Check if user info is stored from Google login (from AuthWithGoogle component)
      // This would be in localStorage if user logged in with Google
      try {
        const googleUserData = localStorage.getItem('google_user_data');
        if (googleUserData) {
          const userData = JSON.parse(googleUserData);
          return userData.name || userData.email || '';
        }
      } catch {
        // No stored Google data
      }

      // Method 4: Try to detect Chrome profile name from user agent or other browser APIs
      // Note: This is limited due to privacy restrictions
      // Chrome sometimes includes profile info in user agent, but this is unreliable
      // Direct access to Chrome profile name is not available via web APIs for security reasons
    } catch (error) {
      // Silently fail - this is not critical
      console.debug('Could not get Chrome account name:', error);
    }

    return '';
  }

  /** Get system/platform information */
  private getSystemInfo(): string {
    const ua = navigator.userAgent;

    // Try to get platform from userAgentData (modern browsers)
    const platform = (navigator as any).userAgentData?.platform;
    if (platform) {
      return platform.toLowerCase().replace(/\s+/g, '-');
    }

    // Fallback to parsing userAgent
    const osMatch = ua.match(
      /(Windows NT|Macintosh|Linux|Android|iOS|iPhone|iPad)/i,
    );
    if (osMatch) {
      let os = osMatch[0].toLowerCase();
      // Normalize Windows versions
      if (os.includes('windows')) {
        const winVersion = ua.match(/Windows NT (\d+\.\d+)/);
        if (winVersion) {
          const version = parseFloat(winVersion[1]);
          if (version >= 10) os = 'windows-10';
          else if (version >= 6.3) os = 'windows-8.1';
          else if (version >= 6.2) os = 'windows-8';
          else if (version >= 6.1) os = 'windows-7';
          else os = 'windows';
        }
      }
      return os.replace(/\s+/g, '-');
    }

    return 'unknown-platform';
  }

  public static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger();
    }
    return ActivityLogger.instance;
  }

  /** Initialize listeners + schedule resets */
  private init() {
    this.addEvent('session_start', { path: window.location.pathname });
    this.attachGlobalListeners();
    this.attachUnloadListeners();
    this.scheduleReset();
  }

  /** Auto-save session every few minutes */
  private scheduleReset() {
    this.intervalId = setInterval(() => {
      this.saveSessionToStorage();
      this.resetSession();
    }, this.resetIntervalMs);
  }

  /** Attach global event listeners */
  private attachGlobalListeners() {
    // Navigation
    window.addEventListener('popstate', () =>
      this.addEvent('page_view', {
        path: window.location.pathname,
        title: document.title,
      }),
    );

    // Clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      this.addEvent('click', {
        element: this.getElementSelector(target),
        text: target.innerText?.slice(0, 50),
        route: window.location.pathname, // ✅ add route to click event
      });
    });

    // JS Errors
    window.addEventListener('error', (e) => {
      this.addEvent('error', {
        message: e.message,
        source: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        route: window.location.pathname, // ✅ route awareness
      });
    });

    // Form Submissions
    document.addEventListener('submit', (e) => {
      const target = e.target as HTMLFormElement;
      if (!target?.id) return;
      this.addEvent('form_submit', {
        formId: target.id,
        status: 'submitted',
        route: window.location.pathname,
      });
    });
  }

  /** Attach unload listeners to save data when tab closes (not when switching tabs) */
  private attachUnloadListeners() {
    // Save on before unload (tab/window closing)
    this.unloadHandler = () => {
      this.addEvent('session_end', { reason: 'tab_close' });
      this.saveSessionToStorageSync();
    };
    window.addEventListener('beforeunload', this.unloadHandler);

    // Save on page hide - only when page is being unloaded (tab closing)
    // persisted property indicates if page is being cached (false = tab closing)
    this.pageHideHandler = (e: PageTransitionEvent) => {
      // Only save if page is not being cached (i.e., tab is actually closing)
      if (!e.persisted) {
        this.addEvent('session_end', { reason: 'page_hide' });
        this.saveSessionToStorageSync();
      }
    };
    window.addEventListener('pagehide', this.pageHideHandler);
  }

  /** Save session data synchronously (used during page unload) */
  private saveSessionToStorageSync() {
    const data = this.buildSessionData();

    // Use Log.saveLog (axios-based) for normal operation
    // Since axios may not work reliably during unload, we also try fetch with keepalive as fallback
    Log.saveLog(data).catch(() => {
      // If axios fails, try fetch with keepalive for unload scenarios
      try {
        const baseUrl =
          'https://vercel-backend-one-roan.vercel.app/holisticare_test';
        const endpoint = '/marketing/session';
        const url = baseUrl + endpoint;
        const token = localStorage.getItem('token') || '';

        fetch(url, {
          method: 'POST',
          body: JSON.stringify({ session_data: data }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          keepalive: true, // Critical: allows request to complete after page unload
        }).catch(() => {
          // Silent fail - data will be saved to localStorage as backup
        });
      } catch {
        // Last resort: save to localStorage for later sync
        localStorage.setItem('activity_log_pending', JSON.stringify(data));
      }
    });

    // Always save to localStorage as backup
    localStorage.setItem('activity_log', JSON.stringify(data));
  }

  /** Log generic events */
  public addEvent(eventName: string, props: Record<string, any> = {}) {
    const event = {
      id: uuidv4(),
      eventName,
      timestamp: new Date().toISOString(),
      props,
    };
    this.events.push(event);
    this.saveToLocalStorage();
  }

  /** ✅ Dedicated method for logging API calls */

  public logApiEvent(data: {
    endpoint: string;
    method: string;
    status: number;
    message: string;
    durationMs: number;
    route: string;
    payload?: any;
  }) {
    this.addEvent('api_error', {
      ...data,
    });
  }

  /** Utility: Build CSS selector */
  private getElementSelector(el: HTMLElement): string {
    const id = el.id ? `#${el.id}` : '';
    const cls = el.className
      ? `.${el.className.toString().replace(/\s+/g, '.')}`
      : '';
    return `${el.tagName.toLowerCase()}${id}${cls}`;
  }

  /** Build a snapshot of current session */
  private buildSessionData() {
    const now = Date.now();
    // If userId is not yet initialized, use a fallback
    const userId = this.userId || this.getFallbackUserId();
    return {
      sessionId: this.sessionId,
      userId: userId,
      startedAt: new Date(this.sessionStartTime).toISOString(),
      endedAt: new Date(now).toISOString(),
      totalActiveTimeMs: now - this.sessionStartTime,
      userAgent: this.getUserAgent(),
      events: this.events,
    };
  }

  /** Get fallback user ID if async initialization hasn't completed */
  private getFallbackUserId(): string {
    // Try to get from localStorage first
    const stored = localStorage.getItem('browser_unique_id');
    if (stored) return stored;

    // Otherwise create a temporary ID
    const email = localStorage.getItem('email') || '';
    const platform = this.getSystemInfo();
    const shortId = uuidv4().substring(0, 8);
    const parts: string[] = [];

    if (email) {
      const emailPart = email.includes('@') ? email.split('@')[0] : email;
      const cleanEmail = emailPart.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 30);
      if (cleanEmail) parts.push(cleanEmail);
    }

    parts.push(platform);
    parts.push(shortId);
    return parts.join('-');
  }

  /** Save a live snapshot */
  private saveToLocalStorage() {
    localStorage.setItem(
      'activity_log',
      JSON.stringify(this.buildSessionData()),
    );
  }

  /** Capture device + OS info */
  private getUserAgent() {
    const ua = navigator.userAgent;
    const { width, height } = window.screen;
    const platform =
      (navigator as any).userAgentData?.platform ||
      ua.match(/Windows|Mac|Linux|Android|iOS/i)?.[0] ||
      'unknown';

    return {
      browser: ua.match(/(firefox|chrome|safari|edg)/i)?.[0] || 'unknown',
      os: platform,
      deviceType: /Mobi|Android/i.test(ua) ? 'mobile' : 'desktop',
      screen: { width, height },
    };
  }

  /** Reset current session (after autosave) */
  private resetSession() {
    this.events = [];
    this.sessionId = uuidv4();
    this.sessionStartTime = Date.now();
    this.saveToLocalStorage();
  }

  /** Save persistent copy before unload */
  private saveSessionToStorage() {
    const data = this.buildSessionData();
    console.log(data);
    Log.saveLog(data).catch(() => {});
    localStorage.setItem('activity_log', JSON.stringify(data));
  }

  /** Cleanup */
  public destroy() {
    if (this.intervalId) clearInterval(this.intervalId);

    // Remove unload listeners
    if (this.unloadHandler) {
      window.removeEventListener('beforeunload', this.unloadHandler);
    }
    if (this.pageHideHandler) {
      window.removeEventListener('pagehide', this.pageHideHandler);
    }

    this.addEvent('session_end', { reason: 'manual_destroy' });
    this.saveSessionToStorage();
  }
}
