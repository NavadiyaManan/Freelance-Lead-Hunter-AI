import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of, Subject, throwError } from "rxjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BusinessDiscoveryApiService } from "../../core/services/business-discovery-api.service";
import { DiscoveryComponent } from "./discovery.component";

describe("DiscoveryComponent", () => {
  let fixture: ComponentFixture<DiscoveryComponent>;
  let api: { getFilters: ReturnType<typeof vi.fn>; search: ReturnType<typeof vi.fn>; message: ReturnType<typeof vi.fn> };

  const filters = {
    categories: [{ id: 3, name: "Beauty & hair salon", code: "BEAUTY_HAIR_SALON" }],
    countries: ["India"], states: ["Gujarat"], cities: ["Bhavnagar"],
    leadStatuses: [{ id: 1, name: "New", code: "NEW" }],
    websiteStatuses: ["MISSING", "UNVERIFIED"], sources: ["Development seed"]
  };
  const emptyResult = { items: [], totalRecords: 0, pageNumber: 1, pageSize: 20, totalPages: 0, searchMode: "SAVED_LEADS" as const };

  beforeEach(async () => {
    api = { getFilters: vi.fn(() => of(filters)), search: vi.fn(() => of(emptyResult)), message: vi.fn(() => "API error") };
    await TestBed.configureTestingModule({
      imports: [DiscoveryComponent],
      providers: [{ provide: BusinessDiscoveryApiService, useValue: api }]
    }).compileComponents();
    fixture = TestBed.createComponent(DiscoveryComponent);
    fixture.detectChanges();
  });

  afterEach(() => TestBed.resetTestingModule());

  it("loads API filters and sends current form filters when Search is submitted", () => {
    const country = fixture.nativeElement.querySelector('[formControlName="country"]') as HTMLSelectElement;
    country.value = "India";
    country.dispatchEvent(new Event("change"));
    const category = fixture.nativeElement.querySelector('[formControlName="categoryId"]') as HTMLSelectElement;
    category.value = category.options[1].value;
    category.dispatchEvent(new Event("change"));
    const keyword = fixture.nativeElement.querySelector('[formControlName="keyword"]') as HTMLInputElement;
    keyword.value = "family salon";
    keyword.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(api.getFilters).toHaveBeenCalledOnce();
    expect(api.search).toHaveBeenCalledWith(expect.objectContaining({ country: "India", categoryId: 3, keyword: "family salon", pageNumber: 1 }));
    expect(fixture.nativeElement.textContent).toContain("Source: existing database");
  });

  it("resets filters and clears displayed results", () => {
    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector(".secondary-button") as HTMLButtonElement).click();
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('[formControlName="country"]') as HTMLSelectElement).value).toBe("");
    expect(fixture.nativeElement.textContent).toContain("Ready to find your next opportunity?");
  });

  it("shows a visible API error instead of falling back to mock records", () => {
    api.search.mockReturnValue(throwError(() => new Error("Saved leads unavailable")));
    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("API error");
    expect(fixture.nativeElement.textContent).not.toContain("Bindi Beauty Salon");
  });

  it("shows the explicit empty state for an empty database result", () => {
    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("No businesses found");
  });

  it("exposes the loading state while a discovery request is pending", () => {
    const pending = new Subject<typeof emptyResult>();
    api.search.mockReturnValue(pending.asObservable());
    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(true);
    pending.next(emptyResult);
    pending.complete();
  });

  it("requests the selected page and server sort from lazy table events", () => {
    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    const component = fixture.componentInstance as unknown as {
      onLazyLoad: (event: { first: number; rows: number; sortField: string; sortOrder: number }) => void;
    };
    component.onLazyLoad({ first: 50, rows: 50, sortField: "rating", sortOrder: -1 });
    expect(api.search).toHaveBeenLastCalledWith(expect.objectContaining({ pageNumber: 2, pageSize: 50, sortBy: "rating", sortOrder: "desc" }));
  });
});
