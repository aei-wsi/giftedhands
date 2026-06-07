export type ComfortRisk = 'Low' | 'Moderate' | 'High';
export type CheckInStatus = 'Pending' | 'Arrived' | 'In Progress' | 'Completed' | 'Cancelled';
export type Availability = 'Available' | 'Busy' | 'Off';
export type SensoryCondition = 'Good' | 'Fair' | 'Cautious';
export type ChairReadiness = 'Yes' | 'Not Yet' | 'Need Decompression';
export type ReturnLikelihood = 'Yes' | 'Maybe' | 'Needs Follow-up';

export interface Caregiver {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface ECP {
  communicationStyle: string;
  primaryLanguage?: string;
  verbalAbility: string;
  sensoryAvoidances: string[];
  sensoryPreferences: string[];
  calmingStrategies: string[];
  transitionSupport: string;
  motivators: string[];
  triggers: string[];
  groomingHistory: string;
  visitGoals: string;
  emergencyContact?: string;
  medicalNotes?: string;
  staffNotes?: string;
}

export interface RES {
  lighting: string;
  soundLevel: string;
  chairType: string;
  calmingTools: string[];
  visuals: string;
  servicePacing: string;
  transitionTimeEstimate: string;
  doNotUseTriggers: string[];
  ssepRecommendation: string;
}

export interface ACC {
  appointmentId: string;
  timestamp: string;
  moodRating: number;
  changesSinceLastVisit: string;
  caregiverNotesToday: string;
  sensoryCondition: SensoryCondition;
  chairReadiness: ChairReadiness;
  recommendedDelayMinutes?: number;
  resUpdated: boolean;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  dateOfBirth: string;
  pronouns: string;
  comfortRisk: ComfortRisk;
  lastVisitDate?: string;
  tags: string[];
  isNewClient: boolean;
  photoUrl?: string;
  caregiver: Caregiver;
  ecp: ECP;
  res: RES;
}

export interface SSEP {
  id: string;
  name: string;
  role: string;
  skills: string[];
  availability: Availability;
  bio?: string;
  assignedAppointments?: string[];
}

export interface Appointment {
  id: string;
  clientId: string;
  ssepId: string;
  date: string;
  time: string;
  status: CheckInStatus;
  service: string;
  durationMinutes: number;
  acc?: ACC;
}

export interface PostVisitNote {
  id: string;
  appointmentId: string;
  clientId: string;
  whatWorked: string;
  whatDidntWork: string;
  triggersObserved: string[];
  calmingToolsUsed: string[];
  transitionSuccessRating: number;
  clientComfortRating: number;
  recommendedChanges: string;
  caregiverFeedback: string;
  likelyToReturn: ReturnLikelihood;
  timestamp: string;
}

export interface ICPSSubmission {
  basicInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    pronouns: string;
  };
  caregiverInfo: Caregiver;
  communicationAndSensory: {
    communicationStyle: string;
    verbalAbility: string;
    sensoryPreferences: string[];
  };
  sensitivitiesAndCalming: {
    sensoryAvoidances: string[];
    calmingStrategies: string[];
    triggers: string[];
  };
  groomingHistory: {
    groomingHistory: string;
    visitGoals: string;
    transitionSupport: string;
  };
  emergencyAndConsent: {
    emergencyContact: string;
    medicalNotes: string;
    consentGiven: boolean;
  };
}
