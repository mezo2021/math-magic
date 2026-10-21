export interface ChallengeData {
  playerName: string;
  score: number;
  puzzleId: string;
  timestamp: number;
}

export function createChallengeToken(data: ChallengeData): string {
  try {
    const jsonString = JSON.stringify(data);
    const encoded = btoa(unescape(encodeURIComponent(jsonString)));
    return encoded;
  } catch (e) {
    console.error("فشل في إنشاء رمز التحدي", e);
    return "";
  }
}

export function parseChallengeToken(token: string): ChallengeData | null {
  try {
    const decodedJson = decodeURIComponent(escape(atob(token)));
    const data: ChallengeData = JSON.parse(decodedJson);
    return data;
  } catch (e) {
    console.error("رمز تحدي غير صالح", e);
    return null;
  }
}