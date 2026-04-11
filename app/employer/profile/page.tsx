"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import type { EmployerProfile } from "@/types/profile";
import { Edit, Camera, X, Check, Loader2, Building2, Globe, Phone, User, Calendar } from "lucide-react";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { ImageViewerModal } from "@/components/ui/ImageViewerModal";

const INDUSTRIES = [
  "Technology",
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

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (employerProfile) {
      setFormData(employerProfile);
    }
  }, [employerProfile]);

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
      let updateData: Partial<EmployerProfile> = { ...formData };
      
      // Filter data based on section
      switch (section) {
        case "basic":
          updateData = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            location: formData.location,
            bio: formData.bio,
          };
          break;
        case "company":
          updateData = {
            business_name: formData.business_name,
            company: formData.company,
            industry: formData.industry,
            website_url: formData.website_url,
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
      // Error handled by store
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
        // Create a new File object from the cropped blob
        const croppedFile = new File([croppedBlob], selectedImageFile.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        await uploadImage(croppedFile);
        setShowCropModal(false);
        setSelectedImageFile(null);
      } catch (error) {
        // Error handled by store
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleInputChange = (field: keyof EmployerProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading && !employerProfile) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Company Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your company information and hiring preferences
          </p>
        </div>
      </div>

      {/* Profile Image Section */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div 
              className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => employerProfile?.profile_image_url && setShowImageViewer(true)}
            >
              {employerProfile?.profile_image_url ? (
                <img
                  src={employerProfile.profile_image_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-slate-500 text-2xl font-semibold">
                  {employerProfile?.business_name?.charAt(0) || user?.email?.charAt(0) || "C"}
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  onClick={(e) => e.stopPropagation()}
                />
              </label>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {employerProfile?.business_name || "Complete your company profile"}
            </h2>
            <p className="text-slate-600 dark:text-slate-300">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Company Information</h3>
          {editingSection !== "company" && (
            <button
              onClick={() => startEditingSection("company")}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Business Name
            </label>
            {editingSection === "company" ? (
              <input
                type="text"
                value={formData.business_name || ""}
                onChange={(e) => handleInputChange("business_name", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            ) : (
              <p className="text-slate-900 dark:text-slate-100">
                {employerProfile?.business_name || "Not specified"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Industry
            </label>
            {editingSection === "company" ? (
              <select
                value={formData.industry || ""}
                onChange={(e) => handleInputChange("industry", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            ) : (
              <p className="text-slate-900 dark:text-slate-100">
                {employerProfile?.industry || "Not specified"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              CAC Registration Number
            </label>
            {editingSection === "company" ? (
              <input
                type="text"
                value={formData.cac_number || ""}
                onChange={(e) => handleInputChange("cac_number", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="RC1234567"
              />
            ) : (
              <p className="text-slate-900 dark:text-slate-100">
                {employerProfile?.cac_number || "Not specified"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Website URL
            </label>
            {editingSection === "company" ? (
              <input
                type="url"
                value={formData.website_url || ""}
                onChange={(e) => handleInputChange("website_url", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="https://companywebsite.com"
              />
            ) : (
              <p className="text-slate-900 dark:text-slate-100">
                {employerProfile?.website_url ? (
                  <a href={employerProfile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {employerProfile.website_url}
                  </a>
                ) : "Not specified"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Contact Information</h3>
          {editingSection !== "contact" && (
            <button
              onClick={() => startEditingSection("contact")}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Contact Person Name
            </label>
            {editingSection === "contact" ? (
              <input
                type="text"
                value={formData.contact_person_name || ""}
                onChange={(e) => handleInputChange("contact_person_name", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="HR Manager Name"
              />
            ) : (
              <p className="text-slate-900 dark:text-slate-100">
                {employerProfile?.contact_person_name || "Not specified"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Contact Person Role
            </label>
            {editingSection === "contact" ? (
              <input
                type="text"
                value={formData.contact_person_role || ""}
                onChange={(e) => handleInputChange("contact_person_role", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="HR Manager, Recruiter, etc."
              />
            ) : (
              <p className="text-slate-900 dark:text-slate-100">
                {employerProfile?.contact_person_role || "Not specified"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            {editingSection === "contact" ? (
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="+234 800 000 0000"
              />
            ) : (
              <p className="text-slate-900 dark:text-slate-100">
                {employerProfile?.phone || "Not specified"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hiring Preferences */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Hiring Preferences</h3>
          {editingSection !== "hiring" && (
            <button
              onClick={() => startEditingSection("hiring")}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Expected Hiring Timeline
            </label>
            {editingSection === "hiring" ? (
              <select
                value={formData.expected_hiring_timeline || ""}
                onChange={(e) => handleInputChange("expected_hiring_timeline", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Select timeline</option>
                {HIRING_TIMELINES.map(timeline => (
                  <option key={timeline.value} value={timeline.value}>{timeline.label}</option>
                ))}
              </select>
            ) : (
              <p className="text-slate-900 dark:text-slate-100">
                {employerProfile?.expected_hiring_timeline 
                  ? HIRING_TIMELINES.find(t => t.value === employerProfile.expected_hiring_timeline)?.label
                  : "Not specified"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {editingSection && (
        <div className="flex justify-end gap-3">
          <button
            onClick={cancelEditing}
            disabled={isSaving}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={() => saveSection(editingSection)}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      )}

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
          alt={`${employerProfile.business_name} Profile`}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </div>
  );
}
