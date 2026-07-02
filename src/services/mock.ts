/**
 * Temporary in-memory fallback used while the VPS backend is not yet reachable.
 * The real code path stays through the services/api.ts REST client — this only
 * provides sample data for the initial UI. Remove once the backend is live.
 */
import type { Job, ServiceProvider } from "./types";

export const MOCK_JOBS: Job[] = [
  {
    id: "1", title: "Delivery Rider", company: "Food Express Pvt. Ltd.", location: "Lahore, Punjab", city: "Lahore",
    employmentType: "Full Time", salaryMin: 40000, salaryMax: 60000, currency: "PKR", category: "Driver",
    postedAt: "2h ago", tags: ["Matric", "1-2 Years", "Bike Required"], isNew: true, verified: true,
  },
  {
    id: "2", title: "Office Assistant", company: "Bright Solutions", location: "Karachi, Sindh", city: "Karachi",
    employmentType: "Full Time", salaryMin: 30000, salaryMax: 45000, currency: "PKR", category: "Office",
    postedAt: "3h ago", tags: ["Intermediate", "1-2 Years", "MS Office"], isNew: true, verified: true,
  },
  {
    id: "3", title: "Electrician", company: "TechFix Services", location: "Islamabad, ICT", city: "Islamabad",
    employmentType: "Full Time", salaryMin: 45000, salaryMax: 70000, currency: "PKR", category: "Electrician",
    postedAt: "5h ago", tags: ["Matric", "2-5 Years", "Wiring"], verified: true,
  },
  {
    id: "4", title: "Salesman", company: "Al-Haram Traders", location: "Faisalabad, Punjab", city: "Faisalabad",
    employmentType: "Full Time", salaryMin: 35000, salaryMax: 50000, currency: "PKR", category: "Salesman",
    postedAt: "6h ago", tags: ["Matric", "1-3 Years", "Communication"], verified: true,
  },
  {
    id: "5", title: "Plumber", company: "Aqua Solutions", location: "Rawalpindi, Punjab", city: "Rawalpindi",
    employmentType: "Full Time", salaryMin: 40000, salaryMax: 65000, currency: "PKR", category: "Plumber",
    postedAt: "8h ago", tags: ["Matric", "2-4 Years", "Plumbing"], verified: true,
  },
  {
    id: "6", title: "Factory Worker", company: "Pak Industries", location: "Sialkot, Punjab", city: "Sialkot",
    employmentType: "Full Time", salaryMin: 30000, salaryMax: 40000, currency: "PKR", category: "Factory",
    postedAt: "10h ago", tags: ["Middle", "1-2 Years", "Hard Working"],
  },
];

export const MOCK_PROVIDERS: ServiceProvider[] = [
  {
    id: "p1", name: "Ali Electrician", category: "Electrician", city: "Lahore, Punjab", rating: 4.9, reviews: 320,
    yearsExperience: 8, level: "Gold", hourlyRate: 1500, currency: "PKR", verified: true, respondsInMinutes: 15,
    description: "Professional electrician with 8+ years of experience in residential and commercial wiring, fault fixing, installation and maintenance.",
    tags: ["Wiring", "Installation", "Electrical Repair", "Maintenance"],
    completedProjects: 320, positiveReviewsPct: 98, happyCustomers: 1200,
  },
  {
    id: "p2", name: "Usman Plumbing", category: "Plumber", city: "Karachi, Sindh", rating: 4.8, reviews: 210,
    yearsExperience: 10, level: "Silver", hourlyRate: 2000, currency: "PKR", verified: true, respondsInMinutes: 20,
    description: "Expert in all plumbing services including pipe fitting, leakages, bathroom fittings and drainage issues.",
    tags: ["Pipe Fitting", "Leakage Fixing", "Bathroom Fitting", "Drainage"],
    completedProjects: 210, positiveReviewsPct: 96, happyCustomers: 850,
  },
  {
    id: "p3", name: "Hassan AC Technician", category: "AC Technician", city: "Islamabad, ICT", rating: 4.7, reviews: 185,
    yearsExperience: 7, level: "Bronze", hourlyRate: 2500, currency: "PKR", verified: true, respondsInMinutes: 25,
    description: "Specialized in AC installation, repair, gas refilling and maintenance of all brands.",
    tags: ["AC Repair", "AC Installation", "Gas Refilling", "Maintenance"],
    completedProjects: 185, positiveReviewsPct: 98, happyCustomers: 600,
  },
  {
    id: "p4", name: "Asif Solar Expert", category: "Solar Installer", city: "Lahore, Punjab", rating: 4.9, reviews: 300,
    yearsExperience: 9, level: "Gold", hourlyRate: 3000, currency: "PKR", verified: true, respondsInMinutes: 10,
    description: "Complete solar solutions for homes and businesses. Installation, maintenance and consultation.",
    tags: ["Solar Installation", "Net Metering", "Maintenance", "Consultation"],
    completedProjects: 300, positiveReviewsPct: 98, happyCustomers: 1500,
  },
];

export const PK_CITIES = [
  "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Peshawar", "Quetta", "Multan",
  "Faisalabad", "Hyderabad", "Sialkot", "Bahawalpur", "Sargodha", "Gujranwala",
  "Abbottabad", "Mardan", "Swat", "Sukkur", "Larkana", "Gujrat", "Sheikhupura",
];

export const JOB_CATEGORIES = [
  "Driver", "Salesman", "Office Assistant", "Delivery Rider", "Electrician Job",
  "Plumber Job", "Factory Worker", "Security Guard", "Helper",
];

export const SERVICE_CATEGORIES = [
  "Electrician", "Plumber", "AC Technician", "Solar Installer", "Carpenter",
  "Painter", "Cleaner", "CCTV Installer", "Generator Technician",
];
