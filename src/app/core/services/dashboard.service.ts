import { Injectable, computed, inject } from '@angular/core';
import { LeadService } from './lead.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly leads = inject(LeadService);
  readonly businesses = this.leads.businesses;
  readonly total = computed(() => this.businesses().length);
  readonly newLeads = computed(() => this.businesses().filter((business) => business.leadStatus === 'New').length);
  readonly qualified = computed(() => this.businesses().filter((business) => business.leadStatus === 'Qualified').length);
  readonly interested = computed(() => this.businesses().filter((business) => business.leadStatus === 'Interested').length);
}
