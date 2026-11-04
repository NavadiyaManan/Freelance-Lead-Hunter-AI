import { Business } from '../models/business.model';

// Names were supplied in the project brief. Ratings, reviews, and websites were not supplied.
// Keep them unknown and mark every record as unverified demo data.
export const MOCK_BUSINESSES: Business[] = [
  'Bindi Beauty Salon', 'Denish The Family Salon', 'K Hair & Beauty Studio',
  'Cut & Crown Unisex Salon', 'Vrunda Beauty Care And Classes', 'Apex Hair Cut',
  'The Shivas Salon', "DK's Unisex Salon", 'Anupam Hair Salon R K', 'PAVAN HAIR ART',
  'Rameshwar Hair Art', 'The Beauty Bounty Salon', 'DA VILLA HAIR AND BEAUTY CARE'
].map((name, index) => ({
  id: index + 1,
  name,
  category: 'Beauty & hair salon',
  country: 'India',
  region: 'Gujarat',
  city: 'Bhavnagar',
  rating: null,
  reviews: null,
  websiteStatus: 'Unverified',
  websiteUrl: null,
  leadStatus: 'New',
  source: 'Manual import',
  demo: true
}));
