// --- FILENAME: src/pages/FocusSession.tsx ---
import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Phone, CheckCircle } from 'lucide-react';

const FocusSession = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [motivation, setMotivation] = useState('');
  const [timer, setTimer] = useState(0);

  // Start timer on mount
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch motivation on mount
  useEffect(() => {
    if (!user) return;
    const fetchMotivation = async () => {
      const docRef = doc(db, 'habits', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMotivation(docSnap.data().motivationWhy);
      }
    };
    fetchMotivation();
  }, [user]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleComplete = async () => {
    if (!user) return;

    try {
      const habitDocRef = doc(db, 'habits', user.uid);
      const habitDocSnap = await getDoc(habitDocRef);

      if (habitDocSnap.exists()) {
        const data = habitDocSnap.data();
        let newStreak = data.currentStreak;
        let newLongestStreak = data.longestStreak;
        
        // Check if last completed was yesterday to continue streak
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let shouldIncrementStreak = true;
        
        if (data.lastCompletedDate) {
            const lastCompleted = data.lastCompletedDate.toDate();
            // If last completed was *not* yesterday (and not today), reset streak
            if (lastCompleted.toDateString() !== yesterday.toDateString() && 
                lastCompleted.toDateString() !== today.toDateString()) {
              newStreak = 0;
            }
            // If already completed today, don't increment
            if (lastCompleted.toDateString() === today.toDateString()) {
                shouldIncrementStreak = false;
            }
        }
        
        if (shouldIncrementStreak) {
            newStreak += 1;
        }

        if (newStreak > newLongestStreak) {
          newLongestStreak = newStreak;
        }

        await updateDoc(habitDocRef, {
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastCompletedDate: Timestamp.now(),
        });
      }
      navigate('/');
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col z-50">
      {/* Emergency Call Header */}
      <div className="w-full bg-gray-800 p-4 flex items-center justify-center gap-2">
        <Phone className="w-5 h-5 text-green-400" />
        <span className="text-gray-300">Calling features are active.</span>
      </div>

      {/* Main Focus Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-6xl md:text-8xl font-bold mb-8">
          {formatTime(timer)}
        </h1>
        
        <p className="text-lg text-gray-400 mb-4">Your "Why":</p>
        <p className="text-2xl md:text-3xl italic max-w-2xl mb-12">
          "{motivation || 'Loading...'}"
        </p>

        <button
          onClick={handleComplete}
          className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-full text-2xl transition duration-300 ease-in-out shadow-lg"
        >
          <CheckCircle className="w-8 h-8" />
          <span>I've Completed My Habit</span>
        </button>
      </div>
    </div>
  );
};

export default FocusSession;