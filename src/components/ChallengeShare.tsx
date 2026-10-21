'use client';
import React, { useState } from 'react';
import { createChallengeToken } from '@/lib/challenge';

interface Props {
  playerName: string;
  score: number;
  puzzleId: string;
}

export default function ChallengeShare({ playerName, score, puzzleId }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const token = createChallengeToken({
      playerName,
      score,
      puzzleId,
      timestamp: Date.now(),
    });

    // استبدل هذا بالمسار الصحيح إذا تغير
    const appUrl = "https://mezo2021.github.io/math-magic"; 
    const challengeUrl = `${appUrl}/?challenge=${token}`;
    const shareText = `🧠 تحدي سحر الرياضيات!\nلقد حققت ${score} نقطة! هل تستطيع التغلب عليّ؟ 🏆\n\nاضغط على الرابط لقبول التحدي:\n${challengeUrl}`;

    if (navigator.share) {
      navigator.share({
        title: 'تحدي سحر الرياضيات',
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 my-4">
      <button
        onClick={handleShare}
        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
      >
        <span>📲 تحدَّ صديقاً عبر الواتساب</span>
      </button>
      {copied && <span className="text-sm text-green-400">تم نسخ رابط التحدي للحافظة! 📋</span>}
    </div>
  );
}