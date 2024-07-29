/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BrightcoveGetStream {
  description: string;
  tags: any[];
  cue_points: any[];
  custom_fields: CustomFields;
  account_id: string;
  sources: Source[];
  name: string;
  reference_id: string;
  long_description: any;
  duration: number;
  economics: string;
  text_tracks: any[];
  published_at: string;
  created_at: string;
  updated_at: string;
  offline_enabled: boolean;
  link: any;
  id: string;
  ad_keys: any;
}

export interface CustomFields {
  media_type: string;
}

export interface Source {
  asset_id: string;
  src: string;
  type: string;
}
