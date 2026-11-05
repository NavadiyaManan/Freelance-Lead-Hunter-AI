export interface BusinessDiscoverySearchRequest {
  search?: string;
  keyword?: string;
  country?: string;
  state?: string;
  city?: string;
  categoryId?: number;
  websiteStatus?: string;
  minRating?: number;
  source?: string;
  statusId?: number;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface BusinessDiscoveryLead {
  id: number;
  businessName: string;
  categoryId: number | null;
  categoryName: string | null;
  statusId: number;
  statusCode: string;
  statusName: string;
  city: string | null;
  region: string | null;
  country: string | null;
  websiteUrl: string | null;
  websiteStatus: string;
  rating: number | null;
  reviewCount: number | null;
  source: string | null;
  createdAt: string;
}

export interface BusinessDiscoverySearchResult {
  items: BusinessDiscoveryLead[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  searchMode: 'SAVED_LEADS';
}

export interface BusinessDiscoveryOption {
  id: number;
  name: string;
  code: string;
}

export interface BusinessDiscoveryFilters {
  categories: BusinessDiscoveryOption[];
  countries: string[];
  states: string[];
  cities: string[];
  leadStatuses: BusinessDiscoveryOption[];
  websiteStatuses: string[];
  sources: string[];
}

export interface BusinessDiscoverySearchHistory {
  id: number;
  searchName: string;
  searchCriteriaJson: string;
  createdAt: string;
  updatedAt: string | null;
}
