import { useState, useEffect } from "react";
import { Crown, Medal, TrendingUp, Users, Receipt } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import MobileFrame from "@/components/MobileFrame";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LeaderboardUser {
  id: string;
  display_name: string;
  streak_count?: number;
  total_spent?: number;
  group_pay_count?: number;
  referral_count?: number;
  rank: number;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "streak" | "spending" | "group_pays" | "referrals"
  >("spending");

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    try {
      // First, ensure demo users are seeded
      await supabase.rpc("seed_demo_users");

      let leaderboardData = [];

      if (activeTab === "group_pays") {
        // Create demo group pay leaderboard
        const demoGroupPayData = [
          { id: "demo-1", display_name: "Sarah Chen", group_pay_count: 12 },
          { id: "demo-2", display_name: "Rachel Wong", group_pay_count: 9 },
          { id: "demo-3", display_name: "Emily Tan", group_pay_count: 8 },
          { id: "demo-4", display_name: "Amanda Koh", group_pay_count: 7 },
          { id: "demo-5", display_name: "Marcus Lee", group_pay_count: 6 },
          { id: "demo-6", display_name: "Daniel Chua", group_pay_count: 5 },
          { id: "demo-7", display_name: "Priya Singh", group_pay_count: 4 },
          { id: "demo-8", display_name: "Lisa Kim", group_pay_count: 4 },
          { id: "demo-9", display_name: "Grace Ng", group_pay_count: 3 },
          { id: "demo-10", display_name: "Nicole Tan", group_pay_count: 3 },
        ];

        leaderboardData = demoGroupPayData.map((user, index) => ({
          ...user,
          rank: index + 1,
        }));
      } else if (activeTab === "referrals") {
        // Create demo referral leaderboard
        const demoReferralData = [
          { id: "demo-1", display_name: "Rachel Wong", referral_count: 15 },
          { id: "demo-2", display_name: "Emily Tan", referral_count: 12 },
          { id: "demo-3", display_name: "Amanda Koh", referral_count: 10 },
          { id: "demo-4", display_name: "Sarah Chen", referral_count: 9 },
          { id: "demo-5", display_name: "Daniel Chua", referral_count: 8 },
          { id: "demo-6", display_name: "Grace Ng", referral_count: 7 },
          { id: "demo-7", display_name: "Nicole Tan", referral_count: 6 },
          { id: "demo-8", display_name: "Michelle Loh", referral_count: 5 },
          { id: "demo-9", display_name: "Stephanie Wee", referral_count: 5 },
          { id: "demo-10", display_name: "Cheryl Lim", referral_count: 4 },
        ];

        leaderboardData = demoReferralData.map((user, index) => ({
          ...user,
          rank: index + 1,
        }));
      } else {
        // Fetch spending or streak leaders
        const orderBy = activeTab === "streak" ? "streak_count" : "total_spent";

        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, streak_count, total_spent")
          .order(orderBy, { ascending: false })
          .limit(25);

        leaderboardData =
          profiles?.map((profile, index) => ({
            id: profile.user_id,
            display_name: profile.display_name || "Anonymous User",
            streak_count: profile.streak_count || 0,
            total_spent: profile.total_spent || 0,
            rank: index + 1,
          })) || [];
      }

      setLeaderboard(leaderboardData);

      // Find current user's rank
      const currentUserRank = leaderboardData.find(
        (u) => u.id === user?.id
      )?.rank;
      setUserRank(currentUserRank || null);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500" size={20} />;
      case 2:
        return <Medal className="text-gray-400" size={20} />;
      case 3:
        return <Medal className="text-amber-600" size={20} />;
      default:
        return <span className="text-muted-foreground font-bold">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-gold";
      case 2:
        return "bg-gradient-to-r from-gray-200 to-gray-300";
      case 3:
        return "bg-gradient-to-r from-amber-200 to-amber-300";
      default:
        return "bg-surface";
    }
  };

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading leaderboard...</div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <Header title="Social Leaderboard" />
      <div className="mb-4 px-6 text-sm text-muted-foreground">
        <br></br>
        You will receive exclusive rewards for being placed at the top of the
        leaderboard! The leaderboard resets every 2 months.
      </div>
      <div className="p-6 space-y-6 pb-24">
        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-2 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab("spending")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all ${
              activeTab === "spending"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            <Users size={14} />
            <span className="text-xs">Points</span>
          </button>
          <button
            onClick={() => setActiveTab("streak")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all ${
              activeTab === "streak"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            <TrendingUp size={14} />
            <span className="text-xs">Streak</span>
          </button>
          <button
            onClick={() => setActiveTab("group_pays")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all ${
              activeTab === "group_pays"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            <Receipt size={14} />
            <span className="text-xs">Group Pay</span>
          </button>
          <button
            onClick={() => setActiveTab("referrals")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all ${
              activeTab === "referrals"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            <Crown size={14} />
            <span className="text-xs">Referrals</span>
          </button>
        </div>

        {/* User's Rank */}
        {userRank && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getRankIcon(userRank)}
                <div>
                  <p className="font-medium">Your Rank</p>
                  <p className="text-sm text-muted-foreground">
                    #{userRank} out of {leaderboard.length}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                {activeTab === "streak" &&
                  `${
                    leaderboard.find((u) => u.id === user?.id)?.streak_count ||
                    0
                  } days`}
                {activeTab === "spending" &&
                  `${(
                    leaderboard.find((u) => u.id === user?.id)?.total_spent*10 || 0
                  )}`}
                {activeTab === "group_pays" &&
                  `${
                    leaderboard.find((u) => u.id === user?.id)
                      ?.group_pay_count || 0
                  } group pays`}
                {activeTab === "referrals" &&
                  `${
                    leaderboard.find((u) => u.id === user?.id)
                      ?.referral_count || 0
                  } referrals`}
              </Badge>
            </div>
          </Card>
        )}

        {/* Leaderboard List */}
        <div className="space-y-3">
          {leaderboard.map((leaderUser) => (
            <Card
              key={leaderUser.id}
              className={`p-4 ${getRankBg(leaderUser.rank)} ${
                leaderUser.id === user?.id ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getRankIcon(leaderUser.rank)}
                  <div>
                    <p className="font-medium">
                      {leaderUser.display_name}
                      {leaderUser.id === user?.id && (
                        <span className="text-primary ml-2">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === "streak" &&
                        `${leaderUser.streak_count || 0} day streak`}
                      {activeTab === "spending" &&
                        `${(leaderUser.total_spent*10|| 0)} total points`}
                      {activeTab === "group_pays" &&
                        `${leaderUser.group_pay_count || 0} group pays created`}
                      {activeTab === "referrals" &&
                        `${
                          leaderUser.referral_count || 0
                        } successful referrals`}
                    </p>
                  </div>
                </div>

                {leaderUser.rank <= 3 && (
                  <Badge
                    variant={leaderUser.rank === 1 ? "default" : "secondary"}
                    className={leaderUser.rank === 1 ? "bg-yellow-500" : ""}
                  >
                    Top {leaderUser.rank}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <Card className="p-8 text-center">
            <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
            <p className="text-muted-foreground">
              Start making payments to appear on the leaderboard!
            </p>
          </Card>
        )}

        {/* Leaderboard Info */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <h4 className="font-semibold mb-3 text-blue-800">
            🏆 How Rankings Work
          </h4>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>
              • <strong>Points:</strong> Points earned through transactions via NETSEverywhere
            </li>
            <li>
              • <strong>Streak:</strong> Consecutive days with payments of
              minimum $15 through NETSEverywhere at merchants
            </li>
            <li>
              • <strong>Group Pay:</strong> Number of group sessions created and
              paid
            </li>
            <li>
              • <strong>Referrals:</strong> Successful friend invitations to
              NETSEverywhere (must have used your code)
            </li>
            <li>• Rankings update in real-time</li>
          </ul>
        </Card>
      </div>

      <BottomNavigation />
    </MobileFrame>
  );
};

export default Leaderboard;
