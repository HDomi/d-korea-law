export interface Article {
  id: string;      // 제1조
  title: string;   // 제1조(목적)
  content: string; // 조문 내용
}

export interface LawItem {
  mst: string;           // 법령일련번호
  idNumber: string;      // 법령ID
  title: string;         // 법령명한글
  type: string;          // 제개정구분명
  date: string;          // 공포일자
  effectiveDate: string; // 시행일자
  department: string;    // 소관부처명
}

export interface LawSearchResponse {
  source: string;
  totalCount: number;
  laws: LawItem[];
}

export interface LawDetail {
  source: string;
  mst: string;
  idNumber: string;
  title: string;
  type: string;
  date: string;
  effectiveDate: string;
  department: string;
  articles: Article[];
}
