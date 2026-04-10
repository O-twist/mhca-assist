import { Patient } from '../types';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface RiskResult {
  score: number;
  level: RiskLevel;
  color: string;
}

/**
 * Mock Risk Engine for MHCAssist.
 * In production, this would be a trained model or a complex clinical scoring system.
 */
export const calculateRiskScore = (patient: any): RiskResult => {
  let score = 0;

  // Rule-based scoring (Mock)
  
  // 1. Observation Time (Higher risk if closer to deadline)
  const now = Date.now();
  const deadline = new Date(patient.observationDeadline?.toDate?.() || patient.observationDeadline).getTime();
  const timeLeft = deadline - now;
  const hoursLeft = timeLeft / (1000 * 60 * 60);

  if (hoursLeft < 12) score += 3;
  else if (hoursLeft < 24) score += 2;
  else if (hoursLeft < 48) score += 1;

  // 2. Status
  if (patient.status === 'awaiting_review') score += 2;
  
  // 3. Mock clinical indicators (randomized for demo)
  const hash = patient.mhcaId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  score += (hash % 5);

  // Cap score at 10
  score = Math.min(score, 10);

  let level: RiskLevel = 'Low';
  let color = 'text-green-500 bg-green-50';

  if (score >= 7) {
    level = 'High';
    color = 'text-red-500 bg-red-50';
  } else if (score >= 4) {
    level = 'Medium';
    color = 'text-amber-500 bg-amber-50';
  }

  return { score, level, color };
};

export const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 7) return 'High';
  if (score >= 4) return 'Medium';
  return 'Low';
};
