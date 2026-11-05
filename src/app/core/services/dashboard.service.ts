import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, computed, inject, signal } from "@angular/core";
import { Observable, forkJoin, map } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  ApiResponse,
  CategoryDistribution,
  DashboardSummary,
  LeadTrendPoint,
  RecentLead,
  StatusDistribution
} from "../models/dashboard.model";

@Injectable({ providedIn: "root" })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl.endsWith("/")
    ? environment.apiBaseUrl.slice(0, -1)
    : environment.apiBaseUrl;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly summary = signal<DashboardSummary | null>(null);
  readonly statusDistribution = signal<StatusDistribution[]>([]);
  readonly categoryDistribution = signal<CategoryDistribution[]>([]);
  readonly populatedCategories = computed(() => this.categoryDistribution().filter((item) => item.leadCount > 0));
  readonly recentLeads = signal<RecentLead[]>([]);
  readonly leadTrend = signal<LeadTrendPoint[]>([]);

  readonly total = computed(() => this.summary()?.totalBusinesses ?? 0);
  readonly newLeads = computed(() => this.summary()?.newLeads ?? 0);
  readonly qualified = computed(() => this.summary()?.qualifiedLeads ?? 0);
  readonly interested = computed(() => this.summary()?.interestedProspects ?? 0);

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      summary: this.getData<DashboardSummary>("summary"),
      statuses: this.getData<StatusDistribution[]>("status-distribution"),
      categories: this.getData<CategoryDistribution[]>("category-distribution"),
      recent: this.getData<RecentLead[]>("recent-leads"),
      trend: this.getData<LeadTrendPoint[]>("lead-trend")
    }).subscribe({
      next: (dashboard) => {
        this.summary.set(dashboard.summary);
        this.statusDistribution.set(dashboard.statuses);
        this.categoryDistribution.set(dashboard.categories);
        this.recentLeads.set(dashboard.recent);
        this.leadTrend.set(dashboard.trend);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.summary.set(null);
        this.statusDistribution.set([]);
        this.categoryDistribution.set([]);
        this.recentLeads.set([]);
        this.leadTrend.set([]);
        this.error.set(this.errorMessage(error));
        this.loading.set(false);
      }
    });
  }

  private getData<T>(path: string): Observable<T> {
    return this.http.get<ApiResponse<T>>(this.apiBaseUrl + "/dashboard/" + path).pipe(
      map((response) => {
        if (!response.success) throw new Error(response.message || "Dashboard request failed.");
        return response.data;
      })
    );
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return "The dashboard API is unavailable. Check that the backend is running at http://localhost:5080.";
      const body = error.error as { message?: string } | null;
      return body?.message ?? "Dashboard data could not be loaded (HTTP " + error.status + ").";
    }
    return error instanceof Error ? error.message : "Dashboard data could not be loaded.";
  }
}
