export interface ConsultationDetails {
  encryptedQuestion: string;
  encryptedResponse: string;
  timestamp: string;
  fee: string;
  isResolved: boolean;
  isPaid: boolean;
}

export interface LawyerProfile {
  consultationCount: bigint;
  isVerified: boolean;
  isActive: boolean;
}

export interface ClientStats {
  totalConsultations: bigint;
  totalSpent: bigint;
}

export interface SystemStats {
  totalConsultations: bigint;
  totalLawyers: bigint;
  verifiedLawyers: bigint;
}

export interface LegalCategory {
  id: number;
  name: string;
}
