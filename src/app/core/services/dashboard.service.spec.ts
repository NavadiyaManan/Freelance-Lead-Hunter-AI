import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { environment } from "../../../environments/environment";
import { DashboardService } from "./dashboard.service";

describe("DashboardService", () => {
  let httpTesting: HttpTestingController;
  let service: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(DashboardService);
  });

  afterEach(() => httpTesting.verify({ ignoreCancelled: true }));

  it("loads the dashboard endpoints and exposes their values", () => {
    service.load();
    expect(service.loading()).toBe(true);

    const requests = httpTesting.match((request) => request.url.startsWith(environment.apiBaseUrl + "/dashboard/"));
    expect(requests).toHaveLength(5);

    for (const request of requests) {
      const path = request.request.url.split("/").pop();
      let data: unknown;
      switch (path) {
        case "summary":
          data = { totalBusinesses: 18, newLeads: 13, qualifiedLeads: 2, interestedProspects: 1 };
          break;
        case "status-distribution":
          data = [{ statusId: 1, statusCode: "NEW", statusName: "New", leadCount: 14 }];
          break;
        case "category-distribution":
          data = [{ categoryId: 1, categoryCode: "BEAUTY_HAIR_SALON", categoryName: "Beauty & hair salon", leadCount: 13 }];
          break;
        case "recent-leads":
          data = [{ id: 1, businessName: "Bindi Beauty Salon", categoryName: "Beauty & hair salon", statusCode: "NEW", statusName: "New", city: "Bhavnagar", country: "India", websiteUrl: null, websiteStatus: "UNVERIFIED", rating: null, reviewCount: null, source: "Development seed", createdAt: "2026-11-05T00:00:00+00:00" }];
          break;
        case "lead-trend":
          data = [{ date: "2026-11-05", leadCount: 1 }];
          break;
        default:
          throw new Error("Unexpected dashboard endpoint: " + path);
      }
      request.flush({ success: true, message: "Dashboard data retrieved successfully", data });
    }

    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
    expect(service.total()).toBe(18);
    expect(service.newLeads()).toBe(13);
    expect(service.qualified()).toBe(2);
    expect(service.interested()).toBe(1);
    expect(service.recentLeads()[0]?.businessName).toBe("Bindi Beauty Salon");
    expect(service.populatedCategories()[0]?.categoryName).toBe("Beauty & hair salon");
  });

  it("shows API failures and clears dashboard data without a mock fallback", () => {
    service.load();
    const requests = httpTesting.match((request) => request.url.startsWith(environment.apiBaseUrl + "/dashboard/"));
    const summaryRequest = requests.find((request) => request.request.url.endsWith("/summary"));
    expect(summaryRequest).toBeDefined();

    summaryRequest!.flush(
      { success: false, message: "Dashboard database is unavailable", data: null },
      { status: 503, statusText: "Service Unavailable" }
    );

    expect(service.loading()).toBe(false);
    expect(service.error()).toBe("Dashboard database is unavailable");
    expect(service.summary()).toBeNull();
    expect(service.total()).toBe(0);
    expect(service.recentLeads()).toEqual([]);
  });
});
