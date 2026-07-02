/**
 * Reference constants (cities & categories) used across the app.
 * Demo job/provider seed data has been removed — the UI now shows only
 * data returned by the real API (VITE_API_URL).
 */
import type { Job, ServiceProvider } from "./types";

export const MOCK_JOBS: Job[] = [];
export const MOCK_PROVIDERS: ServiceProvider[] = [];

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
