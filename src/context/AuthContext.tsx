import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { mockUsers, adminUser } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<boolean>;
  signup: (name: string, phone: string, email: string, role: UserRole, location: string) => Promise<boolean>;
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
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, _otp: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check for admin login (special phone number)
    if (phone.includes('admin') || phone.includes('000')) {
      setUser(adminUser);
      localStorage.setItem('makefarmhub_user', JSON.stringify(adminUser));
      return true;
    }
    
    // Find user by phone or create demo user
    let foundUser = mockUsers.find(u => u.phone.replace(/\s/g, '').includes(phone.replace(/\s/g, '')));
    
    if (!foundUser) {
      // For demo, use first farmer user
      foundUser = mockUsers[0];
    }
    
    setUser(foundUser);
    localStorage.setItem('makefarmhub_user', JSON.stringify(foundUser));
    return true;
  };

  const signup = async (name: string, phone: string, email: string, role: UserRole, location: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      phone,
      email,
      role,
      location,
      verified: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    setUser(newUser);
    localStorage.setItem('makefarmhub_user', JSON.stringify(newUser));
    return true;
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
