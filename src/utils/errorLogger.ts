// Server-side error logging utility
import fs from 'fs';
import path from 'path';

export interface ServerErrorLog {
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  component?: string;
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

export interface ClientErrorLog {
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  component?: string;
  userAgent: string;
  url: string;
}

class ServerErrorLogger {
  private logs: ServerErrorLog[] = [];
  private maxLogs = 1000;
  private logFile = path.join(__dirname, '../logs/errors.json');

  constructor() {
    // Ensure logs directory exists
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  log(level: 'error' | 'warning' | 'info', message: string, component?: string, stack?: string, requestId?: string, ip?: string, userAgent?: string) {
    const errorLog: ServerErrorLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      stack,
      component,
      requestId,
      ip,
      userAgent,
    };

    this.logs.push(errorLog);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console for development
    console[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log'](
      `[${new Date().toISOString()}] [${component || 'Server'}] ${message}`,
      stack ? { stack } : ''
    );

    // Save to file
    this.saveToFile();
  }

  logClientErrors(clientLogs: ClientErrorLog[], sessionId: string, ip?: string) {
    clientLogs.forEach(log => {
      this.log(
        log.level,
        `[CLIENT] ${log.message}`,
        log.component || 'Client',
        log.stack,
        sessionId,
        ip,
        log.userAgent
      );
    });
  }

  getLogs(): ServerErrorLog[] {
    return [...this.logs];
  }

  getRecentErrors(minutes: number = 60): ServerErrorLog[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.logs.filter(log => new Date(log.timestamp) > cutoff);
  }

  getErrorStats(): { total: number; errors: number; warnings: number; info: number } {
    return {
      total: this.logs.length,
      errors: this.logs.filter(log => log.level === 'error').length,
      warnings: this.logs.filter(log => log.level === 'warning').length,
      info: this.logs.filter(log => log.level === 'info').length,
    };
  }

  private saveToFile() {
    try {
      fs.writeFileSync(this.logFile, JSON.stringify(this.logs, null, 2));
    } catch (error) {
      console.error('Failed to save error logs to file:', error);
    }
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(this.logFile)) {
        const data = fs.readFileSync(this.logFile, 'utf8');
        this.logs = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load error logs from file:', error);
    }
  }
}

export const serverErrorLogger = new ServerErrorLogger();

