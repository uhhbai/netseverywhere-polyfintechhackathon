import { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';

interface SpendingData {
  month: string;
  amount: number;
}

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

const Analytics = () => {
  const { user } = useAuth();
  const [monthlySpending, setMonthlySpending] = useState<SpendingData[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryData[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [averageTransaction, setAverageTransaction] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (transactions && transactions.length > 0) {
        // Calculate total spending
        const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
        setTotalSpent(total);
        setAverageTransaction(total / transactions.length);

        // Monthly spending data
        const monthlyData = transactions.reduce((acc, transaction) => {
          const month = new Date(transaction.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          });
          acc[month] = (acc[month] || 0) + Number(transaction.amount);
          return acc;
        }, {} as Record<string, number>);

        const monthlyArray = Object.entries(monthlyData).map(([month, amount]) => ({
          month,
          amount
        }));
        setMonthlySpending(monthlyArray);

        // Category breakdown (simulated based on merchant names)
        const categories = transactions.reduce((acc, transaction) => {
          let category = 'Shopping';
          const merchant = transaction.merchant_name.toLowerCase();
          
          if (merchant.includes('restaurant') || merchant.includes('cafe') || merchant.includes('food')) {
            category = 'Dining';
          } else if (merchant.includes('grocery') || merchant.includes('market')) {
            category = 'Groceries';
          } else if (merchant.includes('transport') || merchant.includes('taxi') || merchant.includes('bus')) {
            category = 'Transport';
          } else if (merchant.includes('entertainment') || merchant.includes('cinema') || merchant.includes('game')) {
            category = 'Entertainment';
          }
          
          acc[category] = (acc[category] || 0) + Number(transaction.amount);
          return acc;
        }, {} as Record<string, number>);

        const colors = ['#1E88E5', '#E53E3E', '#38A169', '#F59E0B', '#8B5CF6'];
        const categoryArray = Object.entries(categories)
          .map(([category, amount], index) => ({
            category,
            amount,
            percentage: (amount / total) * 100,
            color: colors[index % colors.length]
          }))
          .sort((a, b) => b.amount - a.amount);
        
        setCategoryBreakdown(categoryArray);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxMonthlyAmount = Math.max(...monthlySpending.map(d => d.amount));

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Header title="Spending Analytics" />
      
      <div className="p-6 space-y-6 pb-24">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-primary" size={20} />
              <span className="text-sm text-muted-foreground">Total Spent</span>
            </div>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="text-secondary" size={20} />
              <span className="text-sm text-muted-foreground">Avg Transaction</span>
            </div>
            <div className="text-2xl font-bold">${averageTransaction.toFixed(2)}</div>
          </Card>
        </div>

        {/* Monthly Spending Chart */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Monthly Spending</h3>
          </div>
          
          <div className="space-y-4">
            {monthlySpending.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{data.month}</span>
                  <span className="text-sm font-semibold">${data.amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-gradient-primary h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${(data.amount / maxMonthlyAmount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Spending by Category</h3>
          </div>
          
          <div className="space-y-4">
            {categoryBreakdown.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${category.amount.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${category.percentage}%`,
                      backgroundColor: category.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Insights */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
          <h4 className="font-semibold mb-3 text-purple-800">📊 Spending Insights</h4>
          <div className="space-y-2 text-sm text-purple-700">
            {categoryBreakdown.length > 0 && (
              <>
                <p>• Your top spending category is <strong>{categoryBreakdown[0].category}</strong> at {categoryBreakdown[0].percentage.toFixed(1)}%</p>
                <p>• You average <strong>${averageTransaction.toFixed(2)}</strong> per transaction</p>
                <p>• Total transactions this period: <strong>{monthlySpending.length > 0 ? monthlySpending.reduce((sum, m) => sum + Math.round(m.amount / averageTransaction), 0) : 0}</strong></p>
              </>
            )}
            <p>• Keep tracking to identify spending patterns and save more!</p>
          </div>
        </Card>

        {totalSpent === 0 && (
          <Card className="p-8 text-center">
            <BarChart3 className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
            <p className="text-muted-foreground">
              Start making payments to see your spending analytics!
            </p>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default Analytics;