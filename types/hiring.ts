export type ApplicationStatus =
  | "pending"
  | "submitted"
  | "matched"
  | "shortlisted"
  | "selected"
  | "offer_pending"
  | "offer_accepted"
  | "contract_pending"
  | "hired"
  | "offer_declined"
  | "contract_expired"
  | "on_hold"
  | "rejected";

export type OfferStatus =
  | "pending_admin_approval"
  | "approved"
  | "rejected"
  | "accepted"
  | "declined"
  | "cancelled";

export type ContractStatus =
  | "draft"
  | "sent"
  | "signed"
  | "declined"
  | "expired"
  | "voided";

export type EngagementStatus =
  | "active"
  | "paused"
  | "terminated"
  | "completed";

export type BillingCycle = "weekly" | "biweekly" | "monthly";

export interface CreateHireOfferRequest {
  role: string;
  startDate: string;
  endDate?: string;
  duration?: string;
  employerBillingRate: number;
  jobSeekerPayoutRate: number;
  currency?: string;
  billingCycle?: BillingCycle;
  terms?: string;
}

export interface ContractReference {
  _id?: string;
  id?: string;
  type?: "client_agreement" | "contractor_agreement";
  status: ContractStatus;
  documentUrl?: string;
  documensoDocumentId?: string;
}

export interface UserPartySummary {
  _id: string;
  email: string;
  role?: string;
  fullName?: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    business_name?: string;
    company?: string;
    bio?: string | null;
    profile_image_url?: string | null;
    phone?: string | null;
    location?: string;
  };
}

export interface JobSummary {
  _id: string;
  title: string;
  location?: string;
  job_type?: string;
}

export interface Offer {
  _id: string;
  applicationId: string | any;
  jobId: string | JobSummary;
  employerId: string | UserPartySummary;
  jobSeekerId: string | UserPartySummary;
  role: string;
  startDate: string;
  endDate: string | null;
  duration: string | null;
  /**
   * Employer Billing Rate:
   * Visible ONLY to Employer and Admin.
   * Striped at API level and NEVER rendered in candidate views.
   */
  employerBillingRate?: number;
  /**
   * Candidate Payout Rate:
   * Visible ONLY to Candidate and Admin.
   * Striped at API level and NEVER rendered in employer views.
   */
  jobSeekerPayoutRate?: number;
  currency: string;
  billingCycle: BillingCycle;
  terms: string | null;
  status: OfferStatus;
  approvedBy?: string;
  rejectionReason?: string;
  declineReason?: string;
  clientContractId?: ContractReference;
  contractorContractId?: ContractReference;
  created_at: string;
  updated_at: string;
}

export interface EngagementRates {
  /**
   * Employer Billing Rate (present only for Employer & Admin)
   */
  employerBillingRate?: number;
  /**
   * Candidate Payout Rate (present only for Candidate & Admin)
   */
  jobSeekerPayoutRate?: number;
  currency: string;
}

export interface Engagement {
  _id: string;
  offerId?: string | Offer | any;
  applicationId?: string | any;
  employerId: UserPartySummary;
  jobSeekerId: UserPartySummary;
  role?: string;
  startDate: string;
  endDate: string | null;
  rates: EngagementRates;
  billingCycle: string;
  status: EngagementStatus;
  terminationReason?: string;
  terminatedAt?: string;
  terminatedBy?: string;
  clientContractId?: ContractReference;
  contractorContractId?: ContractReference;
  created_at: string;
  updated_at: string;
}

export interface OffersResponse {
  offers: Offer[];
}

export interface OfferResponse {
  message?: string;
  offer: Offer;
  contracts?: ContractReference[];
}

export interface EngagementsResponse {
  engagements: Engagement[];
}

export interface EngagementResponse {
  message?: string;
  engagement: Engagement;
}

