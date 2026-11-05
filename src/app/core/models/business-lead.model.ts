export interface ApiResponse<T> { success: boolean; message: string; data: T; }
export interface BusinessLead {
  id: number; businessName: string; categoryId: number | null; categoryName: string | null;
  statusId: number; statusCode: string; statusName: string; city: string | null; region: string | null;
  country: string | null; websiteUrl: string | null; websiteStatus: string; rating: number | null;
  reviewCount: number | null; source: string | null; createdAt: string; updatedAt: string | null;
}
export interface LeadOption { id: number; name: string; code: string; }
export interface LeadOptions { categories: LeadOption[]; statuses: LeadOption[]; }
export interface LeadPage { items: BusinessLead[]; pageNumber: number; pageSize: number; totalCount: number; totalPages: number; }
export interface LeadQuery {
  pageNumber: number; pageSize: number; search?: string; categoryId?: number; statusId?: number;
  country?: string; state?: string; city?: string; websiteStatus?: string; source?: string;
  minRating?: number; sortBy: string; sortOrder: string; fromDate?: string; toDate?: string;
}
export interface LeadWrite {
  businessName: string; categoryId: number | null; statusId: number; city: string | null; region: string | null;
  country: string | null; websiteUrl: string | null; websiteStatus: string; rating: number | null;
  reviewCount: number | null; source: string | null;
}
export interface DuplicateCheck { hasMatches: boolean; matches: Array<Pick<BusinessLead, 'id'|'businessName'|'city'|'region'|'country'|'websiteUrl'|'categoryName'|'statusName'> & { matchType: string }>; }
