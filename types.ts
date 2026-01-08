
export enum EducationLevel {
  PAUD = 'PAUD',
  SD = 'SD',
  SMP = 'SMP',
  SMA = 'SMA',
  SMK = 'SMK'
}

export enum LearningApproach {
  DEEP_LEARNING = 'Deep Learning',
  PBL = 'Project-Based Learning',
  IBL = 'Inquiry-Based Learning',
  DIFFERENTIATED = 'Differentiated Instruction'
}

export interface TP {
  id: string;
  cpId: string;
  statement: string;
  competency: string;
  content: string;
  bloomLevel: string;
}

export interface ATP {
  id: string;
  tpId: string;
  sequence: number;
  moduleName: string;
  durationJP: number;
  p3Elements: string[];
}

export interface ProtaItem {
  no: number;
  cp: string;
  atp: string;
  learningMaterial: string;
  totalJP: number;
  assessmentType: string;
}

export interface PromesItem {
  no: number;
  semester: 1 | 2;
  cp: string;
  atp: string;
  learningMaterial: string;
  jp: number;
  assessmentForm: string;
}

export interface CurriculumContext {
  level: EducationLevel;
  phase: string;
  subject: string;
  academicYear: string;
  effectiveWeeks: number;
  jpPerWeek: number;
  approach: LearningApproach;
}
