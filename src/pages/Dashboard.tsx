import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db, auth } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Target, LogOut } from 'lucide-react';
import Rewards from '../components/Rewards';

type HabitData = {
  habitName: string;
  motivationWhy: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: any;
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [habitData, setHabitData] = useState<HabitData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchHabit = async () => {
      const docRef = doc(db, 'habits', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setHabitData(docSnap.data() as HabitData);
      }
      setLoading(false);
    };

    fetchHabit();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleStartFocus = () => {
    navigate('/focus');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!habitData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">No habit data found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Momentum</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-8 h-8 text-blue-400" />
            <h2 className="text-3xl font-bold">{habitData.habitName}</h2>
          </div>

          <p className="text-gray-400 italic mb-6">"{habitData.motivationWhy}"</p>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-400 mb-2">
                {habitData.currentStreak}
              </div>
              <div className="text-gray-400">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-400 mb-2">
                {habitData.longestStreak}
              </div>
              <div className="text-gray-400">Longest Streak</div>
            </div>
          </div>

          <button
            onClick={handleStartFocus}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition duration-300 ease-in-out"
          >
            Start Focus Session
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Weekly Rewards</h3>
          <Rewards currentStreak={habitData.currentStreak} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
