/**
 * ==========================================
 * 📂 المسار: src/components/ChallengeShare.tsx
 * ⚙️ الوظيفة: زر مشاركة التحدي عبر تطبيقات الهاتف (WhatsApp, Telegram) أو نسخ الرابط.
 * 📅 تاريخ التعديل: 2026-07-24
 * 🛠️ التعديلات: 
 * - استقبال اللغة (lang) كخاصية لدعم الترجمة.
 * - استخدام دالة share_message من ملف i18n.
 * ==========================================
 */

'use client';
import React, { useState } from 'react';
import { createChallengeToken } from '@/lib/challenge';
import { translations } from '@/lib/i18n';

interface Props {
  playerName: string;
  score: number;
  puzzleId: string;
  lang: 'ar' | 'en'; // 🆕 إضافة اللغة
}

export default function ChallengeShare({ playerName, score, puzzleId, lang }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const token = createChallengeToken({
      playerName,
      score,
      puzzleId,
      timestamp: Date.now(),
    });

    const appUrl = "https://mezo2021.github.io/math-magic"; 
    const challengeUrl = `${appUrl}/?challenge=${token}`;
    
    // استخدام النص المترجم
    const shareText = translations[lang].share_message(score, challengeUrl);
    const shareTitle = lang === 'ar' ? 'تحدي سحر الرياضيات' : 'Math Magic Challenge';

    if (navigator.share) {
      navigator.share({
        title: shareTitle,
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
        <span>{lang === 'ar' ? '📲 تحدَّ صديقاً عبر الواتساب' : '📲 Challenge a friend'}</span>
      </button>
      {copied && (
        <span className="text-sm text-green-400">
          {lang === 'ar' ? 'تم نسخ رابط التحدي للحافظة! 📋' : 'Challenge link copied! 📋'}
        </span>
      )}
    </div>
  );
}