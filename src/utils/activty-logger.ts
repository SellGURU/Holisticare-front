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
    this.userId = this.getOrCreateBrowserId();
    this.sessionId = uuidv4();
    this.sessionStartTime = Date.now();
    this.init();
  }

  /** Get or create a unique browser ID */
  private getOrCreateBrowserId(): string {
    const BROWSER_ID_KEY = 'browser_unique_id';
    let browserId = localStorage.getItem(BROWSER_ID_KEY);
    
    if (!browserId) {
      browserId = uuidv4();
      localStorage.setItem(BROWSER_ID_KEY, browserId);
    }
    
    return browserId;
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
        const baseUrl = 'https://vercel-backend-one-roan.vercel.app/holisticare_test';
        const endpoint = '/marketing/session';
        const url = baseUrl + endpoint;
        const token = localStorage.getItem('token') || '';
        
        fetch(url, {
          method: 'POST',
          body: JSON.stringify({ session_data: data }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
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
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startedAt: new Date(this.sessionStartTime).toISOString(),
      endedAt: new Date(now).toISOString(),
      totalActiveTimeMs: now - this.sessionStartTime,
      userAgent: this.getUserAgent(),
      events: this.events,
    };
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
