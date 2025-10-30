import React, { useState, useEffect } from 'react';
import { X, Tag, CheckCircle, AlertCircle } from 'lucide-react';
import { resolveCategoryIcon, validateCategoryName } from './categoryUtils';
import IconPickerModal from './IconPickerModal';

const CategoryFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  category = null, 
  existingCategories = [],
  loading = false 
}) => {
  const isEdit = Boolean(category);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'default'
  });
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: category?.name || '',
        icon: category?.icon || 'default'
      });
      setMessage({ type: '', text: '' });
    }
  }, [isOpen, category]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleIconSelect = (iconKey) => {
    setFormData(prev => ({
      ...prev,
      icon: iconKey
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate name
    const validation = validateCategoryName(formData.name, existingCategories);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.message });
      return;
    }

    onSubmit(formData);
  };

  const SelectedIcon = resolveCategoryIcon(formData.icon);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">
              {isEdit ? 'Edit Category' : 'Create New Category'}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-colors"
                placeholder="e.g., Coffee, Groceries, Entertainment"
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category Icon
              </label>
              <button
                type="button"
                onClick={() => setShowIconPicker(true)}
                className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
                disabled={loading}
              >
                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                  <SelectedIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900">Choose Icon</p>
                  <p className="text-xs text-slate-600">
                    {formData.icon.charAt(0).toUpperCase() + formData.icon.slice(1).replace(/([A-Z])/g, ' $1')}
                  </p>
                </div>
                <Tag className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Preview */}
            {formData.name && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-slate-600 mb-2">Preview:</p>
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <SelectedIcon className="w-5 h-5 text-slate-700" />
                  </div>
                  <span className="font-medium text-slate-900">{formData.name}</span>
                </div>
              </div>
            )}

            {/* Message Display */}
            {message.text && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                message.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                {message.text}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {isEdit ? 'Update Category' : 'Create Category'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Icon Picker Modal */}
      <IconPickerModal
        isOpen={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        onSelectIcon={handleIconSelect}
        selectedIcon={formData.icon}
      />
    </>
  );
};

export default CategoryFormModal;
