export interface Catalogs {
  currentPage: CurrentPage;
  tracking?: Tracking;
  channels?: Channel[];
  paging?: Paging;
  meta: Meta;
  features?: Feature[];
  pageParameters: PageParameters;
  context?: Context;
  rubriques?: Rubrique[];
}

export interface Channel {
  type: Type;
  epgID: number;
  Name: string;
  URLLogoChannel: string;
  contents: Content[];
}

export interface Content {
  contentID: string;
  broadcastID: string;
  URLImage: string;
  title: string;
  subtitle?: string;
  startTime: number;
  endTime: number;
  onClick: ContentOnClick;
}

export interface ContentOnClick {
  displayTemplate: OnClickDisplayTemplate;
  templateMode: TemplateMode;
  URLPage: string;
  URLInfo: string;
  playerInfo: PlayerInfo;
}

export enum OnClickDisplayTemplate {
  Player = "player"
}

export interface PlayerInfo {
  displayTemplate: PlayerInfoDisplayTemplate;
  displayName: string;
  URLPage: string;
  parameters: PlayerInfoParameter[];
}

export enum PlayerInfoDisplayTemplate {
  PlayerInfo = "playerInfo"
}

export interface PlayerInfoParameter {
  id: ID;
  in: In;
}

export enum ID {
  FeatureToggles = "featureToggles",
  XxEpgID = "xx-epg-id"
}

export enum In {
  Headers = "headers",
  Parameters = "parameters"
}

export enum TemplateMode {
  LiveTV = "liveTV"
}

export enum Type {
  LiveChannel = "liveChannel"
}

export interface Context {
  contextType: string;
  contextDetail: string;
  context_type: string;
  context_page_title: string;
  context_list_title: string;
  context_list_id: string;
  context_list_type: ContextListType;
  context_list_position: number;
}

export enum ContextListType {
  LiveGrid = "liveGrid"
}

export interface CurrentPage {
  displayTemplate: string;
  displayName: string;
  path: string;
  alternate: { [key: string]: Alternate };
  BOName?: string;
  BOLayoutName?: string;
  displayType?: string;
  templateMode?: TemplateMode;
}

export interface Alternate {
  fr: Fr;
}

export interface Fr {
  path: string;
}

export interface Feature {
  type: string;
  URLImage: string;
  title: string;
  contentID: string;
  onClick: FeatureOnClick;
}

export interface FeatureOnClick {
  displayTemplate: string;
  displayName: string;
  URLPage: string;
  parameters: OnClickParameter[];
}

export interface OnClickParameter {
  in: In;
  id: ID;
  enum?: Enum[];
}

export enum Enum {
  DetailLight = "detailLight"
}

export interface Meta {
  title: string;
  canonical: string;
  description?: string;
}

export interface PageParameters {
  displayedPrograms?: DisplayedPrograms;
  displayType?: string;
}

export enum DisplayedPrograms {
  Now = "now"
}

export interface Paging {
  iterationType: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nbContents: number;
  idStart: string;
  idEnd: string;
}

export interface Rubrique {
  displayTemplate: ContextListType;
  displayName: string;
  path: string;
  perso?: string;
  displayAllChannels?: boolean;
  displayOnlyFavoriteChannels?: boolean;
  displayedPrograms: DisplayedPrograms;
  idRubrique: string;
  URLPage: string;
  parameters: OnClickParameter[];
  default?: boolean;
  adult?: boolean;
}

export interface Tracking {
  dataLayer: DataLayer;
}

export interface DataLayer {
  page_level_1: string;
  page_level_2: string;
  page_level_3: string;
  bo_layout: string;
  user_profile: string;
  page_name: string;
  page_title: string;
  page_display_title: string;
  channel: string;
  content_protection: string;
  cover: boolean;
}
