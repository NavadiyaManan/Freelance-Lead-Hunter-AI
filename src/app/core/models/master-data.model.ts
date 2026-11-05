export interface MasterDataOption { id: number; name: string; code: string; }
export interface MasterDataItem extends MasterDataOption { description: string | null; isActive: boolean; createdAt: string; updatedAt: string | null; }
export interface CountryOption extends MasterDataOption { isActive: boolean; }
export interface StateOption extends MasterDataOption { countryId: number; isActive: boolean; }
export interface CityOption extends MasterDataOption { stateId: number; isActive: boolean; }
export interface MasterDataDropdowns {
  businessCategories: MasterDataOption[];
  leadStatuses: MasterDataOption[];
  leadSources: MasterDataOption[];
  websiteStatuses: MasterDataOption[];
  countries: CountryOption[];
}
