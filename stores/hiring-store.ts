"use client";

import { create } from "zustand";
import { hiringApi, GetOffersParams } from "@/lib/api/hiring";
import type {
  Offer,
  Engagement,
  CreateHireOfferRequest,
  OfferResponse,
  ContractSummary,
  ResendContractsPayload,
  ResendContractsResponse,
} from "@/types/hiring";
import toast from "react-hot-toast";

interface HiringState {
  offers: Offer[];
  engagements: Engagement[];
  selectedOffer: Offer | null;
  selectedEngagement: Engagement | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOffers: (params?: GetOffersParams) => Promise<Offer[]>;
  fetchOfferById: (id: string) => Promise<Offer | null>;
  fetchEngagements: (params?: Record<string, any>) => Promise<Engagement[]>;
  fetchEngagementById: (id: string) => Promise<Engagement | null>;

  createHireOffer: (
    applicationId: string,
    payload: CreateHireOfferRequest
  ) => Promise<OfferResponse>;

  candidateAcceptOffer: (offerId: string) => Promise<OfferResponse>;
  candidateDeclineOffer: (offerId: string, reason?: string) => Promise<OfferResponse>;

  adminApproveOffer: (offerId: string) => Promise<OfferResponse>;
  adminRejectOffer: (offerId: string, reason: string) => Promise<OfferResponse>;
  adminTerminateEngagement: (
    engagementId: string,
    reason: string
  ) => Promise<void>;

  resendOfferContracts: (
    offerId: string,
    payload?: ResendContractsPayload
  ) => Promise<ResendContractsResponse>;

  resendContract: (
    contractId: string,
    offerId?: string
  ) => Promise<{ message: string; contract: ContractSummary }>;

  setSelectedOffer: (offer: Offer | null) => void;
  setSelectedEngagement: (engagement: Engagement | null) => void;
  clearError: () => void;
}

