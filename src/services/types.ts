export type AccountType = "employer" | "job_seeker" | "service_provider" | "customer";

/** Cloudinary asset reference kept on posted jobs/services so we can delete them later. */
export interface MediaAsset {
  url: string;
  publicId: string;
  account: "jobs" | "services";
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  country: string;
  city: string;
  accountType: AccountType;
  avatarUrl?: string;
  verified?: boolean;
  rating?: number;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  city: string;
  employmentType: "Full Time" | "Part Time" | "Contract" | "Internship";
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  category: string;
  postedAt: string;
  tags?: string[];
  isNew?: boolean;
  verified?: boolean;
  mediaAssets?: MediaAsset[];
}

export interface ServiceProvider {
  id: string;
  name: string;
  avatarUrl?: string;
  category: string;
  city: string;
  rating: number;
  reviews: number;
  yearsExperience: number;
  level: "Gold" | "Silver" | "Bronze";
  hourlyRate?: number;
  currency?: string;
  verified: boolean;
  respondsInMinutes?: number;
  description: string;
  tags: string[];
  completedProjects?: number;
  positiveReviewsPct?: number;
  happyCustomers?: number;
  mediaAssets?: MediaAsset[];
}
