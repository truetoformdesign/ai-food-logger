// Client-side error logging utility
export interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  component?: string;
  userAgent: string;
  url: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  log(level: 'error' | 'warning' | 'info', message: string, component?: string, stack?: string) {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      stack,
      component,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.logs.push(errorLog);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console for development
    if (level === 'error') {
      console.error(`[${component || 'App'}] ${message}`, stack ? { stack } : '');
    } else if (level === 'warning') {
      console.warn(`[${component || 'App'}] ${message}`, stack ? { stack } : '');
    } else {
      console.log(`[${component || 'App'}] ${message}`, stack ? { stack } : '');
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  // Send logs to server for monitoring
  async sendLogsToServer() {
    if (this.logs.length === 0) return;

    try {
      await fetch('http://localhost:3000/api/logs/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: this.logs,
          sessionId: this.getSessionId(),
        }),
      });
      
      // Clear logs after successful send
      this.clearLogs();
    } catch (error) {
      console.error('Failed to send logs to server:', error);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }
}

export const errorLogger = new ErrorLogger();

// Global error handler
window.addEventListener('error', (event) => {
  errorLogger.log('error', event.message, 'Global', event.error?.stack);
});

window.addEventListener('unhandledrejection', (event) => {
  errorLogger.log('error', `Unhandled Promise Rejection: ${event.reason}`, 'Global');
});

// Send logs to server every 30 seconds
setInterval(() => {
  errorLogger.sendLogsToServer();
}, 30000);
