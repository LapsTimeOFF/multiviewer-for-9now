export interface ConfigSchema {
  passToken?: string;
  RMUToken?: string;
  LiveToken?: string;
  userKeyId?: string;
  deviceKeyId?: string;
}

export interface InitLiveTV {
  ServiceResponse: ServiceResponse;
}

export interface ServiceResponse {
  Status: string;
  NowUTC: string;
  OutData: OutData;
}

export interface OutData {
  User: User;
  LiveToken: string;
  RMUToken: string;
  StreamTokens: StreamTokens;
  PDS: Pds;
}

export interface User {
  EncryptionMethod: unknown;
}

export interface StreamTokens {
  StreamToken: StreamToken[];
}

export interface StreamToken {
  Type: string;
  Value: string;
}

export interface Pds {
  ChannelsGroups: ChannelsGroups;
}

export interface ChannelsGroups {
  ChannelsGroup: ChannelsGroup[];
}

export interface ChannelsGroup {
  GroupType: string;
  Channels: Channel[];
}

export interface Channel {
  Nb: string;
  EpgId: string;
  Name: string;
  LineUp: string;
  LogoUrl: string;
  Them: string;
  ThImgUrl: string;
  ThOrder: string;
  IsAdAntiSkip?: string;
  NoSeekDurationForAdAtBeginning?: string;
  NoSeekDurationForAdAfterBeginning?: string;
  DisplayAdWhenMakingStartOver?: string;
  HasCat5: string;
  FullCat5: string;
  AuthentOnly: string;
  SubscribedOnly: string;
  DVR?: string;
  IsCastable?: string;
  StreamType: string;
  StreamTokenType: string;
  WSXUrl: string;
  AccessRights: AccessRights;
  IsAdSwitch?: string;
  NoEncrypt?: string;
  Hybrid?: string;
  IsReline?: string;
  ExtraLineUp?: string;
  FreeAccess?: string;
}

export interface AccessRights {
  NoAccess: string;
  Cat5Access: string;
}

export interface ManifestList {
  cdn: string;
  dvr: Stream;
  nodvr: Stream;
  primary: Stream;
  route: string;
  type: string;
  session: Session;
}

export interface Stream {
  src: string;
}

export interface Session {
  exp: number;
}
