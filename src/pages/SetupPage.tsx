// --- FILENAME: src/pages/SetupPage.tsx ---
import React, { useState } from 'react';
import { useAuth } from '../App';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Check } from 'lucide-react';

const SetupPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  // Form state
  const [habitName, setHabitName] = useState('');
  const [motivationWhy, setMotivationWhy] = useState('');
  const [urgency, setUrgency] = useState(5);
  const [reminderTime, setReminderTime] = useState('08:00');
  
  const [loading, setLoading] = useState(false);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    const habitData = {
      userId: user.uid,
      habitName,
      motivationWhy,
      urgency,
      reminderTime,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      createdAt: new Date().toISOString(),
    };

    try {
      // Use user's UID as the document ID for the habit
      await setDoc(doc(db, 'habits', user.uid), habitData);
      // Reload the page to force the AuthContext to re-check `hasHabit`
      window.location.href = '/'; 
    } catch (e) {
      console.error("Error adding document: ", e);
      setLoading(false);
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepContainer title="What habit will you build?">
            <input
              type="text"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="e.g., Read for 30 minutes"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
            <Button onClick={nextStep} disabled={!habitName}>Next</Button>
          </StepContainer>
        );
      case 2:
        return (
          <StepContainer title="Why is this important to you?">
            <textarea
              value={motivationWhy}
              onChange={(e) => setMotivationWhy(e.target.value)}
              placeholder="e.g., To learn new skills and relax..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
            <div className="flex gap-4">
              <Button onClick={prevStep} variant="secondary">Back</Button>
              <Button onClick={nextStep} disabled={!motivationWhy}>Next</Button>
            </div>
          </StepContainer>
        );
      case 3:
        return (
          <StepContainer title="How crucial is this right now?">
            <label className="block text-4xl font-bold text-center text-white mb-4">{urgency}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={urgency}
              onChange={(e) => setUrgency(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex gap-4">
              <Button onClick={prevStep} variant="secondary">Back</Button>
              <Button onClick={nextStep}>Next</Button>
            </div>
          </StepContainer>
        );
      case 4:
        return (
          <StepContainer title="What time for your daily reminder?">
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white [color-scheme:dark]"
            />
            <div className="flex gap-4">
              <Button onClick={prevStep} variant="secondary">Back</Button>
              <Button onClick={handleSubmit} disabled={loading} Icon={Check}>
                {loading ? 'Saving...' : 'Finish Setup'}
              </Button>
            </div>
          </StepContainer>
        );
      default:
        return <div>Error</div>;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {renderStep()}
      </div>
    </div>
  );
};

// --- Helper Components for SetupPage ---

const StepContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-gray-800 rounded-lg shadow-xl p-8 animate-fade-in">
    <h2 className="text-2xl font-bold text-center text-white mb-6">{title}</h2>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const Button: React.FC<{ 
  onClick: () => void; 
  disabled?: boolean; 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary';
  Icon?: React.ElementType;
}> = ({ onClick, disabled, children, variant = 'primary', Icon }) => {
  
  const baseStyle = "w-full font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center gap-2";
  
  const styles = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-500",
    secondary: "bg-gray-600 hover:bg-gray-500 text-white"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${styles[variant]}`}
    >
      {children}
      {Icon && <Icon className="w-5 h-5" />}
    </button>
  );
};

export default SetupPage;