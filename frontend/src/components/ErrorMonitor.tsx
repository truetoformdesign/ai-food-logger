import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, RefreshCw } from 'lucide-react';

interface ErrorStats {
  total: number;
  errors: number;
  warnings: number;
  info: number;
}

interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  component?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
}

interface ErrorMonitorData {
  stats: ErrorStats;
  recentErrors: ErrorLog[];
  timestamp: string;
}

const ErrorMonitor: React.FC = () => {
  const [data, setData] = useState<ErrorMonitorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchErrorData = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/logs/errors`);
      if (response.ok) {
        const errorData = await response.json();
        setData(errorData);
      }
    } catch (error) {
      console.error('Failed to fetch error data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrorData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchErrorData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (!data) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Error Monitor</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchErrorData}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            Auto-refresh
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{data.stats.total}</div>
          <div className="text-sm text-gray-600">Total Logs</div>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{data.stats.errors}</div>
          <div className="text-sm text-red-600">Errors</div>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{data.stats.warnings}</div>
          <div className="text-sm text-yellow-600">Warnings</div>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{data.stats.info}</div>
          <div className="text-sm text-blue-600">Info</div>
        </div>
      </div>

      {/* Recent Errors */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Errors</h3>
          <p className="text-sm text-gray-600">Last updated: {new Date(data.timestamp).toLocaleString()}</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {data.recentErrors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p>No recent errors</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {data.recentErrors.map((error, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    {getLevelIcon(error.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {error.message}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                        {error.component && (
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            {error.component}
                          </span>
                        )}
                        {error.requestId && (
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            {error.requestId}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded ${getLevelColor(error.level)}`}>
                          {error.level}
                        </span>
                      </div>
                      {error.stack && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            Show stack trace
                          </summary>
                          <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                            {error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMonitor;

