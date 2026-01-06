import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Category, User } from '../types';
import { ArrowLeft, Check, Users, RefreshCw, ChevronDown, CalendarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PartnerInviteModal } from './PartnerInviteModal';
import { expenseService } from '../api/services/expenseService';
import { recurringExpenseService } from '../api/services/recurringExpenseService';
import { categoryService } from '../api/services/categoryService';
import { authService } from '../api/services/authService';
import { toast } from 'sonner';
import { getIconByName } from '../lib/categoryIcons';
import { getCategoryIconStyle } from '../lib/iconUtils';
import { format } from 'date-fns';

interface ExpenseFormProps {
  onCancel: () => void;
}

// Remove local hexToRgba function since we're using the centralized one

export function ExpenseForm({ onCancel }: ExpenseFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [billManagedCategoryIds, setBillManagedCategoryIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    category_id: 0,
    description: '',
    date: new Date(),
    paid_by_user_id: user?.id || 0,
    split_type: '50/50' as '50/50' | 'custom' | 'personal' | 'bill',
    split_ratio_user1: 50,
    split_ratio_user2: 50
  });

  const [saveAsRecurring, setSaveAsRecurring] = useState(false);
  const [addAnotherCount, setAddAnotherCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, usersData, recurringTemplates] = await Promise.all([
          categoryService.getCategories(),
          authService.getUsers(),
          recurringExpenseService.getTemplates()
        ]);
        setCategories(categoriesData);
        setUsers(usersData);

        // Track which categories have bill-managed recurring templates (for visual hint only)
        const billCatIds = new Set<number>(
          recurringTemplates
            .filter(t => t.bill_managed && t.is_active)
            .map(t => t.category_id)
        );
        setBillManagedCategoryIds(billCatIds);

        // Select first category as default (no longer filtering out recurring categories)
        if (categoriesData.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: categoriesData[0].id }));
        }
        
        // Ensure paid_by_user_id is set if not already
        if (user?.id && (!formData.paid_by_user_id || formData.paid_by_user_id === 0)) {
          setFormData(prev => ({ ...prev, paid_by_user_id: user.id }));
        }
      } catch (error) {
        toast.error('Having trouble loading data. Try refreshing the page');
      }
    };

    loadData();
  }, []);

  const currentUser = users.find(u => u.id === user?.id);
  const partnerUser = users.find(u => u.id !== user?.id);
  const hasPartner = users.length > 1 && !!partnerUser;

  const handleQuickAdd = (value: number) => {
    const current = formData.amount ? parseFloat(formData.amount) : 0;
    setFormData(prev => ({ ...prev, amount: (current + value).toString() }));
  };

  const togglePayer = () => {
    if (!hasPartner || !partnerUser || !currentUser) {
      return;
    }
    
    const isMe = formData.paid_by_user_id === currentUser.id;
    setFormData(prev => ({
      ...prev,
      paid_by_user_id: isMe ? partnerUser.id : currentUser.id
    }));
  };

  const getPayerName = () => {
    if (formData.paid_by_user_id === currentUser?.id) return 'You';
    const payer = users.find(u => u.id === formData.paid_by_user_id);
    return payer?.name || 'Partner';
  };

  const handleSubmit = async (addAnother: boolean = false) => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!formData.description || formData.description.trim() === '') {
      toast.error('Please enter a description');
      return;
    }

    setLoading(true);

    try {
      let recurringTemplateId: number | undefined;

      // If saving as recurring, create the template FIRST to get its ID
      if (saveAsRecurring) {
        try {
          // Use the day from the expense date for the recurring template
          // This allows subscriptions to be on any day of the month
          const dayOfMonth = Math.min(formData.date.getDate(), 28); // Clamp to 28 for safety
          
          const template = await recurringExpenseService.createTemplate({
            description: formData.description,
            default_amount: parseFloat(formData.amount),
            category_id: formData.category_id,
            paid_by_user_id: formData.paid_by_user_id,
            split_type: formData.split_type,
            ...(formData.split_type === 'custom' && {
              split_ratio_user1: formData.split_ratio_user1,
              split_ratio_user2: formData.split_ratio_user2
            }),
            bill_managed: true,
            day_of_month: dayOfMonth
          });
          recurringTemplateId = template.id;
        } catch (templateErr) {
          console.error('Failed to create recurring template:', templateErr);
          // Continue without the template link
        }
      }

      // Create the expense, linking to the recurring template if one was created
      await expenseService.createExpense({
        amount: parseFloat(formData.amount),
        category_id: formData.category_id,
        description: formData.description,
        date: format(formData.date, 'yyyy-MM-dd'),
        paid_by_user_id: formData.paid_by_user_id,
        split_type: formData.split_type,
        ...(formData.split_type === 'custom' && { 
          split_ratio_user1: formData.split_ratio_user1,
          split_ratio_user2: formData.split_ratio_user2 
        }),
        ...(recurringTemplateId && { recurring_expense_id: recurringTemplateId })
      });

      if (saveAsRecurring && recurringTemplateId) {
        toast.success('✨ Expense tracked and saved as recurring!', { duration: 4000 });
      } else if (saveAsRecurring) {
        toast.success('✨ Expense tracked, but recurring template failed.', { duration: 4000 });
      } else {
        if (addAnother) {
          const newCount = addAnotherCount + 1;
          setAddAnotherCount(newCount);
          toast.success(`✨ Expense #${newCount} saved!`, { duration: 2000 });
        } else {
          toast.success('✨ Expense tracked!', { duration: 4000 });
        }
      }

      if (addAnother) {
        // Reset form for next entry
        setFormData(prev => ({
          ...prev,
          amount: '',
          description: ''
        }));
        // Reset recurring toggle
        setSaveAsRecurring(false);
        // Focus back to amount input
        const amountInput = document.querySelector('input[type="number"]') as HTMLInputElement;
        if (amountInput) {
          amountInput.focus();
        }
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-lg font-display font-semibold text-foreground">New Expense</h1>
          <div className="w-10"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left Column: Amount & Category (Span 3) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8 relative overflow-hidden">
              {/* Amount Section */}
              <div className="text-center mb-10 pt-2">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Amount</label>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl text-muted-foreground/50 font-light">kr</span>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="min-w-[100px] max-w-[300px] text-6xl font-display font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none bg-transparent text-left p-0 m-0 no-spinners"
                    autoFocus
                    style={{ width: `${Math.max(1, formData.amount.length) * 0.8}em` }}
                  />
                </div>
                {/* Quick Presets (Additive) */}
                <div className="flex justify-center gap-2 mt-4">
                  {[100, 200, 500].map((val) => (
                    <Button
                      key={val}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAdd(val)}
                      className="rounded-full h-7 px-3 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 border-border"
                    >
                      +{val}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Grid Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</label>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-3">
                  {categories.map((category) => {
                    const Icon = getIconByName(category.icon);
                    const isSelected = formData.category_id === category.id;
                    const hasRecurring = billManagedCategoryIds.has(category.id);
                    
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, category_id: category.id })}
                        className={`group flex flex-col items-center gap-2 p-2 rounded-xl transition-all relative ${
                          isSelected ? 'scale-105' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div 
                          className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                            isSelected ? 'scale-105' : 'opacity-70 hover:opacity-100'
                          }`}
                          style={getCategoryIconStyle(category.color || '#64748b', isSelected)}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <span 
                          className={`text-xs font-medium transition-colors ${
                            isSelected ? 'font-semibold' : 'text-muted-foreground'
                          }`}
                          style={{ color: isSelected ? category.color : undefined }}
                        >
                          {category.name}
                        </span>
                        {hasRecurring && (
                          <RefreshCw className="absolute top-1 right-1 h-3 w-3 text-[oklch(var(--theme-teal))]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details, Split, Recurring (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Details Card */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-[oklch(var(--theme-teal))]" />
                Details & Sharing
              </h3>

              <div className="space-y-4">
                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-muted border-0 rounded-lg hover:bg-muted/80 focus:ring-2 focus:ring-[oklch(var(--theme-teal)/0.2)] transition-all text-sm text-foreground"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date: Date | undefined) => date && setFormData({ ...formData, date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Description</label>
                  <input 
                    type="text" 
                    placeholder="What is this for?" 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 bg-muted border-0 rounded-lg focus:ring-2 focus:ring-[oklch(var(--theme-teal)/0.2)] focus:bg-card transition-all font-medium text-sm"
                  />
                </div>

                <div className="h-px bg-border my-2"></div>

                {/* Payer & Split Logic */}
                {hasPartner ? (
                  <div className="space-y-4">
                    {/* Payer Row */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Paid by</span>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={togglePayer}
                        className="flex items-center gap-2 h-auto py-1.5 px-3 bg-muted border-border hover:bg-muted/80 text-foreground font-normal"
                      >
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{
                            backgroundColor: formData.paid_by_user_id === currentUser?.id 
                              ? currentUser?.color || '#64748b' 
                              : partnerUser?.color || '#64748b',
                            color: 'white'
                          }}
                        >
                          {formData.paid_by_user_id === currentUser?.id 
                            ? currentUser?.name?.charAt(0) || 'Y'
                            : partnerUser?.name?.charAt(0) || 'P'
                          }
                        </div>
                        <span className="text-sm font-medium text-foreground">{getPayerName()}</span>
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>

                    {/* Split Type Selection */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        type="button"
                        variant={formData.split_type === '50/50' ? 'default' : 'outline'}
                        onClick={() => setFormData({ ...formData, split_type: '50/50' })}
                        className={`h-auto py-2 text-xs font-medium rounded-lg transition-all ${
                          formData.split_type === '50/50' 
                            ? 'bg-[oklch(var(--theme-teal)/0.1)] border-[oklch(var(--theme-teal)/0.3)] text-[oklch(var(--theme-teal))] hover:bg-[oklch(var(--theme-teal)/0.15)] shadow-none' 
                            : 'bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        50/50 Split
                      </Button>
                      <Button 
                        type="button"
                        variant={formData.split_type === 'personal' ? 'default' : 'outline'}
                        onClick={() => setFormData({ ...formData, split_type: 'personal' })}
                        className={`h-auto py-2 text-xs font-medium rounded-lg transition-all ${
                          formData.split_type === 'personal' 
                            ? 'bg-[oklch(var(--theme-teal)/0.1)] border-[oklch(var(--theme-teal)/0.3)] text-[oklch(var(--theme-teal))] hover:bg-[oklch(var(--theme-teal)/0.15)] shadow-none' 
                            : 'bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        Personal
                      </Button>
                      <Button 
                        type="button"
                        variant={formData.split_type === 'bill' ? 'default' : 'outline'}
                        onClick={() => setFormData({ ...formData, split_type: 'bill' })}
                        className={`h-auto py-2 text-xs font-medium rounded-lg transition-all ${
                          formData.split_type === 'bill' 
                            ? 'bg-[oklch(var(--theme-teal)/0.1)] border-[oklch(var(--theme-teal)/0.3)] text-[oklch(var(--theme-teal))] hover:bg-[oklch(var(--theme-teal)/0.15)] shadow-none' 
                            : 'bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        Partner Bill
                      </Button>
                      <Button 
                        type="button"
                        variant={formData.split_type === 'custom' ? 'default' : 'outline'}
                        onClick={() => setFormData({ ...formData, split_type: 'custom' })}
                        className={`h-auto py-2 text-xs font-medium rounded-lg transition-all ${
                          formData.split_type === 'custom' 
                            ? 'bg-[oklch(var(--theme-teal)/0.1)] border-[oklch(var(--theme-teal)/0.3)] text-[oklch(var(--theme-teal))] hover:bg-[oklch(var(--theme-teal)/0.15)] shadow-none' 
                            : 'bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        Custom
                      </Button>
                    </div>

                    {/* Custom Split Slider */}
                    {formData.split_type === 'custom' && (
                      <div className="pt-2 animate-in slide-in-from-top-2 fade-in duration-200 bg-muted p-3 rounded-lg border border-border">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span>You: {formData.split_ratio_user1}%</span>
                          <span>Partner: {formData.split_ratio_user2}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          step="5"
                          value={formData.split_ratio_user1} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setFormData({
                              ...formData,
                              split_ratio_user1: val,
                              split_ratio_user2: 100 - val
                            });
                          }}
                          className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-[oklch(var(--theme-teal))]"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-[oklch(var(--theme-teal)/0.1)] border border-[oklch(var(--theme-teal)/0.2)] rounded-lg">
                    <p className="text-xs text-[oklch(var(--theme-teal))] mb-2">
                      <strong>Solo mode:</strong> Invite partner to split costs!
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-8 text-[oklch(var(--theme-teal))] border-[oklch(var(--theme-teal)/0.3)] hover:bg-[oklch(var(--theme-teal)/0.1)] bg-card"
                      onClick={() => setInviteModalOpen(true)}
                    >
                      Invite Partner
                    </Button>
                  </div>
                )}

                <div className="h-px bg-border my-2"></div>

                {/* Recurring Toggle */}
                <div 
                  onClick={() => setSaveAsRecurring(!saveAsRecurring)}
                  className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all group ${
                    saveAsRecurring 
                      ? 'bg-[oklch(var(--theme-teal)/0.1)] border-[oklch(var(--theme-teal)/0.2)]' 
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      saveAsRecurring 
                        ? 'bg-card text-[oklch(var(--theme-teal))] border border-[oklch(var(--theme-teal)/0.2)]' 
                        : 'bg-card border border-border text-muted-foreground group-hover:text-[oklch(var(--theme-teal))] group-hover:border-[oklch(var(--theme-teal)/0.2)]'
                    }`}>
                      <RefreshCw className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-medium text-foreground">Monthly Bill</div>
                  </div>
                  
                  <Switch checked={saveAsRecurring} onCheckedChange={setSaveAsRecurring} className="scale-75 origin-right" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={() => handleSubmit(false)}
                disabled={loading}
                variant="teal"
                className="w-full h-14 text-lg font-semibold shadow-xl shadow-[oklch(var(--theme-teal)/0.15)] hover:shadow-[oklch(var(--theme-teal)/0.25)] hover:translate-y-[-2px] transition-all gap-2 rounded-xl"
              >
                {loading ? (
                  <span className="animate-spin">⌛</span>
                ) : (
                  <Check className="h-6 w-6" />
                )}
                {loading ? 'Saving...' : 'Save Expense'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="w-full h-12 text-base bg-card text-muted-foreground hover:text-foreground border-border hover:bg-muted hover:border-border rounded-xl gap-2 font-medium"
              >
                {loading ? (
                  <span className="animate-spin">⌛</span>
                ) : (
                  <Check className="h-5 w-5" />
                )}
                {loading ? 'Saving...' : 'Save and Add Another'}
              </Button>
            </div>
          </div>

        </div>
        
        <PartnerInviteModal
          open={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          onSuccess={() => window.location.reload()}
        />
      </div>
    </div>
  );
}