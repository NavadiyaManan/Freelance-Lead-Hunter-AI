import { DatePipe } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BusinessLeadsApiService } from "../../core/services/business-leads-api.service";
import { MasterDataApiService } from "../../core/services/master-data-api.service";
import { CityOption, CountryOption, MasterDataDropdowns, MasterDataOption, StateOption } from "../../core/models/master-data.model";
import { BusinessLead, LeadOption, LeadPage, LeadQuery, LeadWrite } from "../../core/models/business-lead.model";
import { ActivityCode, FollowUp, LeadActivity, LeadActivityWrite, RecentActivity, StatusHistory } from "../../core/models/lead-activity.model";
import { LeadActivitiesApiService } from "../../core/services/lead-activities-api.service";

@Component({ selector: "app-business-leads", standalone: true, imports: [FormsModule, DatePipe], templateUrl: "./business-leads.component.html", styleUrl: "./business-leads.component.css" })
export class BusinessLeadsComponent implements OnInit {
  private readonly api = inject(BusinessLeadsApiService);
  protected readonly master = inject(MasterDataApiService);
  private readonly activityApi = inject(LeadActivitiesApiService);
  readonly page = signal<LeadPage | null>(null); readonly categories = signal<LeadOption[]>([]); readonly statuses = signal<LeadOption[]>([]);
  readonly websiteStatuses = signal<MasterDataOption[]>([]); readonly sources = signal<MasterDataOption[]>([]);
  readonly countries = signal<CountryOption[]>([]); readonly states = signal<StateOption[]>([]); readonly cities = signal<CityOption[]>([]);
  readonly activityLead = signal<BusinessLead | null>(null); readonly activities = signal<LeadActivity[]>([]); readonly statusHistory = signal<StatusHistory[]>([]);
  readonly activityTypes = signal<ActivityCode[]>([]); readonly activityOutcomes = signal<ActivityCode[]>([]);
  readonly activityPageNumber = signal(1); readonly activityTotalPages = signal(0); readonly historyPageNumber = signal(1); readonly historyTotalPages = signal(0);
  readonly upcomingFollowUps = signal<FollowUp[]>([]); readonly overdueFollowUps = signal<FollowUp[]>([]); readonly recentActivities = signal<RecentActivity[]>([]);
  readonly activityLoading = signal(false); readonly activityOptionsLoading = signal(false); readonly activitySaving = signal(false); readonly activityError = signal<string | null>(null); readonly activitySummaryError = signal<string | null>(null);
  activityDraft = this.emptyActivityDraft(); protected editingActivityId: number | null = null;
  readonly loading = signal(false); readonly saving = signal(false); readonly error = signal<string | null>(null); readonly formOpen = signal(false); readonly editing = signal(false);
  query: LeadQuery = { pageNumber: 1, pageSize: 10, sortBy: "createdAt", sortOrder: "desc" };
  filters: Record<string, string | number | undefined> = {};
  draft: LeadWrite = this.emptyDraft(); protected editingId: number | null = null;
  ngOnInit(): void { this.master.getDropdowns().subscribe({ next: data => { this.setMasterData(data); this.draft.statusId = data.leadStatuses[0]?.id ?? 0; this.load(); }, error: e => this.error.set(this.master.message(e)) }); this.loadActivitySummary(); }
  private setMasterData(data: MasterDataDropdowns): void { this.categories.set(data.businessCategories); this.statuses.set(data.leadStatuses); this.sources.set(data.leadSources); this.websiteStatuses.set(data.websiteStatuses); this.countries.set(data.countries); }
  countryChanged(value: string | null): void { this.states.set([]); this.cities.set([]); this.draft.region = null; this.draft.city = null; const country = this.countries().find(x => x.name === value); if (country) this.master.getStates(country.id).subscribe({ next: values => this.states.set(values), error: e => this.error.set(this.master.message(e)) }); }
  stateChanged(value: string | null): void { this.cities.set([]); this.draft.city = null; const state = this.states().find(x => x.name === value); if (state) this.master.getCities(state.id).subscribe({ next: values => this.cities.set(values), error: e => this.error.set(this.master.message(e)) }); }
  load(): void { this.loading.set(true); this.error.set(null); this.api.list(this.query).subscribe({ next: data => { this.page.set(data); this.loading.set(false); }, error: e => { this.error.set(this.api.message(e)); this.loading.set(false); } }); }
  apply(): void { const f = this.filters; const websiteStatus = this.str(f['websiteStatus']); this.query = { ...this.query, pageNumber: 1, search: this.str(f['search']), categoryId: this.num(f['categoryId']), statusId: this.num(f['statusId']), country: this.str(f['country']), state: this.str(f['state']), city: this.str(f['city']), websiteStatus: websiteStatus === 'MISSING' ? 'NO_WEBSITE' : websiteStatus, source: this.str(f['source']), minRating: this.num(f['minRating']), fromDate: this.str(f['fromDate']), toDate: this.str(f['toDate']) }; this.load(); }
  clear(): void { this.filters = {}; this.apply(); }
  sort(field: string): void { this.query = { ...this.query, sortBy: field, sortOrder: this.query.sortBy === field && this.query.sortOrder === 'asc' ? 'desc' : 'asc', pageNumber: 1 }; this.load(); }
  location(lead: BusinessLead): string { return [lead.city, lead.region, lead.country].filter((part): part is string => !!part).join(', ') || "—"; }
  sortMark(field: string): string { return this.query.sortBy === field ? (this.query.sortOrder === 'asc' ? '↑' : '↓') : ''; }
  go(pageNumber: number): void { this.query = { ...this.query, pageNumber }; this.load(); }
  setPageSize(value: number): void { this.query = { ...this.query, pageSize: Number(value), pageNumber: 1 }; this.load(); }
  newLead(): void { this.editingId = null; this.editing.set(false); this.draft = this.emptyDraft(); this.draft.statusId = this.statuses()[0]?.id ?? 0; this.formOpen.set(true); this.countryChanged(this.draft.country); }
  edit(lead: BusinessLead): void { this.editingId = lead.id; this.editing.set(true); this.draft = { businessName: lead.businessName, categoryId: lead.categoryId, statusId: lead.statusId, city: lead.city, region: lead.region, country: lead.country, websiteUrl: lead.websiteUrl, websiteStatus: this.master.websiteStatusCode(lead.websiteStatus), rating: lead.rating, reviewCount: lead.reviewCount, source: lead.source }; this.formOpen.set(true); if (lead.country) this.master.getCountries(true).subscribe({ next: values => { this.countries.set(values); const c = values.find(x => x.name === lead.country); if (c) this.master.getStates(c.id, true).subscribe({ next: states => { this.states.set(states); const s = states.find(x => x.name === lead.region); if (s) this.master.getCities(s.id, true).subscribe({ next: cities => this.cities.set(cities) }); } }); } }); }
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
  openActivities(lead: BusinessLead): void { this.activityLead.set(lead); this.activityDraft=this.emptyActivityDraft(); this.editingActivityId=null; this.activityLoading.set(true); this.activityOptionsLoading.set(true); this.activityError.set(null); this.activityApi.options().subscribe({ next:o=>{this.activityTypes.set(o.activityTypes);this.activityOutcomes.set(o.outcomes);this.activityOptionsLoading.set(false);},error:e=>{this.activityError.set(this.activityApi.message(e));this.activityOptionsLoading.set(false);} }); this.refreshActivityTimeline(lead.id); }
  closeActivities(): void { this.activityLead.set(null); this.activityError.set(null); }
  refreshActivityTimeline(leadId=this.activityLead()?.id): void { if(!leadId)return; this.activityPageNumber.set(1);this.historyPageNumber.set(1);this.activityLoading.set(true); this.activityApi.timeline(leadId,1).subscribe({next:p=>{this.activities.set(p.items);this.activityTotalPages.set(p.totalPages);this.activityLoading.set(false);},error:e=>{this.activityError.set(this.activityApi.message(e));this.activityLoading.set(false);}}); this.activityApi.history(leadId,1).subscribe({next:p=>{this.statusHistory.set(p.items);this.historyTotalPages.set(p.totalPages);},error:e=>this.activityError.set(this.activityApi.message(e))}); }
  loadMoreActivities():void{const id=this.activityLead()?.id;if(!id)return;const next=this.activityPageNumber()+1;this.activityApi.timeline(id,next).subscribe({next:p=>{this.activities.update(items=>[...items,...p.items]);this.activityPageNumber.set(next);},error:e=>this.activityError.set(this.activityApi.message(e))});}
  loadMoreHistory():void{const id=this.activityLead()?.id;if(!id)return;const next=this.historyPageNumber()+1;this.activityApi.history(id,next).subscribe({next:p=>{this.statusHistory.update(items=>[...items,...p.items]);this.historyPageNumber.set(next);},error:e=>this.activityError.set(this.activityApi.message(e))});}
  editActivity(item:LeadActivity):void{this.editingActivityId=item.id;this.activityDraft={activityTypeCode:item.activityTypeCode,subject:item.subject,description:item.description??'',outcomeCode:item.outcomeCode??'',activityAt:this.toLocalInput(item.activityAt),followUpAt:item.followUpAt?this.toLocalInput(item.followUpAt):''};}
  cancelActivityEdit():void{this.editingActivityId=null;this.activityDraft=this.emptyActivityDraft();}
  saveActivity():void{const lead=this.activityLead();const d=this.activityDraft;if(!lead)return;if(!d.subject.trim()||!d.activityTypeCode||!d.activityAt){this.activityError.set('Activity type, subject, and activity date are required.');return;}const request:LeadActivityWrite={activityTypeCode:d.activityTypeCode,subject:d.subject.trim(),description:d.description.trim()||null,outcomeCode:d.outcomeCode||null,activityAt:new Date(d.activityAt).toISOString(),followUpAt:d.followUpAt?new Date(d.followUpAt).toISOString():null};if(request.followUpAt&&new Date(request.followUpAt)<new Date(request.activityAt)){this.activityError.set('Follow-up date must be on or after the activity date.');return;}this.activitySaving.set(true);this.activityError.set(null);const op=this.editingActivityId?this.activityApi.update(this.editingActivityId,request):this.activityApi.add(lead.id,request);op.subscribe({next:()=>{this.activitySaving.set(false);this.cancelActivityEdit();this.refreshActivityTimeline(lead.id);this.loadActivitySummary();},error:e=>{this.activitySaving.set(false);this.activityError.set(this.activityApi.message(e));}});}
  deleteActivity(item:LeadActivity):void{if(!window.confirm(`Delete activity “${item.subject}”?`))return;this.activityApi.delete(item.id).subscribe({next:()=>{const lead=this.activityLead();if(lead)this.refreshActivityTimeline(lead.id);this.loadActivitySummary();},error:e=>this.activityError.set(this.activityApi.message(e))});}
  completeFollowUp(item:FollowUp):void{this.activityApi.complete(item.id).subscribe({next:()=>this.loadActivitySummary(),error:e=>this.activitySummaryError.set(this.activityApi.message(e))});}
  private loadActivitySummary():void{this.activitySummaryError.set(null);this.activityApi.followUps('UPCOMING').subscribe({next:p=>this.upcomingFollowUps.set(p.items),error:e=>this.activitySummaryError.set(this.activityApi.message(e))});this.activityApi.followUps('OVERDUE').subscribe({next:p=>this.overdueFollowUps.set(p.items),error:e=>this.activitySummaryError.set(this.activityApi.message(e))});this.activityApi.recent().subscribe({next:p=>this.recentActivities.set(p.items),error:e=>this.activitySummaryError.set(this.activityApi.message(e))});}
  private emptyActivityDraft():{activityTypeCode:string;subject:string;description:string;outcomeCode:string;activityAt:string;followUpAt:string}{return{activityTypeCode:'CALL',subject:'',description:'',outcomeCode:'',activityAt:this.toLocalInput(new Date().toISOString()),followUpAt:''};}
  private toLocalInput(value:string):string{const d=new Date(value);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);}
  private emptyDraft(): LeadWrite { return { businessName: '', categoryId: null, statusId: 0, city: null, region: null, country: 'India', websiteUrl: null, websiteStatus: 'UNVERIFIED', rating: null, reviewCount: null, source: null }; }
  private clean(value: string | null): string | null { return typeof value === 'string' && value.trim() ? value.trim() : null; }
  private str(value: string | number | undefined): string | undefined { return value === undefined || value === '' ? undefined : String(value); }
  private num(value: string | number | undefined): number | undefined { return value === undefined || value === '' ? undefined : Number(value); }
}




