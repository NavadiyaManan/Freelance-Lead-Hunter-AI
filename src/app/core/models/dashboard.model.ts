export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DashboardSummary {
  totalBusinesses: number;
  newLeads: number;
  qualifiedLeads: number;
  interestedProspects: number;
}

export interface StatusDistribution {
  statusId: number;
  statusCode: string;
  statusName: string;
  leadCount: number;
}

export interface CategoryDistribution {
  categoryId: number | null;
  categoryCode: string;
  categoryName: string;
  leadCount: number;
}

export interface RecentLead {
  id: number;
  businessName: string;
  categoryName: string | null;
  statusCode: string;
  statusName: string;
  city: string | null;
  country: string | null;
  websiteUrl: string | null;
  websiteStatus: string;
  rating: number | null;
  reviewCount: number | null;
  source: string | null;
  createdAt: string;
}

export interface LeadTrendPoint {
  date: string;
  leadCount: number;
}
