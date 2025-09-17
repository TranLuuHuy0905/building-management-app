'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { generatePersonalizedSuggestions } from '@/ai/flows/generate-personalized-suggestions';
import { getBills } from '@/lib/services/bill-service';
import { getRequests } from '@/lib/services/request-service';
import { getNotifications } from '@/lib/services/notification-service';


export function AiSuggestions() {
  const { currentUser } = useAuth();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const getSuggestions = async () => {
      setLoading(true);
      
      let historicalBehavior = '';
      if (currentUser.role === 'resident') {
        const unpaidBills = await getBills({ apartment: currentUser.apartment, status: 'unpaid' });
        const openRequests = await getRequests({ apartment: currentUser.apartment }); // Simplified for demo
        historicalBehavior = `User has ${unpaidBills.length} unpaid bill(s) and ${openRequests.filter(r => r.status !== 'completed').length} open service request(s).`;
      } else if (currentUser.role === 'admin') {
        const pendingRequests = await getRequests({ status: 'pending' });
        historicalBehavior = `There are ${pendingRequests.length} pending service requests.`;
      } else if (currentUser.role === 'technician') {
        const assignedTasks = await getRequests({ assignedTo: currentUser.uid });
        historicalBehavior = `User is assigned to ${assignedTasks.filter(r => r.status !== 'completed').length} open task(s).`;
      }

      const recentNotifications = await getNotifications({ take: 1 });
      const availableBuildingData = recentNotifications.length > 0 ? recentNotifications[0].content : "No new announcements.";


      try {
        const result = await generatePersonalizedSuggestions({
          userRole: currentUser.role,
          historicalBehavior,
          availableBuildingData,
        });
        setSuggestions(result.suggestions.split('\n').filter(s => s.trim() !== ''));
      } catch (error) {
        console.error("Failed to generate AI suggestions:", error);
        setSuggestions(['Không thể tải đề xuất vào lúc này.']);
      }
      setLoading(false);
    };

    getSuggestions();
  }, [currentUser]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="p-2 bg-accent/20 rounded-lg">
            <Lightbulb className="w-5 h-5 text-accent" />
        </div>
        <CardTitle className="text-lg font-headline">Đề xuất thông minh</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang tạo đề xuất cho bạn...</span>
          </div>
        ) : (
          <ul className="space-y-2 list-disc pl-5 text-sm">
            {suggestions.map((suggestion, index) => (
                <li key={index} className="text-foreground">{suggestion.replace(/^- /, '')}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
