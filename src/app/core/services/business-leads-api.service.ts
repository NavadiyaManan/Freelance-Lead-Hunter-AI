import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse, BusinessLead, DuplicateCheck, LeadOptions, LeadPage, LeadQuery, LeadWrite } from "../models/business-lead.model";

@Injectable({ providedIn: "root" })
export class BusinessLeadsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl.replace(/\/$/, "") + "/business-leads";
  options(): Observable<LeadOptions> { return this.request<LeadOptions>(this.http.get<ApiResponse<LeadOptions>>(this.base + "/options")); }
  list(query: LeadQuery): Observable<LeadPage> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") params = params.set(key, String(value)); });
    return this.request<LeadPage>(this.http.get<ApiResponse<LeadPage>>(this.base, { params }));
  }
  get(id: number): Observable<BusinessLead> { return this.request(this.http.get<ApiResponse<BusinessLead>>(this.base + "/" + id)); }
  create(value: LeadWrite): Observable<BusinessLead> { return this.request(this.http.post<ApiResponse<BusinessLead>>(this.base, value)); }
  update(id: number, value: LeadWrite): Observable<BusinessLead> { return this.request(this.http.put<ApiResponse<BusinessLead>>(this.base + "/" + id, value)); }
  updateStatus(id: number, statusId: number): Observable<BusinessLead> { return this.request(this.http.patch<ApiResponse<BusinessLead>>(this.base + "/" + id + "/status", { statusId })); }
  remove(id: number): Observable<unknown> { return this.request(this.http.delete<ApiResponse<unknown>>(this.base + "/" + id)); }
  duplicates(value: Pick<LeadWrite, "businessName"|"city"|"country"|"websiteUrl">): Observable<DuplicateCheck> {
    let params = new HttpParams(); Object.entries(value).forEach(([key, v]) => { if (v) params = params.set(key, v); });
    return this.request(this.http.get<ApiResponse<DuplicateCheck>>(this.base + "/check-duplicate", { params }));
  }
  message(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as { message?: string; data?: Record<string, string[]> } | null;
      const validation = body?.data ? Object.values(body.data).flat().join(" ") : "";
      return validation || body?.message || (error.status === 0 ? "API unavailable. Start the backend at http://localhost:5080." : `Request failed (HTTP ${error.status}).`);
    }
    return error instanceof Error ? error.message : "Request failed.";
  }
  private request<T>(request: Observable<ApiResponse<T>>): Observable<T> {
    return request.pipe(map(response => { if (!response.success) throw new Error(response.message || "API request failed."); return response.data; }));
  }
}
