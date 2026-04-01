export interface AmountInfo {
  orig: number;
  paid: number;
  extra: number;
}

export interface TimelineEntry {
  dt: string;
  ti: string;
  dc?: string;
  dn: boolean;
}

export interface FollowUp {
  dt: string;
  ti: string;
  dn: boolean;
}

export interface DocAttachment {
  title: string;
  url: string;
}

export type LabelColor =
  | "r" | "o" | "g" | "gr" | "b" | "gy"
  | "pk" | "rs" | "cr" | "tn" | "cy" | "sk"
  | "nv" | "vl" | "lv" | "mg" | "lm" | "mn"
  | "br" | "sl";

export interface Label {
  id: string;
  name: string;
  color: LabelColor;
}

export interface CaseCard {
  id: string;
  name: string;
  sub: string;
  col: string;
  labels: string[];
  drv: string;
  lu: string;
  amt?: AmountInfo;
  solDt?: string; // 소멸시효 날짜
  projUrl?: string; // 프로젝트 링크
  docs?: DocAttachment[];
  tl: TimelineEntry[];
  fu: FollowUp[];
}

export type CaseType = "recv" | "disp";

export type TabId = "home" | "doc" | "recv" | "disp" | "stats";
