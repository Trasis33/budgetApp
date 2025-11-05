import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { SimpleModal } from './SimpleModal';
import { authService } from '../api/services/authService';
import { toast } from 'sonner';
import { Mail, UserPlus, X } from 'lucide-react';

interface PartnerInviteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PartnerInviteModal({ open, onClose, onSuccess }: PartnerInviteModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.invitePartner(email);
      toast.success((response as any).message || 'Partner invitation sent successfully!');
      onSuccess?.();
      onClose();
      setEmail('');
    } catch (error: any) {
      const message = error.response?.data?.message;
      const needsToRegister = error.response?.data?.needsToRegister;
      
      if (needsToRegister) {
        toast.error(`${message} Ask them to sign up first!`);
      } else if (message?.includes('already has a partner')) {
        toast.error('That person is already connected with someone else');
      } else if (message?.includes('already have a partner')) {
        toast.error('You already have a partner connected');
      } else {
        toast.error('Could not connect with partner. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    onClose();
  };

  return (
    <SimpleModal open={open} onClose={handleClose}>
      <div className="relative">
        <button
          onClick={handleClose}
          className="absolute top-0 right-0 p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="pr-8">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <UserPlus className="h-5 w-5" />
            Invite your partner
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter your partner's email to connect your accounts and start tracking expenses together.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="partner-email">Partner's email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="partner-email"
                type="email"
                placeholder="partner@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡 <strong>Note:</strong> Your partner needs to have an account first. 
              If they don't have one, ask them to sign up!
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex-1"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Connecting...
                </span>
              ) : (
                'Connect'
              )}
            </Button>
          </div>
        </form>
      </div>
    </SimpleModal>
  );
}
