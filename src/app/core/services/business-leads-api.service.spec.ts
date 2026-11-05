import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { environment } from "../../../environments/environment";
import { BusinessLeadsApiService } from "./business-leads-api.service";

describe("BusinessLeadsApiService", () => {
  let http: HttpTestingController;
  let api: BusinessLeadsApiService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    api = TestBed.inject(BusinessLeadsApiService);
  });
  afterEach(() => http.verify());

  it("serializes list filters and unwraps the standard response envelope", () => {
    let result: unknown;
    api.list({ pageNumber: 2, pageSize: 20, search: "Salon", state: "Gujarat", sortBy: "createdAt", sortOrder: "desc" }).subscribe(value => result = value);
    const request = http.expectOne(value => value.url === environment.apiBaseUrl + "/business-leads");
    expect(request.request.params.get("pageNumber")).toBe("2");
    expect(request.request.params.get("state")).toBe("Gujarat");
    expect(request.request.params.get("search")).toBe("Salon");
    request.flush({ success: true, message: "ok", data: { items: [], pageNumber: 2, pageSize: 20, totalCount: 0, totalPages: 0 } });
    expect(result).toEqual({ items: [], pageNumber: 2, pageSize: 20, totalCount: 0, totalPages: 0 });
  });

  it("uses PATCH for status-only updates", () => {
    api.updateStatus(42, 3).subscribe();
    const request = http.expectOne(environment.apiBaseUrl + "/business-leads/42/status");
    expect(request.request.method).toBe("PATCH");
    expect(request.request.body).toEqual({ statusId: 3 });
    request.flush({ success: true, message: "ok", data: {} });
  });
});
