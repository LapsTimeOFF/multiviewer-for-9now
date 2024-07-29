/* eslint-disable @typescript-eslint/no-explicit-any */
export interface GetLiveExperience {
  data: Data;
}

export interface Data {
  getLXP: GetLxp;
}

export interface GetLxp {
  market: Market;
  region: Region;
  stream: Stream;
  switcherRail: SwitcherRail[];
  promoRail: PromoRail;
}

export interface Market {
  id: number;
  name: string;
  regionId: number;
  oztamPublisherId: string;
  createdAt: string;
  updatedAt: string;
  state: string;
}

export interface Region {
  short: string;
  fullName: string;
}

export interface Stream {
  type: string;
  slug: string;
  display: Display;
  video: Video;
}

export interface Display {
  color: string;
  tagline: string;
  offset: number;
  promoImage: PromoImage;
  ssoImage: SsoImage;
  listings: Listing[];
  buttons: Buttons;
}

export interface PromoImage {
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

export interface SsoImage {
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

export interface Listing {
  title: string;
  subtitle: any;
  tvSeriesSlug: string;
  description: string;
  classification: string;
  genreString: string;
  hasStreamingRights: boolean;
  promoStartDate: any;
  startDate: string;
  endDate: string;
  programStartDate: any;
  programEndDate: any;
  secondaryListing: SecondaryListing;
}

export interface SecondaryListing {
  title?: string;
  subTitle: any;
  tagline?: string;
  startTime?: string;
  endTime?: string;
  programStartDate: any;
  programEndDate: any;
}

export interface Buttons {
  startOverButton: StartOverButton;
  jumpToLiveButton: any;
  watchFromStartButton: any;
}

export interface StartOverButton {
  text: string;
  time: string;
  icon: any;
}

export interface Video {
  referenceId: string;
  oztamPublisherId: string;
  ssai: Ssai;
  drm: any;
  url: string;
  assetId: any;
  fallbackId: string;
  streamType: string;
  hasDrm: boolean;
  isDai: boolean;
  quality: string;
  signpost: string;
}

export interface Ssai {
  postfixParams: string;
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

export interface Airing {
  title: string;
  startDate: string;
  endDate: string;
  hasStreamingRights: boolean;
}

export interface PromoRail {
  id: string;
  title: string;
  type: string;
  items: Item[];
}

export interface Item {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  image: Image;
}

export interface Image {
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
