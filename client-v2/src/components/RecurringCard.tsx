import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RecurringSummary } from '../lib/recurringAnalytics';
import { formatCurrency } from '../lib/utils';
import { Zap, ChevronRight } from 'lucide-react';

interface RecurringCardProps {
  summary: RecurringSummary;
  templateCount: number;
  isGenerating: boolean;
  onGenerate: () => void;
  onManageTemplates: () => void;
}

export function RecurringCard({
  summary,
  templateCount,
  isGenerating,
  onGenerate,
  onManageTemplates
}: RecurringCardProps) {
  const hasUpcoming = summary.upcomingCount > 0;

  return (
    <Card className="border-[oklch(var(--theme-teal)/0.3)] bg-gradient-to-br from-[oklch(var(--theme-teal)/0.05)] to-transparent mt-6 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-[oklch(var(--theme-teal))]" />
          Keep bills on autopilot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {templateCount === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              💡 When you add a recurring expense (like rent or a subscription), save it as a template. We'll generate it automatically every month.
            </p>
            <Button onClick={onManageTemplates} className="w-full">
              Set up recurring bills
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-card rounded-lg border border-[oklch(var(--theme-teal)/0.2)]">
                <p className="text-xs text-muted-foreground mb-1">Generated</p>
                <p className="text-lg font-semibold text-foreground">{summary.generatedCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(summary.generatedAmount)}
                </p>
              </div>
              <div className="p-3 bg-card rounded-lg border border-[oklch(var(--theme-teal)/0.2)]">
                <p className="text-xs text-muted-foreground mb-1">Coverage</p>
                <p className="text-lg font-semibold text-foreground">{summary.coverage.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.upcomingCount > 0 ? `${summary.upcomingCount} coming` : 'All set!'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {hasUpcoming ? (
                <>
                  <Button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    variant="teal"
                    className="flex-1"
                  >
                    {isGenerating ? 'Generating...' : `Generate ${summary.upcomingCount} bill${summary.upcomingCount === 1 ? '' : 's'}`}
                  </Button>
                  <Button
                    onClick={onManageTemplates}
                    disabled={isGenerating}
                    variant="outline"
                  >
                    Manage
                  </Button>
                </>
              ) : (
                <Button
                  onClick={onManageTemplates}
                  className="w-full"
                  variant="outline"
                >
                  Review recurring bills
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
