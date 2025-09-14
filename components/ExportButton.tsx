import React, { useState } from 'react';
import { Download } from 'lucide-react';
import type { SiteData } from '../types';
import { generateStaticSite } from '../services/staticGenerator';

interface ExportButtonProps {
  siteData: SiteData;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ siteData }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await generateStaticSite(siteData);
    } catch (error) {
      console.error('Export failed:', error);
      alert('エクスポートに失敗しました。もう一度お試しください。');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {isExporting ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          エクスポート中...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          HTMLサイトをダウンロード
        </>
      )}
    </button>
  );
};