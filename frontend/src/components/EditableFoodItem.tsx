import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Save, X, Trash2 } from 'lucide-react';
import { FoodItem } from '../types';
import toast from 'react-hot-toast';

interface EditableFoodItemProps {
  item: FoodItem;
  index: number;
  onUpdate: (index: number, updatedItem: FoodItem) => void;
  onDelete: (index: number) => void;
}

const EditableFoodItem: React.FC<EditableFoodItemProps> = ({
  item,
  index,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: item.name,
    estimatedCalories: item.estimatedCalories,
    quantity: item.quantity || 1,
    unit: item.unit || 'serving',
    description: item.description || '',
    context: item.context || ''
  });

  const handleSave = () => {
    if (!editData.name.trim()) {
      toast.error('Please enter a food name', { icon: '❌' });
      return;
    }

    if (editData.estimatedCalories < 0) {
      toast.error('Calories must be a positive number', { icon: '❌' });
      return;
    }

    const updatedItem: FoodItem = {
      ...item,
      name: editData.name.trim(),
      estimatedCalories: editData.estimatedCalories,
      quantity: editData.quantity,
      unit: editData.unit,
      description: editData.description.trim(),
      context: editData.context.trim() || null
    };

    onUpdate(index, updatedItem);
    setIsEditing(false);
    toast.success('Item updated successfully!', { icon: '✅' });
  };

  const handleCancel = () => {
    setEditData({
      name: item.name,
      estimatedCalories: item.estimatedCalories,
      quantity: item.quantity || 1,
      unit: item.unit || 'serving',
      description: item.description || '',
      context: item.context || ''
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      onDelete(index);
      toast.success('Item deleted', { icon: '🗑️' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-gray-200"
    >
      {isEditing ? (
        // Edit Mode
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Edit Item</h4>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Food Name
              </label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter food name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Calories
              </label>
              <input
                type="number"
                value={editData.estimatedCalories}
                onChange={(e) => setEditData(prev => ({ ...prev, estimatedCalories: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={editData.quantity}
                onChange={(e) => setEditData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={editData.unit}
                onChange={(e) => setEditData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="serving">serving</option>
                <option value="piece">piece</option>
                <option value="cup">cup</option>
                <option value="slice">slice</option>
                <option value="gram">gram</option>
                <option value="ml">ml</option>
                <option value="pint">pint</option>
                <option value="item">item</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional details"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Source/Context (optional)
            </label>
            <input
              type="text"
              value={editData.context}
              onChange={(e) => setEditData(prev => ({ ...prev, context: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., from McDonald's, homemade"
            />
          </div>
        </div>
      ) : (
        // Display Mode
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold text-gray-900 text-lg">{item.name}</h4>
              {item.brand && (
                <span 
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-white"
                  style={{ backgroundColor: item.brand.color }}
                >
                  <span className="mr-1">{item.brand.icon}</span>
                  {item.brand.name}
                </span>
              )}
              {item.quantity && item.unit && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {item.quantity} {item.unit}
                </span>
              )}
            </div>
            
            {item.description && (
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
            )}
            
            {item.context && (
              <div className="flex items-center space-x-1 mb-2">
                <span className="text-xs text-gray-500">from</span>
                <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                  {item.context}
                </span>
              </div>
            )}

            {/* Inline Health Insights for this item */}
            {item.insights && item.insights.length > 0 && (
              <div className="mt-3 space-y-1">
                {item.insights.map((insight, insightIndex) => (
                  <div
                    key={insightIndex}
                    className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs ${
                      insight.type === 'warning' 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : insight.type === 'positive'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    <span>{insight.icon}</span>
                    <span className="font-medium">{insight.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3 ml-4">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {item.estimatedCalories}
              </div>
              <div className="text-xs text-gray-500">calories</div>
            </div>
            
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Edit item"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EditableFoodItem;
