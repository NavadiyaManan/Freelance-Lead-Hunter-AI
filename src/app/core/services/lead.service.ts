import { Injectable, signal } from '@angular/core';
import { Business, DiscoveryFilters } from '../models/business.model';
import { MOCK_BUSINESSES } from '../mock-data/businesses';

@Injectable({ providedIn: 'root' })
export class LeadService {
  private readonly records = signal<Business[]>(MOCK_BUSINESSES);
  readonly businesses = this.records.asReadonly();

  search(filters: DiscoveryFilters): Business[] {
    const text = filters.keyword.trim().toLocaleLowerCase();
    const category = filters.category.toLocaleLowerCase();
    return this.records().filter((business) =>
      business.country === filters.country &&
      (!filters.region || business.region.toLocaleLowerCase().includes(filters.region.toLocaleLowerCase())) &&
      (!filters.city || business.city.toLocaleLowerCase().includes(filters.city.toLocaleLowerCase())) &&
      (filters.category === 'All local businesses' || (category.includes('salon') && business.category.toLocaleLowerCase().includes('salon')) || business.category.toLocaleLowerCase().includes(category.replace(/s$/, ''))) &&
      (!text || `${business.name} ${business.category} ${business.city}`.toLocaleLowerCase().includes(text)) &&
      (filters.websiteStatus === 'All businesses' || business.websiteStatus === filters.websiteStatus) &&
      (filters.minimumRating === null || (business.rating !== null && business.rating >= filters.minimumRating)) &&
      (filters.source === 'Manual import' || business.source === filters.source)
    ).slice(0, filters.maxResults);
  }
}
