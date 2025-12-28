import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Plus, Edit2, Trash2, Tag, Palette, Lock } from 'lucide-react';
import { categoryService } from '../../api/services/categoryService';
import { Category } from '../../types';
import { toast } from 'sonner';
import { CATEGORY_COLORS, getCategoryColor } from '../../lib/categoryColors';
import { CATEGORY_ICONS, getIconByName } from '../../lib/categoryIcons';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

export function CategoryManagementSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    icon: 'tag',
    color: '#6366f1',
    is_fixed: false,
    spending_role: 'need' as 'need' | 'want' | 'save',
    budget_weight: 0.5,
    budget_min_pct: undefined as number | undefined,
    budget_max_pct: undefined as number | undefined
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', icon: 'tag', color: '#6366f1', is_fixed: false, spending_role: 'need', budget_weight: 0.5, budget_min_pct: undefined, budget_max_pct: undefined });
    setShowFormModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon || 'tag',
      color: category.color || '#6366f1',
      is_fixed: category.is_fixed || false,
      spending_role: category.spending_role || 'need',
      budget_weight: category.budget_weight ?? 0.5,
      budget_min_pct: category.budget_min_pct,
      budget_max_pct: category.budget_max_pct
    });
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      icon: '',
      color: '#6366f1',
      is_fixed: false,
      spending_role: 'need',
      budget_weight: 0.5,
      budget_min_pct: undefined,
      budget_max_pct: undefined
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setFormLoading(true);

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
        setCategories(prev => 
          prev.map(cat => cat.id === editingCategory.id ? { ...cat, ...formData } : cat)
        );
        toast.success('Category updated successfully');
      } else {
        const newCategory = await categoryService.createCategory(formData) as Category;
        setCategories(prev => [...prev, newCategory]);
        toast.success('Category created successfully');
      }
      closeFormModal();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Failed to ${editingCategory ? 'update' : 'create'} category`;
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (categoryId: number) => {
    try {
      await categoryService.deleteCategory(categoryId);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      setDeleteConfirm(null);
      toast.success('Category deleted successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete category';
      toast.error(errorMessage);
      setDeleteConfirm(null);
    }
  };

  // All categories are now editable - no system vs custom distinction

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Categories
              </CardTitle>
              <CardDescription>
                Manage expense categories for better organization
              </CardDescription>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {categories.length} total
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Category Button */}
          <Button
            onClick={openCreateModal}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Category
          </Button>

          {/* Categories List */}
          <div className="space-y-2">
            {categories.map(category => {
              const isDeleting = deleteConfirm === category.id;
              const categoryColor = getCategoryColor(category);
              const IconComponent = getIconByName(category.icon);
              
              // Helper to convert hex to rgba (matching BudgetManager)
              const hexToRgba = (hex: string, alpha: number) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
              };
              
              return (
                <div
                  key={category.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                    isDeleting 
                      ? 'border-destructive bg-destructive/10' 
                      : 'bg-background hover:border-primary/50'
                  }`}
                >
                  <div 
                    className="flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0"
                    style={{ 
                      backgroundColor: hexToRgba(categoryColor, 0.2),
                      color: categoryColor
                    }}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <p className="font-medium">{category.name}</p>
                    {category.is_fixed ? <Lock className="h-3 w-3 text-muted-foreground" /> : null}
                  </div>
                  
                  {isDeleting ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(category.id)}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(category)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirm(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Empty State */}
            {categories.length === 0 && !loading && (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Tag className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-muted-foreground">No categories yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Create your first category to get started</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                    <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
                    <div className="flex-1">
                      <div className="mb-2 h-4 w-24 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Form Modal */}
      <Dialog open={showFormModal} onOpenChange={closeFormModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update the category details' : 'Add a new category for organizing expenses'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Groceries, Rent, etc."
                  disabled={formLoading}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label htmlFor="is-fixed">Fixed Expense</Label>
                  <p className="text-[0.8rem] text-muted-foreground">
                    Mark as a mandatory monthly bill (e.g., Rent, Insurance).
                  </p>
                </div>
                <Switch
                  id="is-fixed"
                  checked={formData.is_fixed}
                  onCheckedChange={(checked: any) => setFormData(prev => ({ ...prev, is_fixed: checked }))}
                  disabled={formLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Spending Role</Label>
                <Select
                  value={formData.spending_role}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, spending_role: value }))}
                  disabled={formLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select spending role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="need">Need</SelectItem>
                    <SelectItem value="want">Want</SelectItem>
                    <SelectItem value="save">Save</SelectItem>
                  </SelectContent>
                </Select>
                </div>
 
                <div className="space-y-2">
                  <Label htmlFor="budget-weight">Budget Priority Weight</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        id="budget-weight"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={formData.budget_weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget_weight: parseFloat(e.target.value) }))}
                        disabled={formLoading}
                        className="flex-1 h-2 bg-slate-100 rounded-lg accent-primary"
                      />
                      <span className="text-sm font-semibold text-primary min-w-[3rem] text-right">
                        {(formData.budget_weight * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-xs text-muted-foreground">
                      <div className="text-left">Low (0%)</div>
                      <div className="text-center">↓</div>
                      <div className="text-center font-medium">Medium (50%)</div>
                      <div className="text-center">↑</div>
                      <div className="text-right">High (100%)</div>
                    </div>
                    <p className="text-xs text-muted-foreground rounded-lg bg-slate-50 p-2">
                      Higher weight means this category gets a larger share within its spending role bucket.
                      Use this for essential categories (groceries, housing) vs. discretionary ones (subscriptions, entertainment).
                    </p>
                  </div>
                </div>
 
                <div className="space-y-2">
                  <Label htmlFor="budget-min-pct">Minimum % of Bucket (Optional)</Label>
                  <Input
                    id="budget-min-pct"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.budget_min_pct !== undefined ? formData.budget_min_pct * 100 : ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      budget_min_pct: e.target.value ? parseFloat(e.target.value) / 100 : undefined
                    }))}
                    placeholder="e.g., 15 for 15% minimum"
                    disabled={formLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ensure this category gets at least this % of its spending role budget
                  </p>
                </div>
 
                <div className="space-y-2">
                  <Label htmlFor="budget-max-pct">Maximum % of Bucket (Optional)</Label>
                  <Input
                    id="budget-max-pct"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.budget_max_pct !== undefined ? formData.budget_max_pct * 100 : ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      budget_max_pct: e.target.value ? parseFloat(e.target.value) / 100 : undefined
                    }))}
                    placeholder="e.g., 5 for 5% maximum"
                    disabled={formLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Prevent this category from exceeding this % of its spending role budget
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Icon</Label>
                <div className="max-h-48 overflow-y-auto rounded-lg border bg-muted/50 p-3">
                  <div className="grid grid-cols-8 gap-2">
                    {CATEGORY_ICONS.map((iconDef) => {
                      const IconComponent = iconDef.icon;
                      const isSelected = formData.icon === iconDef.name;
                      return (
                        <button
                          key={iconDef.name}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, icon: iconDef.name }))}
                          className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10 scale-110'
                              : 'border-transparent hover:bg-accent hover:scale-105'
                          }`}
                          title={iconDef.label}
                          disabled={formLoading}
                        >
                          <IconComponent className="h-5 w-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {CATEGORY_ICONS.find(i => i.name === formData.icon)?.label || 'Tag'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className={`h-10 w-full rounded-lg border-2 transition-all ${
                        formData.color === color.value
                          ? 'border-primary ring-2 ring-primary/20 scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                      disabled={formLoading}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {CATEGORY_COLORS.find(c => c.value === formData.color)?.name || 'Custom'}
                </p>
              </div>
            </div>
            <DialogFooter className="sticky bottom-0 bg-white pt-4 mt-4 border-t">
              <Button type="button" variant="outline" onClick={closeFormModal} disabled={formLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {editingCategory ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{editingCategory ? 'Update' : 'Create'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
