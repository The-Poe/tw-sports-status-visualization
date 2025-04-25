import Papa from 'papaparse';
import { SportData } from './types';

interface CsvRow {
  統計年度: string;
  資料來源?: string;
  分析標的?: string;
  分析內容?: string;
  統計項目?: string;
  統計項目說明?: string;
  分析結果值: string;
  分析結果單位?: string;
}

export const fetchCsvData = async (url: string): Promise<SportData[]> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV data: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse<CsvRow>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const parsedData = results.data
              .filter((row) => 
                row['統計年度'] && 
                row['分析結果值'] && 
                !isNaN(parseFloat(row['分析結果值']))
              )
              .map((row) => ({
                統計年度: row['統計年度'],
                資料來源: row['資料來源'] || '',
                分析標的: row['分析標的'] || '',
                分析內容: row['分析內容'] || '',
                統計項目: row['統計項目'] || '',
                統計項目說明: row['統計項目說明'] || '',
                分析結果值: parseFloat(row['分析結果值']),
                分析結果單位: row['分析結果單位'] || '百分比',
              })) as SportData[];
            
            resolve(parsedData);
          } catch (error: unknown) {
            reject(new Error(`Error parsing CSV data: ${error instanceof Error ? error.message : String(error)}`));
          }
        },
        // @ts-expect-error - PapaParse 類型定義有問題，但功能正常
        error: (error) => {
          reject(new Error(`Error parsing CSV: ${error.message}`));
        }
      });
    });
  } catch (error: unknown) {
    console.error('Error fetching CSV data:', error);
    return [];
  }
}; 