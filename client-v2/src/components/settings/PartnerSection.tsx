import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PartnerInviteModal } from '../PartnerInviteModal';
import { authService } from '../../api/services/authService';
import { toast } from 'sonner';

interface Partner {
  id: number;
  name: string;
  email: string;
}

export function PartnerSection() {
  const { user } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(false);

  const hasPartner = user?.partner_id != null;

  useEffect(() => {
    if (hasPartner && user?.partner_id) {
      fetchPartnerDetails();
    }
  }, [hasPartner, user?.partner_id]);

  const fetchPartnerDetails = async () => {
    if (!user?.partner_id) return;
    
    setLoading(true);
    try {
      // Fetch all users and find the partner
      const users = await authService.getUsers() as Partner[];
      const partnerData = users.find((u) => u.id === user.partner_id);
      if (partnerData) {
        setPartner(partnerData);
      }
    } catch (error) {
      console.error('Failed to fetch partner details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSuccess = () => {
    toast.success('Partner invitation sent!');
    // Reload user data to update partner status
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Partner Management
          </CardTitle>
          <CardDescription>
            Connect with your partner to manage finances together
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Partner Status */}
          <div className={`rounded-lg border p-4 ${
            hasPartner 
              ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950' 
              : 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                hasPartner 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              }`}>
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {hasPartner ? 'Partner Connected' : 'No Partner Connected'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {hasPartner ? (
                    loading ? (
                      'Loading partner details...'
                    ) : partner ? (
                      `${partner.name} (${partner.email})`
                    ) : (
                      `Partner ID: ${user.partner_id}`
                    )
                  ) : (
                    'Invite your partner to start managing finances together'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!hasPartner ? (
            <Button
              onClick={() => setShowInviteModal(true)}
              className="w-full gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Invite Partner
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 text-sm font-medium">Split Preferences</h4>
                <p className="text-xs text-muted-foreground">
                  Configure default split ratios and preferences (Coming soon)
                </p>
              </div>
              
              <Button
                variant="destructive"
                className="w-full gap-2"
                disabled
              >
                <UserMinus className="h-4 w-4" />
                Disconnect Partner
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Disconnecting from your partner will remove shared expense tracking
              </p>
            </div>
          )}

          {/* Information */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Note:</strong> Your partner needs to have an account first. 
              Both partners can see all shared expenses and budgets.
            </p>
          </div>
        </CardContent>
      </Card>

      <PartnerInviteModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={handleInviteSuccess}
      />
    </>
  );
}
