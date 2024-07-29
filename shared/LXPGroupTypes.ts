/* eslint-disable @typescript-eslint/no-explicit-any */
export interface LiveExperienceGroup {
  data: Data;
}

export interface Data {
  getLXP: GetLxp;
}

export interface GetLxp {
  switcherRail: SwitcherRail[];
  promoRail: PromoRail;
  stream: Stream;
}

export interface SwitcherRail {
  type: string;
  signpost?: string;
  switcherLogo: SwitcherLogo;
  id: number;
  slug: string;
  name: string;
  color: string;
  quality?: string;
  selected: boolean;
  airings?: Airing[];
  eventCount?: string;
  isChannelGroup?: boolean;
  currentProgramName?: string;
  programStartDate?: string;
  programEndDate?: string;
  groupStartTime?: string;
  groupEndTime?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface SwitcherLogo {
  alt: string;
  sizes: Sizes;
  webpSizes: WebpSizes;
}

export interface Sizes {
  w320: string;
  w480: string;
  w768: string;
  w1280: string;
  w1920: string;
}

export interface WebpSizes {
  w320: string;
  w480: string;
  w768: string;
  w1280: string;
  w1920: string;
}

export interface Airing {
  title: string;
  startDate: string;
  endDate: string;
  hasStreamingRights: boolean;
}

export interface PromoRail {
  id: string;
  slug: string;
  type: string;
  items: Item[];
}

export interface Item {
  description: string;
  displayName: string;
  endDate: string;
  id: number;
  name: string;
  slug: string;
  promoStartDate: string;
  programStartDate: any;
  programEndDate: any;
  startDate: string;
  subtitle: string;
  type: string;
  image: Image;
}

export interface Image {
  alt: string;
  sizes: Sizes2;
  webpSizes: WebpSizes2;
}

export interface Sizes2 {
  w320: string;
  w480: string;
  w768: string;
  w1280: string;
  w1920: string;
}

export interface WebpSizes2 {
  w320: string;
  w480: string;
  w768: string;
  w1280: string;
  w1920: string;
}

export interface Stream {
  type: string;
  slug: string;
  display: Display;
}

export interface Display {
  color: string;
  tagline: string;
  offset: any;
  promoImage: PromoImage;
  ssoImage: SsoImage;
  listings: Listing[];
  buttons: any;
}

export interface PromoImage {
  sizes: Sizes3;
  webpSizes: WebpSizes3;
}

export interface Sizes3 {
  w320: string;
  w480: string;
  w768: string;
  w1280: string;
  w1920: string;
}

export interface WebpSizes3 {
  w320: string;
  w480: string;
  w768: string;
  w1280: string;
  w1920: string;
}

export interface SsoImage {
  alt: string;
  sizes: Sizes4;
  webpSizes: WebpSizes4;
}

export interface Sizes4 {
  w320: string;
  w480: string;
  w768: string;
  w1280: string;
  w1920: string;
}

export interface WebpSizes4 {
  w320: string;
  w480: string;
  w768: string;
  w1280: string;
  w1920: string;
}

export interface Listing {
  title: string;
  subtitle: string;
  tvSeriesSlug: any;
  description: string;
  classification: any;
  genreString: string;
  hasStreamingRights: boolean;
  promoStartDate: string;
  startDate: string;
  endDate: string;
  programStartDate: any;
  programEndDate: any;
  secondaryListing: SecondaryListing;
}

export interface SecondaryListing {
  title: any;
  subTitle: any;
  tagline: any;
  startTime: any;
  endTime: any;
  programStartDate: any;
  programEndDate: any;
}
