'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { SportData } from '../utils/types';

interface FileUploaderProps {
  onDataLoaded: (data: SportData[]) => void;
}

interface CsvRow {
  統計年度: string;
  資料來源: string;
  分析標的: string;
  分析內容: string;
  統計項目: string;
  統計項目說明: string;
  分析結果值: string;
  分析結果單位: string;
}

export default function FileUploader({ onDataLoaded }: FileUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsLoading(false);
        try {
          const parsedData = results.data.map((row) => ({
            統計年度: row['統計年度'],
            資料來源: row['資料來源'],
            分析標的: row['分析標的'],
            分析內容: row['分析內容'],
            統計項目: row['統計項目'],
            統計項目說明: row['統計項目說明'],
            分析結果值: parseFloat(row['分析結果值']),
            分析結果單位: row['分析結果單位'],
          })) as SportData[];
          
          onDataLoaded(parsedData);
        } catch (error) {
          setError('檔案解析錯誤，請確保您上傳的CSV格式正確');
          console.error('解析錯誤:', error);
        }
      },
      error: (error) => {
        setIsLoading(false);
        setError(`檔案解析錯誤: ${error.message}`);
        console.error('解析錯誤:', error);
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-md shadow-md">
      <div className="p-3 mb-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
        <p><strong>數據來源說明：</strong></p>
        <p>預設資料來自 <a href="https://data.gov.tw/dataset/24375" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://data.gov.tw/dataset/24375</a></p>
        <p>版本日期：2024-07-23 14:23</p>
        <p>上傳的檔案必須是同一來源的更新版本</p>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2" htmlFor="file-upload">
          上傳運動現況統計資料 (CSV)
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {isLoading && (
        <div className="text-center py-2">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">正在解析檔案...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
          <strong className="font-bold">錯誤！</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>支援的檔案格式: CSV</p>
        <p className="mt-1">檔案應包含以下欄位: 統計年度, 資料來源, 分析標的, 分析內容, 統計項目, 統計項目說明, 分析結果值, 分析結果單位</p>
      </div>
    </div>
  );
} 