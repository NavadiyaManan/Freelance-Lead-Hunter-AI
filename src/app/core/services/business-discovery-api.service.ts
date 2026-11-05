import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { BusinessDiscoveryFilters, BusinessDiscoverySearchRequest, BusinessDiscoverySearchResult } from "../models/business-discovery.model";

interface ApiResponse<T> { success: boolean; message: string; data: T; }

@Injectable({ providedIn: "root" })
export class BusinessDiscoveryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, "") + "/business-discovery";

  getFilters(): Observable<BusinessDiscoveryFilters> {
    return this.request(this.http.get<ApiResponse<BusinessDiscoveryFilters>>(this.baseUrl + "/filters"));
  }

  search(request: BusinessDiscoverySearchRequest): Observable<BusinessDiscoverySearchResult> {
    let params = new HttpParams();
    Object.entries(request).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") params = params.set(key, String(value));
    });
    return this.request(this.http.get<ApiResponse<BusinessDiscoverySearchResult>>(this.baseUrl + "/search", { params }));
  }

  message(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as { message?: string; data?: Record<string, string[]> } | null;
      const validation = body?.data ? Object.values(body.data).flat().join(" ") : "";
      return validation || body?.message || (error.status === 0
        ? "The discovery API is unavailable. Start the backend at http://localhost:5080."
        : "Discovery request failed (HTTP " + error.status + ").");
    }
    return error instanceof Error ? error.message : "Discovery request failed.";
  }

  private request<T>(request: Observable<ApiResponse<T>>): Observable<T> {
    return request.pipe(map(response => {
      if (!response.success) throw new Error(response.message || "Discovery request failed.");
      return response.data;
    }));
  }
}
