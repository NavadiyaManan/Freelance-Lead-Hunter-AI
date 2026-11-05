import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Business } from '../../core/models/business.model';
import { BusinessDiscoveryFilters, BusinessDiscoveryLead, BusinessDiscoverySearchRequest } from '../../core/models/business-discovery.model';
import { BusinessDiscoveryApiService } from '../../core/services/business-discovery-api.service';

@Component({
  selector: 'app-discovery',
  imports: [ReactiveFormsModule, TableModule],
  template: `
  <div class="page-heading"><div><div class="eyebrow"><span class="eyebrow-icon"><i class="pi pi-compass"></i></span> FIND YOUR NEXT CLIENT</div><h1>Business Discovery</h1><p class="subtitle">Find local businesses that could use your expertise.</p></div><div class="local-tag"><span></span> SAVED DATABASE LEADS</div></div>
    <div class="notice"><i class="pi pi-info-circle"></i><span><strong>Saved lead search:</strong> Results come from existing database records. No Google Maps, OpenStreetMap, or other external discovery services are contacted.</span></div>
    <section class="search-card">
      <div class="section-title"><div class="title-icon"><i class="pi pi-sliders-h"></i></div><div><h2>Search filters</h2><p>Define the businesses you want to find</p></div><span class="required-note"><i class="pi pi-asterisk"></i> Required fields</span></div>
      <form [formGroup]="form" (ngSubmit)="search()" novalidate>
        <div class="form-grid">
          <label class="field"><span>Country</span><select formControlName="country"><option value="">All countries</option>@for (country of countryOptions(); track country) { <option [value]="country">{{ country }}</option> }</select></label>
          <label class="field"><span>State / Region</span><select formControlName="region"><option value="">All states / regions</option>@for (state of stateOptions(); track state) { <option [value]="state">{{ state }}</option> }</select></label>
          <label class="field"><span>City / Location</span><select formControlName="city"><option value="">All cities</option>@for (city of cityOptions(); track city) { <option [value]="city">{{ city }}</option> }</select></label>
          <label class="field"><span>Business category</span><select formControlName="categoryId"><option [ngValue]="null">All categories</option>@for (category of categoryOptions(); track category.id) { <option [ngValue]="category.id">{{ category.name }}</option> }</select></label>
          <label class="field"><span>Business keyword</span><div class="input-with-icon"><i class="pi pi-search"></i><input formControlName="keyword" placeholder="e.g. family salon"></div></label>
          <label class="field"><span>Website status</span><select formControlName="websiteStatus"><option value="">All statuses</option>@for (status of websiteStatusOptions(); track status) { <option [value]="status">{{ websiteStatusLabel(status) }}</option> }</select></label>
          <label class="field"><span>Lead status</span><select formControlName="statusId"><option [ngValue]="null">All lead statuses</option>@for (status of leadStatusOptions(); track status.id) { <option [ngValue]="status.id">{{ status.name }}</option> }</select></label>
          <label class="field"><span>Minimum rating</span><select formControlName="minimumRating"><option [ngValue]="null">Any rating</option><option [ngValue]="3">3.0+</option><option [ngValue]="3.5">3.5+</option><option [ngValue]="4">4.0+</option><option [ngValue]="4.5">4.5+</option></select><small class="hint">Unrated records are excluded by a rating filter.</small></label>
          <label class="field"><span>Maximum results</span><select formControlName="maxResults"><option [ngValue]="10">10 results</option><option [ngValue]="20">20 results</option><option [ngValue]="50">50 results</option><option [ngValue]="100">100 results</option></select></label>
          <label class="field"><span>Discovery source</span><select formControlName="source"><option value="">All sources</option>@for (source of sourceOptions(); track source) { <option [value]="source">{{ source }}</option> }</select></label>
        </div>
        <div class="form-actions"><span class="demo-caption"><i class="pi pi-database"></i> Existing saved lead records</span><div><button type="button" class="secondary-button" (click)="reset()"><i class="pi pi-refresh"></i> Reset filters</button><button type="submit" class="primary-button" [disabled]="loading()"><i class="pi pi-search"></i> Search businesses</button></div></div>
      </form>
    </section>
    @if (error()) { <div class="notice error-alert" role="alert"><i class="pi pi-exclamation-triangle"></i><span>{{ error() }}</span><button type="button" class="secondary-button" (click)="loadFilters()">Retry filters</button></div> }
    @if (hasSearched()) {
      <section class="results-card">
        <div class="results-heading"><div><div class="results-title-line"><h2>Search results</h2><span class="count-badge">{{ totalRecords() }}</span></div><p>{{ totalRecords() }} matching saved leads <span class="dot-separator">&mdash;</span> Source: existing database</p></div></div>
        <div class="table-tools"><div class="global-search"><i class="pi pi-search"></i><input placeholder="Search saved leads..." aria-label="Search result names, categories, location, and source" (input)="applyGlobalSearch($event, dt)"></div><div class="filter-tools"><label><span>Category</span><select aria-label="Filter by category" [value]="tableCategory() ?? ''" (change)="setTableFilter($event, 'category', dt)"><option value="">All categories</option>@for (category of categoryOptions(); track category.id) { <option [value]="category.id">{{ category.name }}</option> }</select></label><label><span>Country</span><select aria-label="Filter by country" [value]="tableCountry()" (change)="setTableFilter($event, 'country', dt)"><option value="">All countries</option>@for (country of countryOptions(); track country) { <option [value]="country">{{ country }}</option> }</select></label><label><span>Website</span><select aria-label="Filter by website status" [value]="tableWebsiteStatus()" (change)="setTableFilter($event, 'websiteStatus', dt)"><option value="">All statuses</option>@for (status of websiteStatusOptions(); track status) { <option [value]="status">{{ websiteStatusLabel(status) }}</option> }</select></label></div></div>
        <div class="table-container">
          <p-table #dt [value]="filteredResults()" [lazy]="true" [lazyLoadOnInit]="false" [paginator]="true" [rows]="pageSize()" [first]="(pageNumber()-1)*pageSize()" [totalRecords]="totalRecords()" [rowsPerPageOptions]="[10, 20, 50, 100]" [loading]="loading()" [sortField]="sortField()" [sortOrder]="sortOrder()" (onLazyLoad)="onLazyLoad($event)" [tableStyle]="{'min-width':'1040px'}" styleClass="discovery-table" aria-label="Business discovery results">
            <ng-template #header><tr><th pSortableColumn="businessName">Business name <p-sortIcon field="businessName" /></th><th pSortableColumn="category">Category <p-sortIcon field="category" /></th><th pSortableColumn="country">Country <p-sortIcon field="country" /></th><th pSortableColumn="city">City <p-sortIcon field="city" /></th><th pSortableColumn="rating">Rating <p-sortIcon field="rating" /></th><th pSortableColumn="reviewCount">Reviews <p-sortIcon field="reviewCount" /></th><th pSortableColumn="websiteStatus">Website status <p-sortIcon field="websiteStatus" /></th><th pSortableColumn="leadStatus">Lead status <p-sortIcon field="leadStatus" /></th><th pSortableColumn="source">Source <p-sortIcon field="source" /></th></tr></ng-template>
            <ng-template #body let-business><tr><td><div class="business-name"><span class="business-avatar">{{ initials(business.name) }}</span><div><strong>{{ business.name }}</strong><small>Saved database lead</small></div></div></td><td><span class="category-label">{{ business.category }}</span></td><td>{{ business.country }}</td><td>{{ business.city }}</td><td><span class="rating-value">@if (business.rating !== null) {<i class="pi pi-star-fill"></i>} {{ business.rating ?? 'Not provided' }}</span></td><td>{{ business.reviews ?? 'Not provided' }}</td><td><span class="status-tag unverified">{{ business.websiteStatus }}</span></td><td><span class="status-tag lead-new">{{ business.leadStatus }}</span></td><td><span class="source-cell"><i class="pi pi-database"></i>{{ business.source }}</span></td></tr></ng-template>
            <ng-template #emptymessage><tr><td colspan="10"><div class="empty-state"><span><i class="pi pi-search"></i></span><strong>No businesses found</strong><p>Try a different location or clear one of your filters.</p></div></td></tr></ng-template>
          </p-table>
        </div>
        <div class="table-foot"><span><i class="pi pi-info-circle"></i> Website status reflects the stored lead status; websites are not checked here.</span><span>Search mode: saved database records</span></div>
      </section>
    } @else {
      <section class="pre-search"><div class="pre-icon"><i class="pi pi-map-marker"></i></div><h2>Ready to find your next opportunity?</h2><p>Search saved lead records by location, category, keyword, website status, rating, source, and pipeline status.</p><div class="pre-meta"><span><i class="pi pi-database"></i> Existing database leads</span><span><i class="pi pi-lock"></i> No external provider calls</span></div></section>
    }
  `,
  styles: [`
    :host{display:block;color:var(--text-color)}.page-heading{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:17px}.eyebrow{display:flex;align-items:center;gap:7px;color:#6672df;font-size:9px;font-weight:800;letter-spacing:1.2px}.eyebrow-icon{width:19px;height:19px;display:grid;place-items:center;background:#eceeff;border-radius:6px;font-size:10px}.app-dark .eyebrow-icon{background:#33375a}.page-heading h1{margin:8px 0 4px;font-size:25px;letter-spacing:-.7px;font-weight:720}.subtitle{margin:0;color:var(--text-color-secondary);font-size:11px}.local-tag{display:flex;align-items:center;gap:6px;margin-bottom:2px;padding:6px 8px;border:1px solid #dfe9e7;border-radius:6px;color:#54877d;font-size:8px;letter-spacing:.7px;font-weight:800}.app-dark .local-tag{border-color:#334c45;color:#87c4ad}.local-tag span{width:5px;height:5px;border-radius:50%;background:#4ca788}.notice{display:flex;align-items:center;gap:9px;padding:10px 12px;margin-bottom:15px;border:1px solid #e7e9f5;border-radius:8px;background:#f8f9ff;color:var(--text-color-secondary);font-size:9px;line-height:1.5}.app-dark .notice{background:#232740;border-color:#343a5a}.notice>.pi{color:#6773e8;font-size:12px}.notice strong{color:var(--text-color);font-weight:700}.search-card,.results-card{background:var(--surface-card);border:1px solid var(--surface-border);border-radius:10px;box-shadow:0 2px 8px #1d26400a}.search-card{padding:16px 18px 0;margin-bottom:15px}.section-title{display:flex;align-items:center;gap:10px;margin-bottom:16px}.title-icon{width:29px;height:29px;display:grid;place-items:center;border-radius:8px;background:#eff0ff;color:#616ce3;font-size:12px}.app-dark .title-icon{background:#303455}.section-title h2,.results-heading h2{margin:0 0 3px;font-size:12px;font-weight:720}.section-title p,.results-heading p{margin:0;color:var(--text-color-secondary);font-size:9px}.required-note{margin-left:auto;color:var(--text-color-secondary);font-size:8px}.required-note .pi,.field b{color:#dc6e72;font-size:8px}.form-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px 15px}.field{display:grid;align-content:start;gap:6px;color:var(--text-color);font-size:9px;font-weight:650}.field>span{color:var(--text-color);font-weight:650}.field input,.field select,.filter-tools select{width:100%;height:34px;padding:0 10px;border:1px solid var(--surface-border);border-radius:6px;outline:none;background:var(--surface-card);color:var(--text-color);font:inherit;font-size:10px}.field input::placeholder{color:#a4a9b5}.field input:focus,.field select:focus,.filter-tools select:focus,.global-search input:focus{border-color:#8b94ef;box-shadow:0 0 0 2px #7178eb1b}.input-with-icon{position:relative}.input-with-icon .pi{position:absolute;top:11px;left:10px;color:#a4a9b5;font-size:11px}.input-with-icon input{padding-left:29px}.hint{color:var(--text-color-secondary);font-size:8px;font-weight:400}.error{color:#ce555e;font-size:8px;font-weight:500}.form-actions{display:flex;align-items:center;justify-content:space-between;margin:16px -18px 0;padding:11px 18px;border-top:1px solid var(--surface-border)}.demo-caption{color:var(--text-color-secondary);font-size:8px}.demo-caption .pi{margin-right:5px;color:#7a82db;font-size:9px}.form-actions>div{display:flex;gap:8px}.secondary-button,.primary-button,.export-button{height:32px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:0 11px;border-radius:6px;font:inherit;font-size:9px;font-weight:650;cursor:pointer}.secondary-button,.export-button{border:1px solid var(--surface-border);background:var(--surface-card);color:var(--text-color-secondary)}.secondary-button:hover,.export-button:hover{background:var(--surface-ground);color:var(--text-color)}.primary-button{border:1px solid #5967e9;background:#5967e9;color:#fff;box-shadow:0 3px 8px #5967e92a}.primary-button:hover{background:#4e5cdb}.primary-button .pi,.secondary-button .pi,.export-button .pi{font-size:9px}.results-card{overflow:hidden}.results-heading{padding:15px 17px 13px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--surface-border)}.results-title-line{display:flex;align-items:center;gap:8px;margin-bottom:4px}.results-title-line h2{margin:0}.count-badge{min-width:19px;height:18px;display:grid;place-items:center;padding:0 5px;border-radius:5px;background:#eef0ff;color:#5d68db;font-size:8px;font-weight:750}.app-dark .count-badge{background:#33375a;color:#aab0ff}.results-heading p{font-size:8px}.dot-separator{padding:0 4px}.export-button{height:29px}.export-button:disabled{opacity:.45;cursor:not-allowed}.table-tools{min-height:55px;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;gap:15px;border-bottom:1px solid var(--surface-border)}.global-search{width:218px;height:31px;display:flex;align-items:center;gap:8px;padding:0 9px;border:1px solid var(--surface-border);border-radius:6px;color:#9ba1b0}.global-search .pi{font-size:10px}.global-search input{width:100%;border:0;outline:0;background:transparent;color:var(--text-color);font:inherit;font-size:9px}.filter-tools{display:flex;align-items:center;gap:9px}.filter-tools label{display:flex;align-items:center;gap:6px;color:var(--text-color-secondary);font-size:8px}.filter-tools select{height:29px;width:auto;min-width:97px;padding:0 7px;font-size:8px}.table-container{overflow-x:auto}.business-name{display:flex;align-items:center;gap:8px;min-width:155px}.business-avatar{width:26px;height:26px;display:grid;place-items:center;flex:0 0 26px;border-radius:7px;background:#f0edff;color:#7461ce;font-size:8px;font-weight:750}.app-dark .business-avatar{background:#33304e;color:#b4a6ff}.business-name>div{display:grid;gap:3px}.business-name strong{color:var(--text-color);font-size:9px;font-weight:650}.business-name small{color:var(--text-color-secondary);font-size:7px}.category-label{display:inline-block;padding:4px 6px;border-radius:5px;background:var(--surface-ground);font-size:8px;white-space:nowrap}.rating-value{color:var(--text-color-secondary)}.rating-value .pi{color:#e8b149;font-size:8px}.status-tag{display:inline-flex;align-items:center;gap:5px;padding:4px 6px;border-radius:5px;white-space:nowrap;font-size:8px;font-weight:600}.unverified{background:#fff6e8;color:#a37937}.app-dark .unverified{background:#433923;color:#e2bd73}.unverified .pi{font-size:8px}.lead-new{background:#eef0ff;color:#5864dc}.app-dark .lead-new{background:#34375d;color:#aab0ff}.status-dot{width:5px;height:5px;border-radius:50%;background:#6673e8}.source-cell{display:inline-flex;align-items:center;gap:5px;color:var(--text-color-secondary);font-size:8px;white-space:nowrap}.source-cell .pi{font-size:9px}.row-action{width:25px;height:25px;display:grid;place-items:center;border:0;border-radius:5px;background:transparent;color:var(--text-color-secondary);cursor:pointer}.row-action:hover{background:var(--surface-ground)}.table-foot{display:flex;justify-content:space-between;gap:10px;padding:10px 16px;border-top:1px solid var(--surface-border);color:var(--text-color-secondary);font-size:8px}.table-foot .pi{font-size:9px;margin-right:4px}.empty-state{display:grid;justify-items:center;gap:7px;padding:35px 10px;color:var(--text-color-secondary)}.empty-state>span{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:var(--surface-ground);color:#7a83dd}.empty-state>span .pi{font-size:13px}.empty-state strong{color:var(--text-color);font-size:10px}.empty-state p{margin:0;font-size:9px}.pre-search{padding:25px 20px;display:grid;justify-items:center;text-align:center;border:1px dashed var(--surface-border);border-radius:10px;background:color-mix(in srgb,var(--surface-card) 55%,transparent)}.pre-icon{width:35px;height:35px;display:grid;place-items:center;border-radius:10px;background:#eef0ff;color:#616ce3;font-size:14px}.app-dark .pre-icon{background:#303455}.pre-search h2{margin:10px 0 4px;font-size:12px}.pre-search>p{max-width:440px;margin:0;color:var(--text-color-secondary);font-size:9px;line-height:1.6}.pre-meta{display:flex;gap:14px;margin-top:12px;color:var(--text-color-secondary);font-size:8px}.pre-meta .pi{margin-right:4px;color:#727be0;font-size:9px}
    :host ::ng-deep .discovery-table .p-datatable-table{width:100%;border-collapse:collapse}.table-container :host ::ng-deep .p-datatable-thead>tr>th,:host ::ng-deep .discovery-table th{padding:10px 8px;background:var(--surface-card);border-bottom:1px solid var(--surface-border);color:var(--text-color-secondary);font-size:8px;white-space:nowrap;text-align:left;font-weight:700}.table-container :host ::ng-deep .p-datatable-tbody>tr>td,:host ::ng-deep .discovery-table td{padding:8px;border-bottom:1px solid var(--surface-border);color:var(--text-color-secondary);font-size:8px;white-space:nowrap}.table-container :host ::ng-deep .p-sortable-column:hover{background:var(--surface-ground)}.table-container :host ::ng-deep .p-datatable-paginator-bottom{border:0;border-top:1px solid var(--surface-border);padding:7px 12px;background:var(--surface-card)}.table-container :host ::ng-deep .p-paginator{font-size:8px}.table-container :host ::ng-deep .p-paginator-page,.table-container :host ::ng-deep .p-paginator-next,.table-container :host ::ng-deep .p-paginator-prev{min-width:25px;height:25px;font-size:8px}.table-container :host ::ng-deep .p-paginator-page.p-paginator-page-selected{background:#eef0ff;color:#5e6ae3}
    @media(max-width:960px){.form-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.table-tools{align-items:flex-start;flex-direction:column}.global-search{width:min(100%,300px)}.filter-tools{width:100%;flex-wrap:wrap}.filter-tools label{flex:1}.filter-tools select{flex:1;min-width:0}}
    @media(max-width:600px){.page-heading{align-items:flex-start}.page-heading h1{font-size:21px}.local-tag{font-size:7px}.form-grid{grid-template-columns:1fr;gap:11px}.search-card{padding:14px 13px 0}.form-actions{align-items:flex-start;flex-direction:column;gap:9px;margin:14px -13px 0;padding:10px 13px}.form-actions>div{width:100%;justify-content:flex-end}.required-note{font-size:7px}.table-tools{padding:10px 11px}.filter-tools{gap:6px}.filter-tools label{display:grid;gap:4px}.filter-tools select{width:100%}.results-heading{padding:13px 12px}.table-foot{align-items:flex-start;flex-direction:column;padding:9px 12px}.notice{align-items:flex-start}.notice>.pi{margin-top:2px}}
  `]
})
export class DiscoveryComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(BusinessDiscoveryApiService);
  protected readonly options = signal<BusinessDiscoveryFilters | null>(null);
  protected readonly loading = signal(false);
  protected readonly filtersLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly totalRecords = signal(0);
  protected readonly pageNumber = signal(1);
  protected readonly sortField = signal('businessName');
  protected readonly sortOrder = signal(1);
  protected readonly form = this.fb.group({
    country: [''], region: [''], city: [''], categoryId: this.fb.control<number | null>(null),
    keyword: [''], websiteStatus: [''], minimumRating: this.fb.control<number | null>(null),
    maxResults: [20], source: [''], statusId: this.fb.control<number | null>(null)
  });
  protected readonly hasSearched = signal(false);
  private readonly allResults = signal<Business[]>([]);
  protected readonly tableCategory = signal<number | null>(null);
  protected readonly tableCountry = signal('');
  protected readonly tableWebsiteStatus = signal('');
  private globalTerm = '';
  private globalSearchTimer: ReturnType<typeof setTimeout> | null = null;
  private latestSearchRequest = 0;
  protected readonly filteredResults = computed(() => this.allResults());

  protected readonly categoryOptions = computed(() => this.options()?.categories ?? []);
  protected readonly countryOptions = computed(() => this.options()?.countries ?? []);
  protected readonly stateOptions = computed(() => this.options()?.states ?? []);
  protected readonly cityOptions = computed(() => this.options()?.cities ?? []);
  protected readonly websiteStatusOptions = computed(() => this.options()?.websiteStatuses ?? []);
  protected readonly leadStatusOptions = computed(() => this.options()?.leadStatuses ?? []);
  protected readonly sourceOptions = computed(() => this.options()?.sources ?? []);
  protected readonly pageSize = computed(() => this.form.controls.maxResults.value ?? 20);

  ngOnInit(): void { this.loadFilters(); }

  protected loadFilters(): void {
    this.filtersLoading.set(true);
    this.error.set(null);
    this.api.getFilters().subscribe({
      next: values => { this.options.set(values); this.filtersLoading.set(false); },
      error: error => { this.error.set(this.api.message(error)); this.filtersLoading.set(false); }
    });
  }

  protected search(): void {
    if (this.filtersLoading() || !this.options()) return;
    this.tableCategory.set(null); this.tableCountry.set(''); this.tableWebsiteStatus.set('');
    if (this.globalSearchTimer) clearTimeout(this.globalSearchTimer);
    this.globalTerm = '';
    this.hasSearched.set(true);
    this.loadPageData(1, this.form.controls.maxResults.value ?? 20, this.sortField(), this.sortOrder() === 1 ? 'asc' : 'desc');
  }
  protected reset(): void {
    this.form.reset({ country: '', region: '', city: '', categoryId: null, keyword: '', websiteStatus: '', minimumRating: null, maxResults: 20, source: '', statusId: null });
    this.hasSearched.set(false);
    this.allResults.set([]);
    this.totalRecords.set(0); this.pageNumber.set(1); this.globalTerm = '';
    this.latestSearchRequest++;
    if (this.globalSearchTimer) clearTimeout(this.globalSearchTimer);
    this.tableCategory.set(null); this.tableCountry.set(''); this.tableWebsiteStatus.set(''); this.error.set(null);
  }
  protected onLazyLoad(event: TableLazyLoadEvent): void {
    if (!this.hasSearched()) return;
    const size = event.rows ?? this.form.controls.maxResults.value ?? 20;
    const page = Math.floor((event.first ?? 0) / size) + 1;
    const sort = typeof event.sortField === 'string' ? event.sortField : this.sortField();
    const order = event.sortOrder === -1 ? 'desc' : 'asc';
    this.form.controls.maxResults.setValue(size, { emitEvent: false });
    this.sortField.set(sort); this.sortOrder.set(order === 'asc' ? 1 : -1);
    this.loadPageData(page, size, sort, order);
  }
  protected applyGlobalSearch(event: Event, table: Table): void {
    this.globalTerm = (event.target as HTMLInputElement).value.trim();
    table.first = 0;
    if (this.globalSearchTimer) clearTimeout(this.globalSearchTimer);
    if (this.hasSearched()) this.globalSearchTimer = setTimeout(() =>
      this.loadPageData(1, this.form.controls.maxResults.value ?? 20, this.sortField(), this.sortOrder() === 1 ? 'asc' : 'desc'), 300);
  }
  protected setTableFilter(event: Event, field: string, table: Table): void {
    const value = (event.target as HTMLSelectElement).value;
    if (field === 'category') this.tableCategory.set(value ? Number(value) : null);
    else if (field === 'country') this.tableCountry.set(value);
    else this.tableWebsiteStatus.set(value);
    table.first = 0;
    if (this.globalSearchTimer) clearTimeout(this.globalSearchTimer);
    this.loadPageData(1, this.form.controls.maxResults.value ?? 20, this.sortField(), this.sortOrder() === 1 ? 'asc' : 'desc');
  }
  protected initials(name: string): string { return name.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase(); }

  protected websiteStatusLabel(status: string): string {
    if (status === 'VERIFIED') return 'Website verified';
    if (status === 'MISSING' || status === 'NO_WEBSITE') return 'Missing';
    return status === 'UNVERIFIED' ? 'Unverified' : status;
  }

  private loadPageData(pageNumber: number, pageSize: number, sortBy: string, sortOrder: 'asc' | 'desc'): void {
    const form = this.form.getRawValue();
    const request: BusinessDiscoverySearchRequest = {
      search: this.globalTerm || undefined, keyword: form.keyword?.trim() || undefined,
      country: this.tableCountry() || form.country?.trim() || undefined,
      state: form.region?.trim() || undefined, city: form.city?.trim() || undefined,
      categoryId: this.tableCategory() ?? form.categoryId ?? undefined,
      websiteStatus: this.tableWebsiteStatus() || form.websiteStatus || undefined,
      minRating: form.minimumRating ?? undefined, source: form.source?.trim() || undefined,
      statusId: form.statusId ?? undefined, pageNumber, pageSize, sortBy, sortOrder
    };
    const requestId = ++this.latestSearchRequest;
    this.loading.set(true); this.error.set(null); this.pageNumber.set(pageNumber);
    this.api.search(request).subscribe({
      next: result => {
        if (requestId !== this.latestSearchRequest) return;
        this.allResults.set(result.items.map(item => this.toBusiness(item)));
        this.totalRecords.set(result.totalRecords); this.loading.set(false);
      },
      error: error => { if (requestId !== this.latestSearchRequest) return; this.allResults.set([]); this.totalRecords.set(0); this.error.set(this.api.message(error)); this.loading.set(false); }
    });
  }

  private toBusiness(lead: BusinessDiscoveryLead): Business {
    return {
      id: Number(lead.id), name: lead.businessName, category: lead.categoryName ?? 'Uncategorized',
      country: lead.country ?? '', region: lead.region ?? '', city: lead.city ?? '',
      rating: lead.rating, reviews: lead.reviewCount,
      websiteStatus: lead.websiteStatus === 'VERIFIED' ? 'Verified' : lead.websiteStatus === 'MISSING' || lead.websiteStatus === 'NO_WEBSITE' ? 'No website' : lead.websiteStatus === 'UNVERIFIED' ? 'Unverified' : lead.websiteStatus,
      websiteUrl: lead.websiteUrl, leadStatus: lead.statusName,
      source: lead.source ?? 'Unknown source', demo: false
    };
  }
}
