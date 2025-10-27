// utils/ActivityLogger.ts
import { v4 as uuidv4 } from 'uuid';

export default class ActivityLogger {
  private static instance: ActivityLogger;
  private sessionId: string;
  private userId: string | null;
  private events: any[] = [];
  private sessionStartTime: number;
  private intervalId: NodeJS.Timeout | null = null;
  private resetIntervalMs = 5 * 60 * 1000; // 5 minutes

  private constructor(userId?: string) {
    this.userId = userId || 'anonymous_user';
    this.sessionId = uuidv4();
    this.sessionStartTime = Date.now();
    this.init();
  }

  public static getInstance(userId?: string): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger(userId);
    }
    return ActivityLogger.instance;
  }

  /** Initialize listener and schedule reset */
  private init() {
    this.addEvent('session_start', { path: window.location.pathname });
    this.attachGlobalListeners();
    this.scheduleReset();
  }

  /** Automatically reset log every 5 minutes */
  private scheduleReset() {
    this.intervalId = setInterval(() => {
      this.saveSessionToStorage();
      this.resetSession();
    }, this.resetIntervalMs);
  }

  /** Attach event listeners */
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
      });
    });

    // Errors
    window.addEventListener('error', (e) => {
      this.addEvent('error', {
        message: e.message,
        source: e.filename,
        lineno: e.lineno,
        colno: e.colno,
      });
    });

    // Form submissions
    document.addEventListener('submit', (e) => {
      const target = e.target as HTMLFormElement;
      if (!target?.id) return;
      this.addEvent('form_submit', {
        formId: target.id,
        status: 'submitted',
      });
    });
  }

  /** Add a new activity event */
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

  /** Utility: build CSS selector for clicked element */
  private getElementSelector(el: HTMLElement): string {
    const id = el.id ? `#${el.id}` : '';
    const cls = el.className
      ? `.${el.className.toString().replace(/\s+/g, '.')}`
      : '';
    return `${el.tagName.toLowerCase()}${id}${cls}`;
  }

  /** Save temporary snapshot in localStorage */
  private saveToLocalStorage() {
    const data = this.buildSessionData();
    localStorage.setItem('activity_log', JSON.stringify(data));
  }

  /** Build full session JSON object */
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

  /** Capture userAgent info */
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

  /** Reset session every 5 minutes */
  private resetSession() {
    this.events = [];
    this.sessionId = uuidv4();
    this.sessionStartTime = Date.now();
    this.saveToLocalStorage();
  }

  /** Save to persistent storage (before refresh or unload) */
  private saveSessionToStorage() {
    const data = this.buildSessionData();
    localStorage.setItem('activity_log', JSON.stringify(data));
  }

  /** Clean up on destroy */
  public destroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.addEvent('session_end', { reason: 'manual_destroy' });
    this.saveSessionToStorage();
  }
}
