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

export interface Debtor {
  id: string;
  type: "corp" | "ind";
  name: string;
  ceo?: string;
  bizNo?: string;
  rrn?: string;
  phone?: string;
  address?: string;
  caseNo?: string;
  amount?: number;
  memo?: string;
  createdAt: string;
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
  solDt?: string;
  projUrl?: string;
  docs?: DocAttachment[];
  tl: TimelineEntry[];
  fu: FollowUp[];
  debtorId?: string;
  debtorInfo?: {
    type?: string;
    phone?: string;
    address?: string;
    bizNo?: string;
    rrn?: string;
    ceo?: string;
    caseNo?: string;
  };
}

export type CaseType = "recv" | "disp";

export type TabId = "home" | "doc" | "recv" | "disp" | "stats" | "guide" | "debtors";
