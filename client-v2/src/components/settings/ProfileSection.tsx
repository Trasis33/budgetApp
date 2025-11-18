import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { User as UserIcon, Mail, CheckCircle, Palette } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../api/services/authService';
import { toast } from 'sonner';
import { ColorPicker } from '../ui/ColorPicker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { User } from '../../types';

export function ProfileSection() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    color: ''
  });
  const [loading, setLoading] = useState(false);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        color: user.color || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleColorChange = async (color: string) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
    
    // Immediately save the color change
    try {
      const updatedUser = await authService.updateProfile({ color });
      // Update the user in AuthContext to reflect the change immediately
      setUser(updatedUser as User);
      toast.success('Avatar color updated successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error updating avatar color';
      toast.error(errorMessage);
    }
    
    setIsColorModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Only send name and email, color is handled separately
      const updatedUser = await authService.updateProfile({
        name: formData.name,
        email: formData.email
      });
      // Update the user in AuthContext to reflect the change immediately
      setUser(updatedUser as User);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error updating profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your account information and personal details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info Display */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <Dialog open={isColorModalOpen} onOpenChange={setIsColorModalOpen}>
                <DialogTrigger asChild>
                  <button 
                    className="flex h-12 w-12 items-center justify-center rounded-full text-white font-semibold text-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ 
                      backgroundColor: formData.color || 'var(--theme-indigo)',
                      color: 'white'
                    }}
                    title="Click to change avatar color"
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Choose Avatar Color
                    </DialogTitle>
                  </DialogHeader>
                  <ColorPicker
                    selectedColor={formData.color}
                    onColorChange={handleColorChange}
                  />
                </DialogContent>
              </Dialog>
              <div>
                <p className="text-sm font-medium">Current Account</p>
                <p className="text-xs text-muted-foreground">User ID: {user?.id}</p>
              </div>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="pl-10"
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10"
                placeholder="Enter your email address"
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
