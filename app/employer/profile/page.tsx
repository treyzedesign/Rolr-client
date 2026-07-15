"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import type { EmployerProfile } from "@/types/profile";
import { Camera, Loader2, Bell, Edit3, Circle, Check, ChevronRight, ArrowRight } from "lucide-react";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { ImageViewerModal } from "@/components/ui/ImageViewerModal";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import toast from "react-hot-toast";

const INDUSTRIES = [
  "Technology",
  "Fintech",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Media & Entertainment",
  "Real Estate",
  "Transportation",
  "Energy",
  "Agriculture",
  "Government",
  "Non-profit",
  "Other",
];

const HIRING_TIMELINES = [
  { value: "immediate", label: "Immediate" },
  { value: "week_1", label: "Within 1 week" },
  { value: "week_2", label: "Within 2 weeks" },
  { value: "week_4", label: "Within 1 month" },
  { value: "flex", label: "Flexible" },
];

type EditingSection = "basic" | "company" | "contact" | "hiring" | null;

export default function EmployerProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, isLoading, fetchProfile, updateProfile, uploadImage } = useProfileStore();
  const employerProfile = profile as EmployerProfile;
  
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [formData, setFormData] = useState<Partial<EmployerProfile>>({});
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Setup Wizard step state (1: Company, 2: Contact, 3: Hiring, 4: Review)
  const [wizardStep, setWizardStep] = useState<number>(1);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (employerProfile) {
      setFormData(employerProfile);
    }
  }, [employerProfile]);

  useEffect(() => {
    // Read ?edit= query parameter from URL to set the active step directly
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const editParam = params.get("edit");
      if (editParam === "company") {
        setWizardStep(1);
      } else if (editParam === "contact") {
        setWizardStep(2);
      } else if (editParam === "hiring") {
        setWizardStep(3);
      }
    }
  }, []);

  const getChecklistData = () => {
    if (!employerProfile) {
      return {
        percentage: 0,
        incompleteCount: 3,
        items: [
          { id: "company", label: "Add Company Information", completed: false },
          { id: "contact", label: "Add Contact Information", completed: false },
          { id: "hiring", label: "Add Hiring Preference", completed: false },
        ]
      };
    }

    const items = [
      {
        id: "company",
        label: "Add Company Information",
        completed: !!((employerProfile.business_name || employerProfile.company) && employerProfile.industry && employerProfile.bio),
      },
      {
        id: "contact",
        label: "Add Contact Information",
        completed: !!(employerProfile.contact_person_name && employerProfile.contact_person_role && employerProfile.phone),
      },
      {
        id: "hiring",
        label: "Add Hiring Preference",
        completed: !!(employerProfile.expected_hiring_timeline && employerProfile.expected_hiring_timeline !== "" as any),
      },
    ];

    const completedCount = items.filter(item => item.completed).length;
    const percentage = Math.round((completedCount / items.length) * 100);
    const incompleteCount = items.length - completedCount;

    return { percentage, incompleteCount, items };
  };

  const { percentage, incompleteCount, items } = getChecklistData();

  const startEditingSection = (section: EditingSection) => {
    setEditingSection(section);
    if (employerProfile) {
      setFormData(employerProfile);
    }
  };

  const cancelEditing = () => {
    setEditingSection(null);
    if (employerProfile) {
      setFormData(employerProfile);
    }
  };

  const saveSection = async (section: EditingSection) => {
    if (!section) return;

    setIsSaving(true);
    try {
      let updateData: Partial<EmployerProfile> = {};
      
      switch (section) {
        case "basic":
          updateData = {
            business_name: formData.business_name,
            bio: formData.bio,
          };
          break;
        case "company":
          updateData = {
            industry: formData.industry,
            last_name: formData.last_name,
            phone: formData.phone,
            website_url: formData.website_url,
            cac_number: formData.cac_number,
          };
          break;
        case "contact":
          updateData = {
            contact_person_name: formData.contact_person_name,
            contact_person_role: formData.contact_person_role,
            phone: formData.phone,
          };
          break;
        case "hiring":
          updateData = {
            expected_hiring_timeline: formData.expected_hiring_timeline,
          };
          break;
      }

      await updateProfile(updateData);
      setEditingSection(null);
    } catch (error) {
      console.error("Failed to save section:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setShowCropModal(true);
    }
  };

  const handleImageCropComplete = async (croppedBlob: Blob) => {
    if (selectedImageFile) {
      setIsUploading(true);
      try {
        const croppedFile = new File([croppedBlob], selectedImageFile.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        await uploadImage(croppedFile);
        setShowCropModal(false);
        setSelectedImageFile(null);
      } catch (error) {
        console.error("Image upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleInputChange = (field: keyof EmployerProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAndExitWizard = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        business_name: formData.business_name,
        industry: formData.industry,
        bio: formData.bio,
        phone: formData.phone,
        website_url: formData.website_url,
        cac_number: formData.cac_number,
        contact_person_name: formData.contact_person_name,
        contact_person_role: formData.contact_person_role,
        expected_hiring_timeline: formData.expected_hiring_timeline,
      });
      toast.success("Progress saved successfully");
      router.push("/employer");
    } catch (error) {
      console.error("Failed to save progress:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWizardSubmit = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        business_name: formData.business_name,
        industry: formData.industry,
        bio: formData.bio,
        phone: formData.phone,
        website_url: formData.website_url,
        cac_number: formData.cac_number,
        contact_person_name: formData.contact_person_name,
        contact_person_role: formData.contact_person_role,
        expected_hiring_timeline: formData.expected_hiring_timeline,
      });
      // Clear query params
      window.history.replaceState({}, "", "/employer/profile");
      toast.success("Company profile completed successfully!");
      fetchProfile();
    } catch (error) {
      console.error("Failed to submit profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !employerProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const emailDisplay = user?.email || employerProfile?.contact_person_name || "pacetech@gmail.com";
  const businessNameDisplay = employerProfile?.business_name || "Pace Tech";

  // Check if profile setup is fully complete.
  // If not completed (percentage < 100), render the step setup wizard layout.
  const isProfileComplete = percentage === 100;

  if (!isProfileComplete) {
    return (
      <div className="space-y-8 pb-12">
        {/* Header section matching other employer portal workspaces */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between select-none">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Company Profile Setup
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Finish setting your profile to attract talents
            </p>
          </div>
          
          {/* Top-Right Profile Widgets */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
            </button>
            
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/45 dark:text-blue-300">
                {employerProfile?.profile_image_url ? (
                  <img 
                    src={employerProfile.profile_image_url} 
                    alt="avatar" 
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  businessNameDisplay.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                  {emailDisplay}
                </span>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Employer</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wizard Main Grid Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          
          {/* Left Column Checklist Progress Panel */}
          <div className="lg:col-span-5 rounded-xl border border-slate-100 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm space-y-6 select-none">
            {/* Checklist Title */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-display">
                Complete Your Profile
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Finish setting your profile to attract talents
              </p>
            </div>

            {/* Checklist Progress Title */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/60">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Profile ({percentage}%)
              </span>
              {incompleteCount > 0 && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                  {incompleteCount}
                </div>
              )}
            </div>

            {/* Checklist Steps Checklist list */}
            <div className="divide-y divide-slate-150/50 dark:divide-slate-800/60 border-t border-b border-slate-150/50 dark:border-slate-800/60">
              {items.map((item, index) => (
                item.completed ? (
                  <div key={item.id} className="flex items-center gap-3 py-4 select-none opacity-60">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white dark:bg-blue-500">
                      <Check className="h-3.5 w-3.5 stroke-[3px]" />
                    </div>
                    <span className="text-sm font-semibold line-through text-slate-450 dark:text-slate-550">
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => setWizardStep(index + 1)}
                    className="flex w-full items-center justify-between py-4 text-left text-slate-700 hover:text-blue-600 dark:text-slate-350 dark:hover:text-sky-400 group transition-all border-none bg-transparent cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Circle className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-blue-500" />
                      <span className="text-sm font-semibold">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Right Column Step Forms Wizard Card */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative">
            
            {/* Wizard Header Progress Bar segments */}
            <div className="flex gap-2 mb-6 select-none">
              <div className={`h-1.5 flex-1 rounded-full ${wizardStep >= 1 ? "bg-blue-500" : "bg-slate-100 dark:bg-slate-800"}`} />
              <div className={`h-1.5 flex-1 rounded-full ${wizardStep >= 2 ? "bg-blue-500" : "bg-slate-100 dark:bg-slate-800"}`} />
              <div className={`h-1.5 flex-1 rounded-full ${wizardStep >= 3 ? "bg-blue-500" : "bg-slate-100 dark:bg-slate-800"}`} />
            </div>

            {/* STEP 1: Company Information */}
            {wizardStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                    Company Information
                  </h3>
                </div>

                {/* Avatar upload center block */}
                <div className="flex justify-center py-2 select-none">
                  <div className="relative">
                    <div 
                      onClick={() => employerProfile?.profile_image_url && setShowImageViewer(true)}
                      className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-150/60 dark:border-slate-800 flex items-center justify-center overflow-hidden cursor-pointer shadow-sm hover:opacity-95 transition-opacity"
                    >
                      {employerProfile?.profile_image_url ? (
                        <img
                          src={employerProfile.profile_image_url}
                          alt={businessNameDisplay}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-[#2979ff] text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-sm border-2 border-white dark:border-slate-900">
                      <Camera className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </label>
                  </div>
                </div>

                {/* Industry Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400">
                    Industry
                  </label>
                  <select
                    value={formData.industry || ""}
                    onChange={(e) => handleInputChange("industry", e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                {/* Bio text block */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio || ""}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 h-28 resize-none"
                    placeholder="Input a detailed introduction about yourself..."
                  />
                </div>

                {/* Optional Fields Row (Phone, Website) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-655 dark:text-slate-400">
                      Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.phone || ""}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-655 dark:text-slate-400">
                      Website URL <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.website_url || ""}
                      onChange={(e) => handleInputChange("website_url", e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* CAC Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400">
                    CAC Registration Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cac_number || ""}
                    onChange={(e) => handleInputChange("cac_number", e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                {/* Step navigation controls */}
                <div className="flex gap-4 pt-4 select-none">
                  <button
                    onClick={handleSaveAndExitWizard}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 text-slate-600 rounded-xl px-4 py-3 text-xs font-bold transition-all bg-white dark:bg-slate-900 cursor-pointer text-center"
                  >
                    Save Changes & Exit
                  </button>
                  <button
                    onClick={() => {
                      if (!formData.industry || !formData.bio) {
                        toast.error("Please fill out both Industry and Bio to continue.");
                        return;
                      }
                      setWizardStep(2);
                    }}
                    className="flex-1 bg-[#2979ff] hover:bg-blue-600 text-white rounded-xl px-4 py-3 text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Contact Information */}
            {wizardStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                    Contact Information
                  </h3>
                </div>

                {/* Contact Person Name & Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-655 dark:text-slate-400">
                      Contact Person Name <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contact_person_name || ""}
                      onChange={(e) => handleInputChange("contact_person_name", e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-655 dark:text-slate-400">
                      Contact Person Role <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contact_person_role || ""}
                      onChange={(e) => handleInputChange("contact_person_role", e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400">
                    Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                {/* Step navigation controls */}
                <div className="flex gap-4 pt-4 select-none">
                  <button
                    onClick={handleSaveAndExitWizard}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 text-slate-600 rounded-xl px-4 py-3 text-xs font-bold transition-all bg-white dark:bg-slate-900 cursor-pointer text-center"
                  >
                    Save Changes & Exit
                  </button>
                  <button
                    onClick={() => {
                      if (!formData.contact_person_name || !formData.contact_person_role || !formData.phone) {
                        toast.error("Please fill out Contact Name, Contact Role, and Phone to continue.");
                        return;
                      }
                      setWizardStep(3);
                    }}
                    className="flex-1 bg-[#2979ff] hover:bg-blue-600 text-white rounded-xl px-4 py-3 text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Hiring Preference */}
            {wizardStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                    Hiring Preference
                  </h3>
                </div>

                {/* Expected Hiring Timeline */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400">
                    Expected Hiring Timeline
                  </label>
                  <select
                    value={formData.expected_hiring_timeline || ""}
                    onChange={(e) => handleInputChange("expected_hiring_timeline", e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  >
                    <option value="">Select timeline</option>
                    {HIRING_TIMELINES.map(timeline => (
                      <option key={timeline.value} value={timeline.value}>{timeline.label}</option>
                    ))}
                  </select>
                </div>

                {/* Step navigation controls */}
                <div className="flex gap-4 pt-4 select-none">
                  <button
                    onClick={() => {
                      if (!formData.expected_hiring_timeline) {
                        toast.error("Please choose a hiring timeline expected.");
                        return;
                      }
                      setWizardStep(4);
                    }}
                    className="w-full bg-[#2979ff] hover:bg-blue-600 text-white rounded-xl px-4 py-3 text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Review</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Review SUMMARY */}
            {wizardStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-855 dark:text-slate-100">
                    Review
                  </h3>
                </div>

                {/* Cards summaries */}
                <div className="space-y-4">
                  {/* Company Info Box */}
                  <div className="bg-[#fcfdfe] dark:bg-slate-855 p-4 rounded-xl border border-slate-100 dark:border-slate-800 relative select-none">
                    <div className="flex justify-between items-center pb-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Company Information</h4>
                      <button
                        onClick={() => setWizardStep(1)}
                        className="text-blue-500 text-[10px] font-bold bg-transparent border-none cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-655 dark:text-slate-400 space-y-1.5">
                      <div>Industry: <span className="text-slate-800 dark:text-slate-200">{formData.industry || "Not specified"}</span></div>
                      <div>Last Name: <span className="text-slate-800 dark:text-slate-200">{formData.last_name || "Not specified"}</span></div>
                      <div>Phone Number: <span className="text-slate-800 dark:text-slate-200">{formData.phone || "Not specified"}</span></div>
                      <div>Website: <span className="text-slate-800 dark:text-slate-200">{formData.website_url || "Not specified"}</span></div>
                      <div>CAC Registration: <span className="text-slate-800 dark:text-slate-200">{formData.cac_number || "Not specified"}</span></div>
                    </div>
                  </div>

                  {/* Contact Info Box */}
                  <div className="bg-[#fcfdfe] dark:bg-slate-855 p-4 rounded-xl border border-slate-100 dark:border-slate-800 relative select-none">
                    <div className="flex justify-between items-center pb-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Contact Information</h4>
                      <button
                        onClick={() => setWizardStep(2)}
                        className="text-blue-500 text-[10px] font-bold bg-transparent border-none cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-655 dark:text-slate-400 space-y-1.5">
                      <div>Contact Person: <span className="text-slate-800 dark:text-slate-200">{formData.contact_person_name || "Not specified"}</span></div>
                      <div>Contact Role: <span className="text-slate-800 dark:text-slate-200">{formData.contact_person_role || "Not specified"}</span></div>
                      <div>Phone Number: <span className="text-slate-800 dark:text-slate-200">{formData.phone || "Not specified"}</span></div>
                    </div>
                  </div>

                  {/* Hiring Preference Box */}
                  <div className="bg-[#fcfdfe] dark:bg-slate-855 p-4 rounded-xl border border-slate-100 dark:border-slate-800 relative select-none">
                    <div className="flex justify-between items-center pb-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Hiring Preference</h4>
                      <button
                        onClick={() => setWizardStep(3)}
                        className="text-blue-500 text-[10px] font-bold bg-transparent border-none cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-655 dark:text-slate-400">
                      Expected Hiring Timeline: <span className="text-slate-800 dark:text-slate-200">
                        {formData.expected_hiring_timeline 
                          ? HIRING_TIMELINES.find(t => t.value === formData.expected_hiring_timeline)?.label
                          : "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 select-none">
                  <button
                    onClick={handleWizardSubmit}
                    disabled={isSaving}
                    className="w-full bg-[#2979ff] hover:bg-blue-600 text-white rounded-xl px-4 py-3 text-xs font-bold transition-all border-none cursor-pointer text-center active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Submit</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Image Crop Modal */}
        {showCropModal && selectedImageFile && (
          <ImageCropModal
            imageFile={selectedImageFile}
            onCropComplete={handleImageCropComplete}
            onCancel={() => {
              setShowCropModal(false);
              setSelectedImageFile(null);
            }}
            isUploading={isUploading}
          />
        )}

        {/* Image Viewer Modal */}
        {showImageViewer && employerProfile?.profile_image_url && (
          <ImageViewerModal
            imageUrl={employerProfile.profile_image_url}
            alt={`${businessNameDisplay} Profile`}
            onClose={() => setShowImageViewer(false)}
          />
        )}
      </div>
    );
  }

  // Otherwise, render the completed view of Company Profile with cards
  return (
    <div className="space-y-8 pb-12">
      {/* Header section matching other employer portal workspaces */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between select-none">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Company Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your company information and hiring preferences
          </p>
        </div>
        
        {/* Top-Right Action Controls & Profile widgets */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
          </button>
          
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/45 dark:text-blue-300">
              {employerProfile?.profile_image_url ? (
                <img 
                  src={employerProfile.profile_image_url} 
                  alt="avatar" 
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                businessNameDisplay.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                {emailDisplay}
              </span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Employer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Info Card Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 rounded-[2rem] shadow-xl p-8 max-w-4xl mx-auto space-y-6 relative select-none">
        
        {/* Basic Header Block (Avatar, Business Name, Email) */}
        <div className="flex flex-col sm:flex-row items-center gap-6 relative group pb-4">
          {/* Circular Profile Avatar frame */}
          <div className="relative shrink-0">
            <div 
              onClick={() => employerProfile?.profile_image_url && setShowImageViewer(true)}
              className="h-24 w-24 rounded-full bg-blue-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden cursor-pointer shadow-md hover:opacity-95 transition-opacity"
            >
              {employerProfile?.profile_image_url ? (
                <img
                  src={employerProfile.profile_image_url}
                  alt={businessNameDisplay}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-blue-500 text-2xl font-bold">
                  {businessNameDisplay.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Camera Uploader trigger */}
            <label className="absolute bottom-0 right-0 bg-[#2979ff] text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-sm active:scale-95 border-2 border-white dark:border-slate-900">
              <Camera className="w-3.5 h-3.5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                onClick={(e) => e.stopPropagation()}
              />
            </label>
          </div>

          {/* Name & Email info */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            {editingSection === "basic" ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.business_name || ""}
                  onChange={(e) => handleInputChange("business_name", e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-200 font-bold outline-none focus:border-blue-500"
                  placeholder="Business Name"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-bold text-slate-850 dark:text-slate-100">
                  {businessNameDisplay}
                </h2>
                <button
                  onClick={() => startEditingSection("basic")}
                  className="text-slate-400 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-xs font-semibold text-slate-500 mt-1">{emailDisplay}</p>
          </div>
        </div>

        {/* Bio description text block */}
        <div className="pt-2 pb-6 border-b border-slate-100 dark:border-slate-800/80">
          {editingSection === "basic" ? (
            <div className="space-y-3">
              <textarea
                value={formData.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs font-semibold text-slate-655 dark:text-slate-350 outline-none focus:border-blue-500 h-24 resize-none"
                placeholder="Write a brief company bio description..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelEditing}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full px-4 py-1.5 text-[10px] font-bold border-none cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveSection("basic")}
                  className="bg-[#2979ff] hover:bg-blue-600 text-white rounded-full px-4 py-1.5 text-[10px] font-bold border-none cursor-pointer transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs font-semibold text-slate-655 dark:text-slate-350 leading-relaxed text-center sm:text-left">
              {employerProfile?.bio || ""}
            </p>
          )}
        </div>

        {/* Grid layout for Company Information, Contact, and Hiring Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Company Information */}
          <div className="bg-[#fcfdfe] dark:bg-slate-850 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 relative space-y-4">
            
            {/* Box Header */}
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">
                Company Information
              </h3>
              {editingSection !== "company" && (
                <button
                  onClick={() => startEditingSection("company")}
                  className="border border-blue-200 dark:border-blue-900/50 text-blue-500 dark:text-blue-400 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-855 rounded-full px-3 py-1 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {/* Fields List */}
            {editingSection === "company" ? (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                    Industry
                  </label>
                  <select
                    value={formData.industry || ""}
                    onChange={(e) => handleInputChange("industry", e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name || ""}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={formData.website_url || ""}
                    onChange={(e) => handleInputChange("website_url", e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                    CAC Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.cac_number || ""}
                    onChange={(e) => handleInputChange("cac_number", e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={cancelEditing}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-655 rounded-full px-4 py-1.5 text-[10px] font-bold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveSection("company")}
                    className="bg-[#2979ff] hover:bg-blue-600 text-white rounded-full px-4 py-1.5 text-[10px] font-bold border-none cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs font-semibold space-y-3.5">
                <div>
                  <span className="text-slate-450 dark:text-slate-550">Industry:</span>{" "}
                  <span className="text-slate-800 dark:text-slate-200">{employerProfile?.industry || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-slate-450 dark:text-slate-550">Last Name:</span>{" "}
                  <span className="text-slate-800 dark:text-slate-200">{employerProfile?.last_name || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-slate-450 dark:text-slate-550">Phone Number:</span>{" "}
                  <span className="text-slate-800 dark:text-slate-200">{employerProfile?.phone || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-slate-450 dark:text-slate-550">Website:</span>{" "}
                  {employerProfile?.website_url ? (
                    <a href={employerProfile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {employerProfile.website_url}
                    </a>
                  ) : (
                    <span className="text-slate-800 dark:text-slate-200">Not specified</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-450 dark:text-slate-550">CAC Registration Number:</span>{" "}
                  <span className="text-slate-800 dark:text-slate-200">{employerProfile?.cac_number || "Not specified"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Contact Information & Hiring Preferences */}
          <div className="space-y-6">
            
            {/* Contact Information Box */}
            <div className="bg-[#fcfdfe] dark:bg-slate-850 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 relative space-y-4">
              
              <div className="flex justify-between items-center pb-2">
                <h3 className="text-sm font-bold text-slate-855 dark:text-slate-100">
                  Contact Information
                </h3>
                {editingSection !== "contact" && (
                  <button
                    onClick={() => startEditingSection("contact")}
                    className="border border-blue-200 dark:border-blue-900/50 text-blue-500 dark:text-blue-400 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-855 rounded-full px-3 py-1 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {editingSection === "contact" ? (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-550 mb-1">
                      Contact Person Name
                    </label>
                    <input
                      type="text"
                      value={formData.contact_person_name || ""}
                      onChange={(e) => handleInputChange("contact_person_name", e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-550 mb-1">
                      Contact Person Role
                    </label>
                    <input
                      type="text"
                      value={formData.contact_person_role || ""}
                      onChange={(e) => handleInputChange("contact_person_role", e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-550 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone || ""}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={cancelEditing}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-655 rounded-full px-4 py-1.5 text-[10px] font-bold border-none cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveSection("contact")}
                      className="bg-[#2979ff] hover:bg-blue-600 text-white rounded-full px-4 py-1.5 text-[10px] font-bold border-none cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-semibold space-y-3.5">
                  <div>
                    <span className="text-slate-455 dark:text-slate-500">Contact Person Name:</span>{" "}
                    <span className="text-slate-800 dark:text-slate-200">{employerProfile?.contact_person_name || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-slate-455 dark:text-slate-500">Contact Person Role:</span>{" "}
                    <span className="text-slate-800 dark:text-slate-200">{employerProfile?.contact_person_role || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-slate-455 dark:text-slate-500">Phone Number:</span>{" "}
                    <span className="text-slate-800 dark:text-slate-200">{employerProfile?.phone || "Not specified"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Hiring Preferences Box */}
            <div className="bg-[#fcfdfe] dark:bg-slate-855 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 relative space-y-4">
              
              <div className="flex justify-between items-center pb-2">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">
                  Hiring Preference
                </h3>
                {editingSection !== "hiring" && (
                  <button
                    onClick={() => startEditingSection("hiring")}
                    className="border border-blue-200 dark:border-blue-900/50 text-blue-500 dark:text-blue-400 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-855 rounded-full px-3 py-1 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {editingSection === "hiring" ? (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-550 mb-1">
                      Expected Hiring Timeline
                    </label>
                    <select
                      value={formData.expected_hiring_timeline || ""}
                      onChange={(e) => handleInputChange("expected_hiring_timeline", e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                    >
                      <option value="">Select timeline</option>
                      {HIRING_TIMELINES.map(timeline => (
                        <option key={timeline.value} value={timeline.value}>{timeline.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={cancelEditing}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-655 rounded-full px-4 py-1.5 text-[10px] font-bold border-none cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveSection("hiring")}
                      className="bg-[#2979ff] hover:bg-blue-600 text-white rounded-full px-4 py-1.5 text-[10px] font-bold border-none cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-semibold space-y-3.5">
                  <div>
                    <span className="text-slate-455 dark:text-slate-500">Expected Hiring Timeline:</span>{" "}
                    <span className="text-slate-800 dark:text-slate-200">
                      {employerProfile?.expected_hiring_timeline 
                        ? HIRING_TIMELINES.find(t => t.value === employerProfile.expected_hiring_timeline)?.label
                        : "Not specified"}
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Image Crop Modal */}
      {showCropModal && selectedImageFile && (
        <ImageCropModal
          imageFile={selectedImageFile}
          onCropComplete={handleImageCropComplete}
          onCancel={() => {
            setShowCropModal(false);
            setSelectedImageFile(null);
          }}
          isUploading={isUploading}
        />
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && employerProfile?.profile_image_url && (
        <ImageViewerModal
          imageUrl={employerProfile.profile_image_url}
          alt={`${businessNameDisplay} Profile`}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </div>
  );
}
