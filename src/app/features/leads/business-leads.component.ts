import { DatePipe } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BusinessLeadsApiService } from "../../core/services/business-leads-api.service";
import { BusinessLead, LeadOption, LeadPage, LeadQuery, LeadWrite } from "../../core/models/business-lead.model";

@Component({ selector: "app-business-leads", standalone: true, imports: [FormsModule, DatePipe], templateUrl: "./business-leads.component.html", styleUrl: "./business-leads.component.css" })
export class BusinessLeadsComponent implements OnInit {
  private readonly api = inject(BusinessLeadsApiService);
  readonly page = signal<LeadPage | null>(null); readonly categories = signal<LeadOption[]>([]); readonly statuses = signal<LeadOption[]>([]);
  readonly loading = signal(false); readonly saving = signal(false); readonly error = signal<string | null>(null); readonly formOpen = signal(false); readonly editing = signal(false);
  query: LeadQuery = { pageNumber: 1, pageSize: 10, sortBy: "createdAt", sortOrder: "desc" };
  filters: Record<string, string | number | undefined> = {};
  draft: LeadWrite = this.emptyDraft(); private editingId: number | null = null;
  ngOnInit(): void { this.api.options().subscribe({ next: data => { this.categories.set(data.categories); this.statuses.set(data.statuses); this.draft.statusId = data.statuses[0]?.id ?? 0; this.load(); }, error: e => this.error.set(this.api.message(e)) }); }
  load(): void { this.loading.set(true); this.error.set(null); this.api.list(this.query).subscribe({ next: data => { this.page.set(data); this.loading.set(false); }, error: e => { this.error.set(this.api.message(e)); this.loading.set(false); } }); }
  apply(): void { const f = this.filters; this.query = { ...this.query, pageNumber: 1, search: this.str(f['search']), categoryId: this.num(f['categoryId']), statusId: this.num(f['statusId']), country: this.str(f['country']), state: this.str(f['state']), city: this.str(f['city']), websiteStatus: this.str(f['websiteStatus']), source: this.str(f['source']), minRating: this.num(f['minRating']), fromDate: this.str(f['fromDate']), toDate: this.str(f['toDate']) }; this.load(); }
  clear(): void { this.filters = {}; this.apply(); }
  sort(field: string): void { this.query = { ...this.query, sortBy: field, sortOrder: this.query.sortBy === field && this.query.sortOrder === 'asc' ? 'desc' : 'asc', pageNumber: 1 }; this.load(); }
  location(lead: BusinessLead): string { return [lead.city, lead.region, lead.country].filter((part): part is string => !!part).join(', ') || "—"; }
  sortMark(field: string): string { return this.query.sortBy === field ? (this.query.sortOrder === 'asc' ? '↑' : '↓') : ''; }
  go(pageNumber: number): void { this.query = { ...this.query, pageNumber }; this.load(); }
  setPageSize(value: number): void { this.query = { ...this.query, pageSize: Number(value), pageNumber: 1 }; this.load(); }
  newLead(): void { this.editingId = null; this.editing.set(false); this.draft = this.emptyDraft(); this.draft.statusId = this.statuses()[0]?.id ?? 0; this.formOpen.set(true); }
  edit(lead: BusinessLead): void { this.editingId = lead.id; this.editing.set(true); this.draft = { businessName: lead.businessName, categoryId: lead.categoryId, statusId: lead.statusId, city: lead.city, region: lead.region, country: lead.country, websiteUrl: lead.websiteUrl, websiteStatus: lead.websiteStatus, rating: lead.rating, reviewCount: lead.reviewCount, source: lead.source }; this.formOpen.set(true); }
  close(): void { this.formOpen.set(false); }
  save(): void {
    this.draft = { ...this.draft, businessName: this.draft.businessName.trim(), city: this.clean(this.draft.city), region: this.clean(this.draft.region), country: this.clean(this.draft.country), websiteUrl: this.clean(this.draft.websiteUrl), source: this.clean(this.draft.source), rating: this.draft.rating === null ? null : Number(this.draft.rating), reviewCount: this.draft.reviewCount === null ? null : Number(this.draft.reviewCount) };
    if (!this.draft.businessName || this.draft.businessName.length > 200 || (this.draft.rating !== null && (this.draft.rating < 0 || this.draft.rating > 5)) || (this.draft.reviewCount !== null && this.draft.reviewCount < 0)) { this.error.set('Check the required business name, rating (0–5), and non-negative review count.'); return; }
    this.saving.set(true); this.error.set(null);
    const persist = () => (this.editing() ? this.api.update(this.editingId!, this.draft) : this.api.create(this.draft)).subscribe({ next: () => { this.saving.set(false); this.close(); this.load(); }, error: e => { this.saving.set(false); this.error.set(this.api.message(e)); } });
    if (!this.editing()) this.api.duplicates(this.draft).subscribe({ next: result => { const matches = result.matches.map(m => `${m.businessName} (${m.matchType})`).join('\n'); if (result.hasMatches && !window.confirm(`Possible duplicate matches found:\n${matches}\n\nThese are suggestions, not proof. Create anyway?`)) { this.saving.set(false); return; } persist(); }, error: e => { this.saving.set(false); this.error.set(this.api.message(e)); } }); else persist();
  }
  remove(lead: BusinessLead): void { if (!window.confirm(`Soft-delete “${lead.businessName}”? It will be hidden from normal lead lists.`)) return; this.api.remove(lead.id).subscribe({ next: () => this.load(), error: e => this.error.set(this.api.message(e)) }); }
  changeStatus(lead: BusinessLead, statusId: number): void { this.api.updateStatus(lead.id, Number(statusId)).subscribe({ next: () => this.load(), error: e => this.error.set(this.api.message(e)) }); }
  private emptyDraft(): LeadWrite { return { businessName: '', categoryId: null, statusId: 0, city: null, region: null, country: 'India', websiteUrl: null, websiteStatus: 'Unverified', rating: null, reviewCount: null, source: null }; }
  private clean(value: string | null): string | null { return typeof value === 'string' && value.trim() ? value.trim() : null; }
  private str(value: string | number | undefined): string | undefined { return value === undefined || value === '' ? undefined : String(value); }
  private num(value: string | number | undefined): number | undefined { return value === undefined || value === '' ? undefined : Number(value); }
}




