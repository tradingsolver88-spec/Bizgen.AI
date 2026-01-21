
export interface BusinessIdea {
  id: string;
  name: string;
  description: string;
  targetMarket: string;
  estimatedBudget: string;
  firstSteps: string[];
  resources: string[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  revenueStreams: string[];
  generatedAt: string;
}

export interface UserPreferences {
  budgetRange: string;
  skills: string;
  industryInterest: string;
  location: string;
}

export interface User {
  name: string;
  email: string;
  password?: string;
  isAdmin: boolean;
  freeIdeasUsed: number; // Persistent tracking
  planType: 'free' | 'paid'; // Persistent plan type
  credits: number; // Premium credits
  isPaid: boolean;
  paymentStatus?: 'none' | 'pending' | 'approved';
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: string;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  amount: string;
}
