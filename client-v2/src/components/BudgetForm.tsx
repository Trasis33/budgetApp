import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Check, CalendarIcon } from 'lucide-react';
import { Category } from '../types';
import { budgetService } from '../api/services/budgetService';
import { categoryService } from '../api/services/categoryService';
import { toast } from 'sonner';
import { getCategoryIconStyle } from '../lib/iconUtils';
import * as Icons from 'lucide-react';

// Simple icon mapping function
function getIconByName(iconName?: string) {
  const iconMap: Record<string, any> = {
    'shopping-cart': Icons.ShoppingCart,
    'shopping-bag': Icons.ShoppingBag,
    'utensils': Icons.Utensils,
    'coffee': Icons.Coffee,
    'pizza': Icons.Pizza,
    'apple': Icons.Apple,
    'home': Icons.Home,
    'bed': Icons.Bed,
    'sofa': Icons.Sofa,
    'lamp-desk': Icons.LampDesk,
    'box': Icons.Package,
    'armchair': Icons.Armchair,
    'car': Icons.Car,
    'bike': Icons.Bike,
    'bus': Icons.Bus,
    'plane': Icons.Plane,
    'train': Icons.Train,
    'ship': Icons.Ship,
    'fuel': Icons.Fuel,
    'film': Icons.Film,
    'tv': Icons.Tv,
    'gamepad': Icons.Gamepad2,
    'music': Icons.Music,
    'headphones': Icons.Headphones,
    'book': Icons.Book,
    'palette': Icons.Palette,
    'heart': Icons.Heart,
    'activity': Icons.Activity,
    'dumbbell': Icons.Dumbbell,
    'hospital': Icons.Hospital,
    'pill': Icons.Pill,
    'bolt': Icons.Zap,
    'droplet': Icons.Droplet,
    'flame': Icons.Flame,
    'wifi': Icons.Wifi,
    'smartphone': Icons.Smartphone,
    'mail': Icons.Mail,
    'credit-card': Icons.CreditCard,
    'wallet': Icons.Wallet,
    'banknote': Icons.Banknote,
    'piggy-bank': Icons.PiggyBank,
    'landmark': Icons.Landmark,
    'briefcase': Icons.Briefcase,
    'shirt': Icons.Shirt,
    'glasses': Icons.Glasses,
    'watch': Icons.Watch,
    'sparkles': Icons.Sparkles,
    'scissors': Icons.Scissors,
    'dog': Icons.Dog,
    'cat': Icons.Cat,
    'fish': Icons.Fish,
    'rabbit': Icons.Rabbit,
    'graduation-cap': Icons.GraduationCap,
    'book-open': Icons.BookOpen,
    'backpack': Icons.Backpack,
    'pencil': Icons.Pencil,
    'gift': Icons.Gift,
    'cake': Icons.Cake,
    'party-popper': Icons.PartyPopper,
    'heart-handshake': Icons.HeartHandshake,
    'tag': Icons.Tag,
    'star': Icons.Star,
    'circle': Icons.Circle,
    'more-horizontal': Icons.MoreHorizontal,
  };
  return iconMap[iconName || ''] || Icons.Tag;
}

interface BudgetFormProps {
  onCancel: () => void;
}

