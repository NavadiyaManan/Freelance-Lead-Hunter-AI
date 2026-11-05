import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { catchError, map, Observable, shareReplay, throwError } from "rxjs";
import { environment } from "../../../environments/environment";
import { CityOption, CountryOption, MasterDataDropdowns, MasterDataItem, MasterDataOption, StateOption } from "../models/master-data.model";

interface ApiResponse<T> { success: boolean; message: string; data: T; }

@Injectable({ providedIn: "root" })
export class MasterDataApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl.replace(/\/$/, "") + "/master-data";
  private dropdownsCache?: Observable<MasterDataDropdowns>;
  private readonly stateCache = new Map<number, Observable<StateOption[]>>();
  private readonly cityCache = new Map<number, Observable<CityOption[]>>();

  getDropdowns(): Observable<MasterDataDropdowns> {
    if (!this.dropdownsCache) {
      this.dropdownsCache = this.get<MasterDataDropdowns>(this.base + "/dropdowns").pipe(
        catchError(error => { this.dropdownsCache = undefined; return throwError(() => error); }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.dropdownsCache;
  }

  getCategories(includeInactive = false, search?: string): Observable<MasterDataItem[]> {
    return this.list<MasterDataItem>("business-categories", includeInactive, search);
  }
  getLeadStatuses(includeInactive = false, search?: string): Observable<MasterDataItem[]> {
    return this.list<MasterDataItem>("lead-statuses", includeInactive, search);
  }
  getLeadSources(includeInactive = false, search?: string): Observable<MasterDataOption[]> {
    return this.list<MasterDataOption>("lead-sources", includeInactive, search);
  }
  getWebsiteStatuses(includeInactive = false): Observable<MasterDataOption[]> {
    const params = new HttpParams().set("includeInactive", String(includeInactive));
    return this.get<MasterDataOption[]>(this.base + "/website-statuses", params);
  }
  getCountries(includeInactive = false, search?: string): Observable<CountryOption[]> {
    return this.list<CountryOption>("countries", includeInactive, search);
  }
  getStates(countryId: number, includeInactive = false, search?: string): Observable<StateOption[]> {
    const cached = this.stateCache.get(countryId);
    if (cached && !includeInactive && !search) return cached;
    let params = new HttpParams().set("countryId", String(countryId)).set("includeInactive", String(includeInactive));
    if (search) params = params.set("search", search);
    const request = this.get<StateOption[]>(this.base + "/states", params).pipe(
      catchError(error => { if (!includeInactive && !search) this.stateCache.delete(countryId); return throwError(() => error); }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    if (!includeInactive && !search) this.stateCache.set(countryId, request);
    return request;
  }
  getCities(stateId: number, includeInactive = false, search?: string): Observable<CityOption[]> {
    const cached = this.cityCache.get(stateId);
    if (cached && !includeInactive && !search) return cached;
    let params = new HttpParams().set("stateId", String(stateId)).set("includeInactive", String(includeInactive));
    if (search) params = params.set("search", search);
    const request = this.get<CityOption[]>(this.base + "/cities", params).pipe(
      catchError(error => { if (!includeInactive && !search) this.cityCache.delete(stateId); return throwError(() => error); }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    if (!includeInactive && !search) this.cityCache.set(stateId, request);
    return request;
  }

  displayWebsiteStatus(code: string, statuses: MasterDataOption[]): string {
    const normalized = code.toUpperCase() === "NO_WEBSITE" ? "MISSING" : code.toUpperCase();
    return statuses.find(item => item.code.toUpperCase() === normalized)?.name ?? code;
  }
  websiteStatusCode(value: string): string {
    if (value.toLowerCase() === "no website" || value.toLowerCase() === "no_website") return "MISSING";
    return value.toUpperCase();
  }
  message(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as { message?: string; data?: Record<string, string[]> } | null;
      const validation = body?.data ? Object.values(body.data).flat().join(" ") : "";
      return validation || body?.message || (error.status === 0 ? "The master-data API is unavailable at http://localhost:5080." : `Master-data request failed (HTTP ${error.status}).`);
    }
    return error instanceof Error ? error.message : "Master-data request failed.";
  }

  private list<T>(path: string, includeInactive: boolean, search?: string): Observable<T[]> {
    let params = new HttpParams().set("includeInactive", String(includeInactive));
    if (search) params = params.set("search", search);
    return this.get<T[]>(this.base + "/" + path, params);
  }
  private get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.get<ApiResponse<T>>(url, { params }).pipe(map(response => {
      if (!response.success) throw new Error(response.message || "Master-data request failed.");
      return response.data;
    }));
  }
}
