'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { generatePersonalizedSuggestions } from '@/ai/flows/generate-personalized-suggestions';
import { bills, requests } from '@/lib/data';

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
        const unpaidBills = bills.filter(b => b.apartment === currentUser.apartment && b.status === 'unpaid').length;
        const openRequests = requests.filter(r => r.apartment === currentUser.apartment && r.status !== 'completed').length;
        historicalBehavior = `User has ${unpaidBills} unpaid bill(s) and ${openRequests} open service request(s).`;
      } else if (currentUser.role === 'admin') {
        const pendingRequests = requests.filter(r => r.status === 'pending').length;
        historicalBehavior = `There are ${pendingRequests} pending service requests.`;
      } else if (currentUser.role === 'technician') {
        const assignedTasks = requests.filter(r => r.assignedTo === currentUser.id && r.status !== 'completed').length;
        historicalBehavior = `User is assigned to ${assignedTasks} open task(s).`;
      }

      const availableBuildingData = "Elevator maintenance is scheduled for 2025-09-20. A resident meeting is on 2025-09-25.";

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
