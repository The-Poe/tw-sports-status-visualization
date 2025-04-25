// 定義資料結構
export interface SportData {
  統計年度: string;
  資料來源: string;
  分析標的: string;
  分析內容: string;
  統計項目: string;
  統計項目說明: string;
  分析結果值: number;
  分析結果單位: string;
}

// 定義資料分類類型
export type CategoryType = '性別' | '年齡' | '教育程度' | '婚姻狀況' | '身體質量指數' | '縣市';

// 定義分析內容類型
export type AnalysisContentType = '7333規律運動' | '7330運動狀況' | '7230運動狀況' | '7100運動狀況' | string;

// 定義分析標的類型
export type AnalysisTargetType = '規律運動比例' | string;

// 定義圖表類型
export enum ChartViewType {
  CATEGORY = '類別分析',
  TIME_SERIES = '時間分析'
} 