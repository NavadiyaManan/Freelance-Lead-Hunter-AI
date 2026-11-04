export type WebsiteStatus = 'Unverified' | 'Verified' | 'No website';
export type LeadStatus = 'New' | 'Qualified' | 'Contacted' | 'Interested';
export type DiscoverySource = 'Manual import' | 'Google Maps' | 'OpenStreetMap';

export interface Business {
  id: number;
  name: string;
  category: string;
  country: string;
  region: string;
  city: string;
  rating: number | null;
  reviews: number | null;
  websiteStatus: WebsiteStatus;
  websiteUrl: string | null;
  leadStatus: LeadStatus;
  source: DiscoverySource;
  demo: true;
}

export interface DiscoveryFilters {
  country: string;
  region: string;
  city: string;
  category: string;
  keyword: string;
  websiteStatus: string;
  minimumRating: number | null;
  maxResults: number;
  source: string;
}
