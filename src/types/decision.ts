export interface DecisionOption {
  id: string;
  name: string;
  tagline: string;
  recommended: boolean;
}

export interface TiebreakerVerdict {
  winningOptionName: string;
  decisiveFactor: string;
  rationale: string;
  keyConditionToFlip: string;
  reversibility: string;
}

export interface ProConItem {
  id: string;
  point: string;
  detail: string;
  impactWeight: number; // 1 to 10
  dimension: string;
  disabled?: boolean;
}

export interface OptionProsAndCons {
  optionName: string;
  pros: ProConItem[];
  cons: ProConItem[];
}

export interface CriterionOptionScore {
  optionName: string;
  score: number; // 1 to 10
  note: string;
}

export interface ComparisonCriterion {
  id: string;
  criterion: string;
  description: string;
  weight: number; // 1 to 5
  scores: CriterionOptionScore[];
}

export interface SwotEntry {
  title: string;
  detail: string;
  actionItem: string;
}

export interface SwotAnalysis {
  focalSubject: string;
  strengths: SwotEntry[];
  weaknesses: SwotEntry[];
  opportunities: SwotEntry[];
  threats: SwotEntry[];
}

export interface StressTestResult {
  id: string;
  scenarioPrompt: string;
  doesVerdictFlip: boolean;
  newWinningOption: string;
  impactAnalysis: string;
  adjustedCriteriaNote: string;
  timestamp: string;
}

export interface DecisionAnalysis {
  id: string;
  createdAt: string;
  prompt: string;
  context?: string;
  title: string;
  category: string;
  summary: string;
  options: DecisionOption[];
  tiebreakerVerdict: TiebreakerVerdict;
  prosAndCons: OptionProsAndCons[];
  comparisonTable: {
    criteria: ComparisonCriterion[];
  };
  swot: SwotAnalysis;
  stressTests?: StressTestResult[];
}

export type ActiveFrameworkTab = 'all' | 'pros-cons' | 'comparison' | 'swot';
