export interface ReportContentText {
  type: 'h4' | 'p';
  text: string;
}
export interface ReportContentList {
  type: 'ul';
  items: string[];
}

export interface ReportContentTierChart {
  type: 'tierChart';
  items: { label: string; value: string }[];
}

export type ReportContent = ReportContentText | ReportContentList | ReportContentTierChart;

export interface ReportSection {
  title: string;
  content: ReportContent[];
}