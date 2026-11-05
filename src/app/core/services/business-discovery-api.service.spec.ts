import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { environment } from "../../../environments/environment";
import { BusinessDiscoveryApiService } from "./business-discovery-api.service";

describe("BusinessDiscoveryApiService", () => {
  let http: HttpTestingController;
  let api: BusinessDiscoveryApiService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    api = TestBed.inject(BusinessDiscoveryApiService);
  });
  afterEach(() => http.verify());

  it("loads database-derived filter options through the response envelope", () => {
    let countries: string[] = [];
    api.getFilters().subscribe(result => countries = result.countries);
    const request = http.expectOne(environment.apiBaseUrl + "/business-discovery/filters");
    expect(request.request.method).toBe("GET");
    request.flush({ success: true, message: "ok", data: { categories: [], countries: ["India"], states: [], cities: [], leadStatuses: [], websiteStatuses: ["MISSING", "UNVERIFIED"], sources: [] } });
    expect(countries).toEqual(["India"]);
  });

  it("sends discovery filters, paging, and sorting to the saved-leads endpoint", () => {
    let mode = "";
    api.search({ search: "salon", keyword: "family", country: "India", state: "Gujarat", city: "Bhavnagar", categoryId: 2, websiteStatus: "MISSING", minRating: 4, source: "Development seed", statusId: 1, pageNumber: 2, pageSize: 50, sortBy: "rating", sortOrder: "desc" }).subscribe(result => mode = result.searchMode);
    const request = http.expectOne(value => value.url === environment.apiBaseUrl + "/business-discovery/search");
    expect(request.request.params.get("keyword")).toBe("family");
    expect(request.request.params.get("categoryId")).toBe("2");
    expect(request.request.params.get("websiteStatus")).toBe("MISSING");
    expect(request.request.params.get("pageNumber")).toBe("2");
    expect(request.request.params.get("pageSize")).toBe("50");
    expect(request.request.params.get("sortOrder")).toBe("desc");
    request.flush({ success: true, message: "ok", data: { items: [], totalRecords: 0, pageNumber: 2, pageSize: 50, totalPages: 0, searchMode: "SAVED_LEADS" } });
    expect(mode).toBe("SAVED_LEADS");
  });
});
