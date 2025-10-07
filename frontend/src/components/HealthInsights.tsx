import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { HealthInsight } from '../types';

interface HealthInsightsProps {
  insights: HealthInsight[];
  onDismiss?: (index: number) => void;
}

const HealthInsights: React.FC<HealthInsightsProps> = ({ insights, onDismiss }) => {
  if (!insights || insights.length === 0) {
    return null;
  }

  const getIcon = (type: string, icon: string) => {
    if (icon) return <span className="text-lg">{icon}</span>;
    
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'positive':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="space-y-2">
      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-3 rounded-lg border ${getTypeStyles(insight.type)}`}
        >
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(insight.type, insight.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium">{insight.title}</h4>
              <p className="text-xs mt-1">{insight.message}</p>
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(index)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default HealthInsights;

