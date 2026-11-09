"use client";

import { create } from "zustand";
import { hiringApi, GetOffersParams } from "@/lib/api/hiring";
import type {
  Offer,
  Engagement,
  CreateHireOfferRequest,
  OfferResponse,
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

  setSelectedOffer: (offer) => set({ selectedOffer: offer }),
  setSelectedEngagement: (engagement) => set({ selectedEngagement: engagement }),
  clearError: () => set({ error: null }),
}));