export function BudgetForm({ onCancel }: BudgetFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: budgetId } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingBudgets, setExistingBudgets] = useState<Set<number>>(new Set());
  const [isEditMode] = useState(!!budgetId);

  const now = new Date();
  const [formData, setFormData] = useState({
    amount: '',
    category_id: parseInt(searchParams.get('category') || '0'),
    month: now.getMonth() + 1, // 1-indexed
    year: now.getFullYear()
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, budgetsData] = await Promise.all([
          categoryService.getCategories(),
          budgetService.getBudgets(formData.month, formData.year)
        ]);
        
        setCategories(categoriesData);
        
        // Track which categories already have budgets
        const budgetCategoryIds = new Set<number>(
          budgetsData.map((b: any) => b.category_id)
        );
        setExistingBudgets(budgetCategoryIds);

        // If in edit mode, fetch the specific budget
        if (isEditMode && budgetId) {
          const allBudgets = await budgetService.getBudgets(formData.month, formData.year);
          const budgetToEdit = allBudgets.find((b: any) => b.id === parseInt(budgetId));
          
          if (budgetToEdit) {
            setFormData({
              amount: budgetToEdit.amount.toString(),
              category_id: budgetToEdit.category_id,
              month: budgetToEdit.month,
              year: budgetToEdit.year
            });
          } else {
            toast.error('Budget not found');
            navigate('/budgets');
            return;
          }
        } else {
          // Select first available category if none selected
          if (categoriesData.length > 0 && !formData.category_id) {
            const firstAvailable = categoriesData.find(c => !budgetCategoryIds.has(c.id));
            setFormData(prev => ({ 
              ...prev, 
              category_id: firstAvailable?.id || categoriesData[0].id 
            }));
          }
        }
      } catch (error) {
        toast.error('Having trouble loading data. Try refreshing the page');
      }
    };

    loadData();
  }, [isEditMode, budgetId, formData.month, formData.year]);

  const handleQuickAdd = (value: number) => {
    const current = formData.amount ? parseFloat(formData.amount) : 0;
    setFormData(prev => ({ ...prev, amount: (current + value).toString() }));
  };

  const handleSubmit = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!formData.category_id) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);

    try {
      await budgetService.createOrUpdateBudget({
        category_id: formData.category_id,
        month: formData.month,
        year: formData.year,
        amount: parseFloat(formData.amount)
      });

      toast.success('✨ Budget created successfully!', { duration: 4000 });
      navigate('/budgets');
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('A budget already exists for this category this month');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === formData.category_id);
  const hasExistingBudget = existingBudgets.has(formData.category_id);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={onCancel}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="p-2 rounded-full bg-card border border-border hover:bg-muted transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="font-medium hidden sm:inline">Back</span>
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            {isEditMode ? 'Edit Budget' : 'Create Budget'}
          </h1>
          <div className="w-10"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Amount & Category (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-border">
              <CardContent className="p-6 md:p-8">
                {/* Amount Section */}
                <div className="text-center mb-10 pt-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Monthly Budget Amount
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl text-muted-foreground/50 font-light">kr</span>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="min-w-[100px] max-w-[300px] text-6xl font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none bg-transparent text-left p-0 m-0 no-spinners"
                      autoFocus
                      style={{ width: `${Math.max(1, formData.amount.length) * 0.8}em` }}
                    />
                  </div>
                  {/* Quick Presets */}
                  <div className="flex justify-center gap-2 mt-4">
                    {[500, 1000, 2000, 5000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleQuickAdd(val)}
                        className="px-3 py-1 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                      >
                        +{val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Grid Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Select Category
                    </label>
                    {hasExistingBudget && (
                      <span className="text-xs text-[oklch(var(--theme-amber))] font-medium">
                        Budget exists - will update
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {categories.map((category) => {
                      const Icon = getIconByName(category.icon);
                      const isSelected = formData.category_id === category.id;
                      const isDisabled = existingBudgets.has(category.id) && !isSelected;
                      
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => !isDisabled && setFormData({ ...formData, category_id: category.id })}
                          disabled={isDisabled}
                          className={`group flex flex-col items-center gap-2 p-2 rounded-xl transition-all relative ${
                            isSelected ? 'scale-105' : isDisabled ? 'opacity-40 cursor-not-allowed' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <div 
                            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                              isSelected ? 'scale-105' : isDisabled ? 'opacity-40' : 'opacity-70 hover:opacity-100'
                            }`}
                            style={getCategoryIconStyle(category.color || '#64748b', isSelected)}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <span 
                            className={`text-xs font-medium transition-colors ${
                              isSelected ? 'font-semibold' : isDisabled ? 'text-muted-foreground' : 'text-foreground/70'
                            }`}
                            style={{ color: isSelected ? category.color : undefined }}
                          >
                            {category.name}
                          </span>
                          {existingBudgets.has(category.id) && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-[oklch(var(--theme-amber))] rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="space-y-6">
            
            {/* Details Card */}
            <Card className="shadow-sm border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Budget Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Month/Year Display */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Period
                  </label>
                  <div className="flex items-center gap-2 p-2.5 bg-muted rounded-lg">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {new Date(formData.year, formData.month - 1).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>

                {/* Selected Category */}
                {selectedCategory && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Category
                    </label>
                    <div className="flex items-center gap-3 p-2.5 bg-muted rounded-lg">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={getCategoryIconStyle(selectedCategory.color || '#64748b', true)}
                      >
                        {(() => {
                          const IconComponent = getIconByName(selectedCategory.icon);
                          return <IconComponent className="h-4 w-4" />;
                        })()}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {selectedCategory.name}
                      </span>
                    </div>
                  </div>
                )}

                {hasExistingBudget && (
                  <div className="p-3 bg-[oklch(var(--theme-amber)/0.1)] border border-[oklch(var(--theme-amber)/0.3)] rounded-lg">
                    <p className="text-xs text-foreground">
                      <strong>Note:</strong> This will update the existing budget for this category.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Button */}
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-foreground text-background rounded-xl font-semibold shadow-xl shadow-foreground/10 hover:shadow-foreground/20 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-spin">⌛</span>
              ) : (
                <Check className="h-6 w-6" />
              )}
              {loading ? 'Saving...' : (hasExistingBudget && !isEditMode) ? 'Update Budget' : isEditMode ? 'Update Budget' : 'Create Budget'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
