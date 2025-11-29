import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Expense, Category, User } from '../types';
import { ArrowLeft, Check, Users, RefreshCw, Plus, ChevronDown, CalendarIcon } from 'lucide-react';
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, usersData] = await Promise.all([
          categoryService.getCategories(),
          authService.getUsers()
        ]);
        setCategories(categoriesData);
        setUsers(usersData);

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

  const handleSubmit = async () => {
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
        })
      });

      if (saveAsRecurring) {
        try {
          await recurringExpenseService.createTemplate({
            description: formData.description,
            default_amount: parseFloat(formData.amount),
            category_id: formData.category_id,
            paid_by_user_id: formData.paid_by_user_id,
            split_type: formData.split_type,
            ...(formData.split_type === 'custom' && {
              split_ratio_user1: formData.split_ratio_user1,
              split_ratio_user2: formData.split_ratio_user2
            })
          });
          toast.success('✨ Expense tracked and saved as recurring!', { duration: 4000 });
        } catch (templateErr) {
          toast.success('✨ Expense tracked, but recurring template failed.', { duration: 4000 });
        }
      } else {
        toast.success('✨ Expense tracked!', { duration: 4000 });
      }

      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-50/50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={onCancel}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <div className="p-2 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="font-medium hidden sm:inline">Back</span>
          </button>
          <h1 className="text-lg font-semibold text-slate-900">New Expense</h1>
          <div className="w-10"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left Column: Amount & Category (Span 3) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 relative overflow-hidden">
              {/* Decorative top bar */}
              {/* <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500"></div> */}

              {/* Amount Section */}
              <div className="text-center mb-10 pt-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Amount</label>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl text-slate-300 font-light">kr</span>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="min-w-[100px] max-w-[300px] text-6xl font-bold text-slate-900 placeholder:text-slate-200 focus:outline-none bg-transparent text-left p-0 m-0 no-spinners"
                    autoFocus
                    style={{ width: `${Math.max(1, formData.amount.length) * 0.8}em` }}
                  />
                </div>
                {/* Quick Presets (Additive) */}
                <div className="flex justify-center gap-2 mt-4">
                  {[100, 200, 500].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAdd(val)}
                      className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Grid Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-3">
                  {categories.map((category) => {
                    const Icon = getIconByName(category.icon);
                    const isSelected = formData.category_id === category.id;
                    
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, category_id: category.id })}
                        className={`group flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${
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
                            isSelected ? 'font-semibold' : 'text-slate-600'
                          }`}
                          style={{ color: isSelected ? category.color : undefined }}
                        >
                          {category.name}
                        </span>
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-500" />
                Details & Sharing
              </h3>

              <div className="space-y-4">
                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-slate-50 border-0 rounded-lg hover:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm text-slate-700"
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                  <input 
                    type="text" 
                    placeholder="What is this for?" 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium text-sm"
                  />
                </div>

                <div className="h-px bg-slate-100 my-2"></div>

                {/* Payer & Split Logic */}
                {hasPartner ? (
                  <div className="space-y-4">
                    {/* Payer Row */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Paid by</span>
                      <button 
                        type="button"
                        onClick={togglePayer}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
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
                        <span className="text-sm font-medium text-slate-700">{getPayerName()}</span>
                        <ChevronDown className="h-3 w-3 text-slate-400" />
                      </button>
                    </div>

                    {/* Split Type Selection */}
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, split_type: '50/50' })}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                          formData.split_type === '50/50' 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        50/50 Split
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, split_type: 'personal' })}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                          formData.split_type === 'personal' 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Personal
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, split_type: 'bill' })}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                          formData.split_type === 'bill' 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Partner Bill
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, split_type: 'custom' })}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                          formData.split_type === 'custom' 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Custom
                      </button>
                    </div>

                    {/* Custom Split Slider */}
                    {formData.split_type === 'custom' && (
                      <div className="pt-2 animate-in slide-in-from-top-2 fade-in duration-200 bg-slate-50 p-3 rounded-lg border border-slate-100">
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
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800 mb-2">
                      <strong>Solo mode:</strong> Invite partner to split costs!
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-8 text-blue-700 border-blue-300 hover:bg-blue-100 bg-white"
                      onClick={() => setInviteModalOpen(true)}
                    >
                      Invite Partner
                    </Button>
                  </div>
                )}

                <div className="h-px bg-slate-100 my-2"></div>

                {/* Recurring Toggle */}
                <div 
                  onClick={() => setSaveAsRecurring(!saveAsRecurring)}
                  className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all group ${
                    saveAsRecurring 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      saveAsRecurring 
                        ? 'bg-white text-blue-600 border border-blue-100' 
                        : 'bg-white border border-slate-200 text-slate-400 group-hover:text-blue-500 group-hover:border-blue-200'
                    }`}>
                      <RefreshCw className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-medium text-slate-900">Monthly Bill</div>
                  </div>
                  
                  <Switch checked={saveAsRecurring} onCheckedChange={setSaveAsRecurring} className="scale-75 origin-right" />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-spin">⌛</span>
              ) : (
                <Check className="h-6 w-6" />
              )}
              {loading ? 'Saving...' : 'Save Expense'}
            </button>
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