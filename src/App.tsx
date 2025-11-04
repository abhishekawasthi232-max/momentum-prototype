import React, { useState, createContext, useContext, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';
import Dashboard from './pages/Dashboard';
import FocusSession from './pages/FocusSession';

// Define types for our context
type AuthContextType = {
  user: User | null;
  loading: boolean;
  hasHabit: boolean;
};

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Main App Component
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasHabit, setHasHabit] = useState(false);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Check if user has already set up a habit
        const habitDocRef = doc(db, 'habits', currentUser.uid);
        const habitDocSnap = await getDoc(habitDocRef);
        if (habitDocSnap.exists()) {
          setHasHabit(true);
        } else {
          setHasHabit(false);
        }
      } else {
        setUser(null);
        setHasHabit(false);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading Momentum...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, hasHabit }}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        
        <Route path="/setup" element={
          <ProtectedRoute user={user} hasHabit={hasHabit} redirectTo="/dashboard">
            <SetupPage />
          </ProtectedRoute>
        } />
        
        <Route path="/focus" element={
          <ProtectedRoute user={user} hasHabit={hasHabit} redirectTo="/setup">
            <FocusSession />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={
          <ProtectedRoute user={user} hasHabit={hasHabit} redirectTo="/setup">
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
      </Routes>
    </AuthContext.Provider>
  );
}

// Protected Route Component
// This component checks if the user is logged in and has a habit
type ProtectedRouteProps = {
  user: User | null;
  hasHabit: boolean;
  redirectTo: string;
  children: React.ReactElement;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, hasHabit, redirectTo, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the route is for the main app (like / or /focus), but the user has no habit, redirect to /setup
  if (redirectTo === '/setup' && !hasHabit) {
    return <Navigate to="/setup" replace />;
  }
  
  // If the route is for /setup, but the user *already* has a habit, redirect to dashboard
  if (redirectTo === '/dashboard' && hasHabit) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default App;

// Helper hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};