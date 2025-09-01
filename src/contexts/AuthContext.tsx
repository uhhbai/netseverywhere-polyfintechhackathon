import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string, referralCode?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

const signUp = async (
  email: string,
  password: string,
  displayName?: string,
  referralCode?: string
) => {
  const redirectUrl = `${window.location.origin}/`;

  if (referralCode != "") {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*");

    if (error) {
      console.error("Error fetching profiles:", error);
      return { error };
    }

    let referralCodeFound = false;
    let refereeId: string;
    profiles.forEach((profile) => {
      const profileCode = "NETS" + profile.user_id.substring(0, 8).toUpperCase();
      if (profileCode == referralCode) {
        referralCodeFound = true;
        refereeId = profile.user_id;
      }
    });

    if (!referralCodeFound) {
      return {
        error: {
          message: "Referral code not found."
        }
      }
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName
        }
      }
    });

    const referrerId = data.user.id;

    await supabase
      .from("referrals")
      .insert({
        referrer_id: referrerId,
        referee_id: refereeId,
        referral_code: referralCode,
        referee_email: email,
        status: "completed",
      })
      .then(res => console.log(res));

    return { error: signUpError };
  } else {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName
        }
      }
    });

    return { error: signUpError };
  }
};

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};