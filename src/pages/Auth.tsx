import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import MobileFrame from '@/components/MobileFrame';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralCodeErrorMsg, setReferralCodeErrorMsg] = useState('');
  const [isInvalidCode, setIsInvalidCode] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (ref) {
      setIsLogin(false);
      setReferralCode(ref);
    }
  }, [ref]);

  function verifyReferralCodeInput(code: string) {
    setReferralCode(code);
    if (code.match("^NETS[0-9A-F]{8}$") || code == "") {
      setReferralCodeErrorMsg("");
      setIsInvalidCode(false);
    } else {
      setReferralCodeErrorMsg("Invalid referral code.");
      setIsInvalidCode(true);
    }
  }

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "Successfully logged in."
          });
        }
      } else {
        const { error } = await signUp(email, password, displayName, referralCode);
        if (error) {
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Account Created!",
            description: "Please check your email to verify your account."
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-primary">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {isLogin ? 'Sign in to your NETS account' : 'Join NETS Everywhere today'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {!isLogin && <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code (💵 Get $10 credits!)</Label>
                <br></br>
                <Label style={{color: "red"}}>{referralCodeErrorMsg}</Label>
                <Input
                  id="referralCode"
                  type="text"
                  placeholder="NETSxxxxxxxx"
                  value={referralCode}
                  onChange={(e) => verifyReferralCodeInput(e.target.value)}
                />
              </div>}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || isInvalidCode}
              >
                {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileFrame>
  );
};

export default Auth;