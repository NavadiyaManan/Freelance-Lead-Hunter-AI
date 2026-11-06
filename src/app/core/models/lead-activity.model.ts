export interface ActivityCode { code: string; name: string; }
export interface LeadActivity {
  id: number; businessLeadId: number; activityTypeCode: string; activityTypeName: string; subject: string;
  description: string | null; outcomeCode: string | null; outcomeName: string | null; activityAt: string;
  followUpAt: string | null; isCompleted: boolean; completedAt: string | null; createdAt: string; updatedAt: string | null;
}
export interface LeadActivityWrite { activityTypeCode: string; subject: string; description: string | null; outcomeCode: string | null; activityAt: string; followUpAt: string | null; }
export interface LeadActivityPage { items: LeadActivity[]; pageNumber: number; pageSize: number; totalCount: number; totalPages: number; }
export interface FollowUp { id: number; businessLeadId: number; businessName: string; activityTypeCode: string; activityTypeName: string; subject: string; outcomeCode: string | null; activityAt: string; followUpAt: string; isCompleted: boolean; completedAt: string | null; followUpStatus: 'UPCOMING' | 'OVERDUE' | 'COMPLETED'; }
export interface FollowUpPage { items: FollowUp[]; pageNumber: number; pageSize: number; totalCount: number; totalPages: number; }
export interface RecentActivity { id: number; businessLeadId: number; businessName: string; activityTypeCode: string; activityTypeName: string; subject: string; outcomeCode: string | null; activityAt: string; }
export interface StatusHistory { id: number; businessLeadId: number; oldStatusId: number | null; oldStatusName: string | null; newStatusId: number; newStatusName: string; changedAt: string; remarks: string | null; }
