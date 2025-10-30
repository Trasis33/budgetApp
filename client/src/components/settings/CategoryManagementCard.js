import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import axios from '../../api/axios';
import SettingsCard from './SettingsCard';
import CategoryFormModal from '../category/CategoryFormModal';
import { 
  resolveCategoryIcon, 
  formatUsageCount, 
  sortCategories, 
  isSystemCategory 
} from '../category/categoryUtils';

const CategoryManagementCard = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/categories');
      
      // Add usage count to categories (would need additional API call for real data)
      const categoriesWithUsage = response.data.map(category => ({
        ...category,
        usage_count: 0 // This would come from a real API endpoint
      }));
      
      setCategories(sortCategories(categoriesWithUsage));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage({ type: 'error', text: 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (formData) => {
    setFormLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/categories', formData);
      setCategories(prev => sortCategories([...prev, { ...response.data, usage_count: 0 }]));
      setShowFormModal(false);
      setMessage({ type: 'success', text: 'Category created successfully' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create category';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCategory = async (formData) => {
    setFormLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.put(`/categories/${editingCategory.id}`, formData);
      setCategories(prev => sortCategories(
        prev.map(cat => cat.id === editingCategory.id 
          ? { ...response.data, usage_count: cat.usage_count } 
          : cat
        )
      ));
      setShowFormModal(false);
      setEditingCategory(null);
      setMessage({ type: 'success', text: 'Category updated successfully' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update category';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`/categories/${categoryId}`);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      setDeleteConfirm(null);
      setMessage({ type: 'success', text: 'Category deleted successfully' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete category';
      setMessage({ type: 'error', text: errorMessage });
      setDeleteConfirm(null);
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingCategory(null);
  };

  const openDeleteConfirm = (category) => {
    setDeleteConfirm(category);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm(null);
  };

  const systemCategories = categories.filter(cat => isSystemCategory(cat.name));
  const customCategories = categories.filter(cat => !isSystemCategory(cat.name));

  return (
    <SettingsCard 
      title="Categories" 
      badge={
        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
          {categories.length} total
        </span>
      }
    >
      {/* Add Category Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowFormModal(true)}
          className="w-full bg-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Category
        </button>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm mb-4 ${
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

      {/* Categories List */}
      <div className="space-y-6">
        {/* System Categories */}
        {systemCategories.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              System Categories
            </h3>
            <div className="grid gap-3">
              {systemCategories.map(category => {
                const IconComponent = resolveCategoryIcon(category.icon);
                return (
                  <div
                    key={category.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <IconComponent className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{category.name}</p>
                      <p className="text-xs text-slate-600">{formatUsageCount(category.usage_count)}</p>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                      System
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Categories */}
        {customCategories.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              Custom Categories
            </h3>
            <div className="grid gap-3">
              {customCategories.map(category => {
                const IconComponent = resolveCategoryIcon(category.icon);
                const isDeleting = deleteConfirm?.id === category.id;
                
                return (
                  <div
                    key={category.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isDeleting 
                        ? 'bg-rose-50 border-rose-200' 
                        : 'bg-white border-slate-200 hover:border-emerald-200'
                    }`}
                  >
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                      <IconComponent className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{category.name}</p>
                      <p className="text-xs text-slate-600">{formatUsageCount(category.usage_count)}</p>
                    </div>
                    
                    {isDeleting ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-xs bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={closeDeleteConfirm}
                          className="text-xs bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(category)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete category"
                          disabled={category.usage_count > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {categories.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Tag className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">No categories yet</p>
            <p className="text-sm text-slate-500 mt-1">Create your first category to get started</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="bg-slate-200 w-9 h-9 rounded-lg animate-pulse" />
                <div className="flex-1">
                  <div className="bg-slate-200 h-4 rounded w-24 mb-2 animate-pulse" />
                  <div className="bg-slate-200 h-3 rounded w-16 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={showFormModal}
        onClose={closeFormModal}
        onSubmit={editingCategory ? handleEditCategory : handleCreateCategory}
        category={editingCategory}
        existingCategories={categories}
        loading={formLoading}
      />
    </SettingsCard>
  );
};

export default CategoryManagementCard;
