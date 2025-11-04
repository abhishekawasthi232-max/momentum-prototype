// --- FILENAME: src/components/Rewards.tsx ---
import React from 'react';
import { Gift, Lock } from 'lucide-react';

type RewardsProps = {
  currentStreak: number;
};

const Rewards: React.FC<RewardsProps> = ({ currentStreak }) => {
  const week = Math.floor(currentStreak / 7);
  const daysLeft = 7 - (currentStreak % 7);

  if (currentStreak > 0 && currentStreak % 7 === 0) {
    // Exactly on a reward day
    return (
      <div className="text-center">
        <Gift className="w-10 h-10 text-yellow-400 mb-3 mx-auto" />
        <span className="text-4xl font-bold text-yellow-400">Week {week} Reward!</span>
        <span className="text-gray-400 block">You can claim it now!</span>
        <button className="mt-2 text-sm bg-yellow-500 text-black font-bold py-1 px-3 rounded">
          Claim
        </button>
      </div>
    );
  }

  // In between rewards
  return (
    <div className="text-center">
      <Lock className="w-10 h-10 text-gray-500 mb-3 mx-auto" />
      <span className="text-3xl font-bold">Week {week + 1} Reward</span>
      <span className="text-gray-400 block">
        {daysLeft} {daysLeft === 1 ? 'day' : 'days'} to go
      </span>
    </div>
  );
};

export default Rewards;
