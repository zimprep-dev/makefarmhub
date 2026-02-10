import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { mockUsers, adminUser } from '../data/mockData';

const API_BASE = import.meta.env.VITE_API_URL || '';

const DEFAULT_AVATARS: Record<string, string> = {
  farmer: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  buyer: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  transporter: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
  admin: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, otp: string, token: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, phone: string, email: string, role: UserRole, location: string, otp: string, token: string) => Promise<{ success: boolean; error?: string }>;
  sendOTP: (identifier: string, name?: string) => Promise<{ success: boolean; token?: string; error?: string; dev_otp?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<User>) => void;
  updateAvatar: (avatarUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('makefarmhub_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('makefarmhub_user');
      }
    }
    setIsLoading(false);
  }, []);

  const sendOTP = async (identifier: string, name?: string): Promise<{ success: boolean; token?: string; error?: string; dev_otp?: string }> => {
    try {
      const isEmail = identifier.includes('@');
      const response = await fetch(`${API_BASE}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEmail ? { email: identifier } : { phone: identifier }),
          name,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to send verification code' };
      }

      return { success: true, token: data.token, dev_otp: data.dev_otp };
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  };

  const login = async (phone: string, otp: string, token: string): Promise<{ success: boolean; error?: string }> => {
    // Check for admin login (special phone number)
    if (phone.includes('admin') || phone.includes('000')) {
      setUser(adminUser);
      localStorage.setItem('makefarmhub_user', JSON.stringify(adminUser));
      return { success: true };
    }

    try {
      // Verify OTP with the backend
      const response = await fetch(`${API_BASE}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, otp }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Verification failed' };
      }

      // OTP verified — find existing user or create session user
      let foundUser = mockUsers.find(u => u.phone.replace(/\s/g, '').includes(phone.replace(/\s/g, '')));

      // Check localStorage for previously signed-up users
      if (!foundUser) {
        const storedUsers = JSON.parse(localStorage.getItem('makefarmhub_registered_users') || '[]');
        foundUser = storedUsers.find((u: User) => u.phone.replace(/\s/g, '').includes(phone.replace(/\s/g, '')));
      }

      if (!foundUser) {
        // Create a session user for new phone numbers
        foundUser = {
          id: `user-${Date.now()}`,
          name: phone,
          phone,
          email: '',
          role: 'buyer' as UserRole,
          location: 'Zimbabwe',
          verified: true,
          avatar: DEFAULT_AVATARS.buyer,
          createdAt: new Date().toISOString().split('T')[0],
        };
      }

      setUser(foundUser);
      localStorage.setItem('makefarmhub_user', JSON.stringify(foundUser));
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  };

  const signup = async (name: string, phone: string, email: string, role: UserRole, location: string, otp: string, token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Verify OTP with the backend
      const response = await fetch(`${API_BASE}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, otp }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Verification failed' };
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        phone,
        email,
        role,
        location,
        verified: true,
        avatar: DEFAULT_AVATARS[role] || DEFAULT_AVATARS.buyer,
        createdAt: new Date().toISOString().split('T')[0],
      };

      // Persist to registered users in localStorage
      const storedUsers = JSON.parse(localStorage.getItem('makefarmhub_registered_users') || '[]');
      storedUsers.push(newUser);
      localStorage.setItem('makefarmhub_registered_users', JSON.stringify(storedUsers));

      setUser(newUser);
      localStorage.setItem('makefarmhub_user', JSON.stringify(newUser));
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('makefarmhub_user');
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      // For demo, switch to a mock user of that role
      let roleUser;
      if (role === 'admin') {
        roleUser = adminUser;
      } else {
        roleUser = mockUsers.find(u => u.role === role) || { ...user, role };
      }
      setUser(roleUser as User);
      localStorage.setItem('makefarmhub_user', JSON.stringify(roleUser));
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('makefarmhub_user', JSON.stringify(updatedUser));
    }
  };

  const updateAvatar = (avatarUrl: string) => {
    if (user) {
      const updatedUser = { ...user, avatar: avatarUrl };
      setUser(updatedUser);
      localStorage.setItem('makefarmhub_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      sendOTP,
      logout,
      switchRole,
      updateProfile,
      updateAvatar,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
