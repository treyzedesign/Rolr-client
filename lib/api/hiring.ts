import { apiClient } from "./client";
import type {
  CreateHireOfferRequest,
  Offer,
  OffersResponse,
  OfferResponse,
  Engagement,
  EngagementsResponse,
  EngagementResponse,
  ContractSummary,
  ResendContractsPayload,
  ResendContractsResponse,
} from "@/types/hiring";

export interface GetOffersParams {
  status?: string;
  applicationId?: string;
  employerId?: string;
  jobSeekerId?: string;
}

export const hiringApi = {
  // --- Employer Endpoints ---
  createHireOffer: async (
    applicationId: string,
    payload: CreateHireOfferRequest
  ): Promise<OfferResponse> => {
    const response = await apiClient.post<OfferResponse>(
      `/employer/applications/${applicationId}/hire`,
      payload
    );
    return response.data;
  },

  // --- Candidate Endpoints ---
  candidateAcceptOffer: async (offerId: string): Promise<OfferResponse> => {
    const response = await apiClient.post<OfferResponse>(
      `/candidate/offers/${offerId}/accept`,
      {}
    );
    return response.data;
  },

  candidateDeclineOffer: async (
    offerId: string,
    reason?: string
  ): Promise<OfferResponse> => {
    const response = await apiClient.post<OfferResponse>(
      `/candidate/offers/${offerId}/decline`,
      { reason }
    );
    return response.data;
  },

  // --- Admin Endpoints ---
  adminApproveOffer: async (offerId: string): Promise<OfferResponse> => {
    const response = await apiClient.patch<OfferResponse>(
      `/admin/offers/${offerId}/approve`,
      {}
    );
    return response.data;
  },

  adminRejectOffer: async (
    offerId: string,
    reason: string
  ): Promise<OfferResponse> => {
    const response = await apiClient.patch<OfferResponse>(
      `/admin/offers/${offerId}/reject`,
      { reason }
    );
    return response.data;
  },

  adminTerminateEngagement: async (
    engagementId: string,
    terminationReason: string
  ): Promise<EngagementResponse> => {
    const response = await apiClient.post<EngagementResponse>(
      `/admin/engagements/${engagementId}/terminate`,
      { terminationReason }
    );
    return response.data;
  },

  resendOfferContracts: async (
    offerId: string,
    payload?: ResendContractsPayload
  ): Promise<ResendContractsResponse> => {
    const response = await apiClient.post<ResendContractsResponse>(
      `/admin/offers/${offerId}/resend-contracts`,
      payload || { contractType: "both" }
    );
    return response.data;
  },

  resendContract: async (
    contractId: string
  ): Promise<{ message: string; contract: ContractSummary }> => {
    const response = await apiClient.post<{ message: string; contract: ContractSummary }>(
      `/admin/contracts/${contractId}/resend`
    );
    return response.data;
  },

  // --- Shared / Role-Scoped Get Endpoints ---
  getOffers: async (params?: GetOffersParams): Promise<OffersResponse> => {
    const response = await apiClient.get<OffersResponse>("/offers", {
      params,
    });
    return response.data;
  },

  getOfferById: async (offerId: string): Promise<OfferResponse> => {
    const response = await apiClient.get<OfferResponse>(`/offers/${offerId}`);
    return response.data;
  },

  getEngagements: async (
    params?: Record<string, any>
  ): Promise<EngagementsResponse> => {
    const response = await apiClient.get<EngagementsResponse>("/engagements", {
      params,
    });
    return response.data;
  },

  getEngagementById: async (
    engagementId: string
  ): Promise<EngagementResponse> => {
    const response = await apiClient.get<EngagementResponse>(
      `/engagements/${engagementId}`
    );
    return response.data;
  },
};

export async function resendOfferContracts(
  offerId: string,
  payload?: ResendContractsPayload
): Promise<ResendContractsResponse> {
  return hiringApi.resendOfferContracts(offerId, payload);
}

export async function resendContract(
  contractId: string
): Promise<{ message: string; contract: ContractSummary }> {
  return hiringApi.resendContract(contractId);
}