export const useHiringStore = create<HiringState>((set, get) => ({
  offers: [],
  engagements: [],
  selectedOffer: null,
  selectedEngagement: null,
  isLoading: false,
  error: null,

  fetchOffers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await hiringApi.getOffers(params);
      const offers = response.offers || [];
      set({ offers, isLoading: false });
      return offers;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load offers";
      set({ error: msg, isLoading: false });
      return [];
    }
  },

  fetchOfferById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await hiringApi.getOfferById(id);
      const offer = response.offer;
      set({ selectedOffer: offer, isLoading: false });
      return offer;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load offer details";
      set({ error: msg, isLoading: false });
      return null;
    }
  },

  fetchEngagements: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await hiringApi.getEngagements(params);
      const engagements = response.engagements || [];
      set({ engagements, isLoading: false });
      return engagements;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load engagements";
      set({ error: msg, isLoading: false });
      return [];
    }
  },

  fetchEngagementById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await hiringApi.getEngagementById(id);
      const engagement = response.engagement;
      set({ selectedEngagement: engagement, isLoading: false });
      return engagement;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load engagement details";
      set({ error: msg, isLoading: false });
      return null;
    }
  },

  createHireOffer: async (applicationId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await hiringApi.createHireOffer(applicationId, payload);
      toast.success(response.message || "Hire offer created successfully!");
      if (response.offer) {
        set((state) => ({
          offers: [response.offer, ...state.offers.filter((o) => o._id !== response.offer._id)],
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
      return response;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create hire offer";
      toast.error(msg);
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  candidateAcceptOffer: async (offerId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await hiringApi.candidateAcceptOffer(offerId);
      toast.success(response.message || "Offer accepted! Legal contracts dispatched.");
      if (response.offer) {
        set((state) => ({
          offers: state.offers.map((o) =>
            o._id === offerId ? { ...o, ...response.offer } : o
          ),
          selectedOffer:
            state.selectedOffer?._id === offerId
              ? { ...state.selectedOffer, ...response.offer }
              : state.selectedOffer,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
      return response;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to accept offer";
      toast.error(msg);
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  candidateDeclineOffer: async (offerId, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await hiringApi.candidateDeclineOffer(offerId, reason);
      toast.success(response.message || "Offer declined");
      if (response.offer) {
        set((state) => ({
          offers: state.offers.map((o) =>
            o._id === offerId ? { ...o, ...response.offer } : o
          ),
          selectedOffer:
            state.selectedOffer?._id === offerId
              ? { ...state.selectedOffer, ...response.offer }
              : state.selectedOffer,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
      return response;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to decline offer";
      toast.error(msg);
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  adminApproveOffer: async (offerId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await hiringApi.adminApproveOffer(offerId);
      toast.success(response.message || "Offer approved and released to candidate");
      if (response.offer) {
        set((state) => ({
          offers: state.offers.map((o) =>
            o._id === offerId ? { ...o, ...response.offer } : o
          ),
          selectedOffer:
            state.selectedOffer?._id === offerId
              ? { ...state.selectedOffer, ...response.offer }
              : state.selectedOffer,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
      return response;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to approve offer";
      toast.error(msg);
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  adminRejectOffer: async (offerId, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await hiringApi.adminRejectOffer(offerId, reason);
      toast.success(response.message || "Offer rejected");
      if (response.offer) {
        set((state) => ({
          offers: state.offers.map((o) =>
            o._id === offerId ? { ...o, ...response.offer } : o
          ),
          selectedOffer:
            state.selectedOffer?._id === offerId
              ? { ...state.selectedOffer, ...response.offer }
              : state.selectedOffer,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
      return response;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to reject offer";
      toast.error(msg);
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  adminTerminateEngagement: async (engagementId, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await hiringApi.adminTerminateEngagement(engagementId, reason);
      toast.success(response.message || "Engagement terminated successfully");
      if (response.engagement) {
        set((state) => ({
          engagements: state.engagements.map((e) =>
            e._id === engagementId ? { ...e, ...response.engagement } : e
          ),
          selectedEngagement:
            state.selectedEngagement?._id === engagementId
              ? { ...state.selectedEngagement, ...response.engagement }
              : state.selectedEngagement,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to terminate engagement";
      toast.error(msg);
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  resendOfferContracts: async (offerId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await hiringApi.resendOfferContracts(offerId, payload);
      toast.success(
        response.message || "Contracts resent successfully! Updated signing links emailed to parties."
      );

      const clientSummary = response.contracts?.find((c) => c.type === "client_agreement");
      const contractorSummary = response.contracts?.find((c) => c.type === "contractor_agreement");

      set((state) => {
        const mergeContractsIntoOffer = (baseOffer: Offer): Offer => {
          const updated = { ...baseOffer, ...(response.offer || {}) };
          if (clientSummary) {
            updated.clientContractId = {
              ...(typeof updated.clientContractId === "object" ? updated.clientContractId : {}),
              id: clientSummary.id,
              _id: clientSummary.id,
              type: "client_agreement",
              documensoDocumentId: clientSummary.documensoDocumentId,
              externalId: clientSummary.externalId,
              status: clientSummary.status,
              signedAt: clientSummary.signedAt,
              documentUrl: clientSummary.documentUrl,
            };
          }
          if (contractorSummary) {
            updated.contractorContractId = {
              ...(typeof updated.contractorContractId === "object" ? updated.contractorContractId : {}),
              id: contractorSummary.id,
              _id: contractorSummary.id,
              type: "contractor_agreement",
              documensoDocumentId: contractorSummary.documensoDocumentId,
              externalId: contractorSummary.externalId,
              status: contractorSummary.status,
              signedAt: contractorSummary.signedAt,
              documentUrl: contractorSummary.documentUrl,
            };
          }
          return updated;
        };

        return {
          offers: state.offers.map((o) =>
            o._id === offerId ? mergeContractsIntoOffer(o) : o
          ),
          selectedOffer:
            state.selectedOffer?._id === offerId
              ? mergeContractsIntoOffer(state.selectedOffer)
              : state.selectedOffer,
          isLoading: false,
        };
      });
      return response;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to resend contracts";
      toast.error(msg);
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  resendContract: async (contractId, offerId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await hiringApi.resendContract(contractId);
      toast.success(
        response.message || "Contract resent successfully! Updated signing link emailed."
      );
      const updatedContract = response.contract;

      set((state) => {
        const patchContract = (baseOffer: Offer): Offer => {
          const updated = { ...baseOffer };
          const clientMatch =
            (updated.clientContractId as any)?._id === contractId ||
            updated.clientContractId?.id === contractId ||
            (typeof updated.clientContractId === "string" && updated.clientContractId === contractId) ||
            updatedContract?.type === "client_agreement";

          const contractorMatch =
            (updated.contractorContractId as any)?._id === contractId ||
            updated.contractorContractId?.id === contractId ||
            (typeof updated.contractorContractId === "string" && updated.contractorContractId === contractId) ||
            updatedContract?.type === "contractor_agreement";

          if (updatedContract?.type === "client_agreement" || (clientMatch && !contractorMatch)) {
            updated.clientContractId = {
              ...(typeof updated.clientContractId === "object" ? updated.clientContractId : {}),
              id: updatedContract.id,
              _id: updatedContract.id,
              type: "client_agreement",
              documensoDocumentId: updatedContract.documensoDocumentId,
              externalId: updatedContract.externalId || updated.clientContractId?.externalId,
              status: updatedContract.status,
              signedAt: updatedContract.signedAt,
              documentUrl: updatedContract.documentUrl || updated.clientContractId?.documentUrl,
            };
          } else if (updatedContract?.type === "contractor_agreement" || (contractorMatch && !clientMatch)) {
            updated.contractorContractId = {
              ...(typeof updated.contractorContractId === "object" ? updated.contractorContractId : {}),
              id: updatedContract.id,
              _id: updatedContract.id,
              type: "contractor_agreement",
              documensoDocumentId: updatedContract.documensoDocumentId,
              externalId: updatedContract.externalId || updated.contractorContractId?.externalId,
              status: updatedContract.status,
              signedAt: updatedContract.signedAt,
              documentUrl: updatedContract.documentUrl || updated.contractorContractId?.documentUrl,
            };
          }
          return updated;
        };

        return {
          offers: state.offers.map((o) =>
            (offerId && o._id === offerId) ||
            (o.clientContractId as any)?._id === contractId ||
            o.clientContractId?.id === contractId ||
            (o.contractorContractId as any)?._id === contractId ||
            o.contractorContractId?.id === contractId
              ? patchContract(o)
              : o
          ),
          selectedOffer: state.selectedOffer ? patchContract(state.selectedOffer) : null,
          isLoading: false,
        };
      });
      return response;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to resend contract";
      toast.error(msg);
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  setSelectedOffer: (offer) => set({ selectedOffer: offer }),
  setSelectedEngagement: (engagement) => set({ selectedEngagement: engagement }),
  clearError: () => set({ error: null }),
}));

