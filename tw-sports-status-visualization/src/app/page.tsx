'use client';

import { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import TimeSeriesChart from './components/TimeSeriesChart';
import DataTable from './components/DataTable';
import { SportData } from './utils/types';
import {
  getAnalysisTargets,
  getAnalysisContentsByTarget,
  getTimeSeriesData,
  getTimeSeriesTableData
} from './utils/dataProcessor';
import { fetchCsvData } from './utils/fetchCsvData';

export default function Home() {
  // 基本數據狀態
  const [data, setData] = useState<SportData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 分析選項狀態
  const [selectedAnalysisTarget, setSelectedAnalysisTarget] = useState<string>('規律運動比例');
  const [selectedAnalysisContent, setSelectedAnalysisContent] = useState<string>('散步/走路/健走');
  
  // 初始加載 CSV 數據
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const csvData = await fetchCsvData('/運動現況統計資料_運動現況統計資料.csv');
        setData(csvData);
        
        // 設置初始選項
        if (csvData.length > 0) {
          const targets = getAnalysisTargets(csvData);
          if (targets.length > 0) {
            setSelectedAnalysisTarget(targets[0]);
            
            const contents = getAnalysisContentsByTarget(csvData, targets[0]);
            if (contents.length > 0) {
              setSelectedAnalysisContent(contents[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('無法加載初始數據，請上傳您自己的 CSV 文件');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);
  
  // 可用選項
  const analysisTargets = getAnalysisTargets(data);
  const analysisContents = getAnalysisContentsByTarget(data, selectedAnalysisTarget);
  
  // 獲取圖表數據
  const chartData = getTimeSeriesData(data, selectedAnalysisTarget, selectedAnalysisContent);
  const tableData = getTimeSeriesTableData(data, selectedAnalysisTarget, selectedAnalysisContent);

  // 處理分析標的變更
  useEffect(() => {
    if (analysisContents.length > 0 && !analysisContents.includes(selectedAnalysisContent)) {
      setSelectedAnalysisContent(analysisContents[0]);
    }
  }, [selectedAnalysisTarget, analysisContents, selectedAnalysisContent]);

  // 處理數據加載
  const handleDataLoaded = (newData: SportData[]) => {
    setData(newData);

    // 重設選擇，確保選擇有效的類別和分析內容
    const newAnalysisTargets = getAnalysisTargets(newData);
    
    if (newAnalysisTargets.length > 0 && !newAnalysisTargets.includes(selectedAnalysisTarget)) {
      setSelectedAnalysisTarget(newAnalysisTargets[0]);
    }
  };

  // 構建圖表標題
  const chartTitle = `${selectedAnalysisTarget} - ${selectedAnalysisContent} - 隨時間變化趨勢`;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gray-100">
      <div className="max-w-6xl w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
          臺灣運動現況資料視覺化
        </h1>
        
        <div className="mb-8">
          <FileUploader onDataLoaded={handleDataLoaded} />
        </div>
        
        {isLoading ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">正在加載數據...</p>
          </div>
        ) : error ? (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">錯誤！</strong>
              <span className="block sm:inline"> {error}</span>
              <p className="mt-2">請使用上方的文件上傳器上傳您的 CSV 文件。</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600">沒有可用的數據。請上傳 CSV 文件。</p>
          </div>
        ) : (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">數據視覺化</h2>
            
            {/* 選擇分析標的和分析內容 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  分析標的 (Level 1)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedAnalysisTarget}
                  onChange={(e) => setSelectedAnalysisTarget(e.target.value)}
                >
                  {analysisTargets.map((target) => (
                    <option key={target} value={target}>
                      {target}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  分析內容 (Level 2)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedAnalysisContent}
                  onChange={(e) => setSelectedAnalysisContent(e.target.value)}
                  disabled={analysisContents.length === 0}
                >
                  {analysisContents.map((content) => (
                    <option key={content} value={content}>
                      {content}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* 顯示時間序列圖表 */}
            <div className="mb-8">
              <TimeSeriesChart data={chartData} title={chartTitle} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <DataTable 
                  data={tableData} 
                  title={`${selectedAnalysisTarget} - ${selectedAnalysisContent} - 歷年數據`} 
                />
              </div>
              
              <div>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">數據說明</h2>
                  </div>
                  <div className="p-6">
                    <p className="mb-4">
                      <strong>資料來源：</strong> 運動現況調查
                    </p>
                    <p className="mb-4">
                      <strong>統計年度：</strong> {data.length > 0 ? 
                        [...new Set(data.map(item => item.統計年度))].sort().join(', ') : 
                        '無數據'}
                    </p>
                    <p className="mb-4">
                      <strong>分析標的：</strong> {selectedAnalysisTarget}
                    </p>
                    <p className="mb-4">
                      <strong>分析內容：</strong> {selectedAnalysisContent}
                    </p>
                    <p className="mb-4">
                      <strong>說明：</strong> 本圖表展示 {selectedAnalysisContent} 在不同年度的變化趨勢，
                      並依據性別（男/女/整體）分別顯示，
                      可觀察該運動項目在年度間的整體變化以及不同性別間的差異。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

