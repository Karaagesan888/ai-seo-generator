import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { SeoForm } from './components/SeoForm';
import { SitePreview } from './components/SitePreview';
import { ExportButton } from './components/ExportButton';
import { generateSeoSite, generateNewArticles } from './services/geminiService';
import type { SiteData, Article, Page } from './types';

const EIGHT_HOURS_IN_MS = 8 * 60 * 60 * 1000;

const App: React.FC = () => {
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoPostStatus, setAutoPostStatus] = useState<string>('');
  
  const autoPostIntervalRef = useRef<number | null>(null);
  const articleKeywordsRef = useRef<string>('');

  const stopAutoPosting = useCallback(() => {
    if (autoPostIntervalRef.current) {
      clearInterval(autoPostIntervalRef.current);
      autoPostIntervalRef.current = null;
    }
    setAutoPostStatus('');
  }, []);

  const fetchAndAddNewArticles = useCallback(async () => {
    if (!articleKeywordsRef.current) return;
    
    setAutoPostStatus('新しい記事3件を生成中...');
    setError(null);
    
    try {
      const existingTitles = siteData?.pages.find(p => p.path === '/blog')?.articles.map(a => a.title) || [];
      const newArticles = await generateNewArticles(articleKeywordsRef.current, existingTitles);
      
      setSiteData(prevData => {
        if (!prevData) return null;
        
        const newPages = prevData.pages.map(page => {
          if (page.path === '/blog') {
            const updatedArticles = [...newArticles, ...page.articles];
            return { ...page, articles: updatedArticles };
          }
          return page;
        });
        
        return { ...prevData, pages: newPages };
      });
      setAutoPostStatus(`記事が3件追加されました。次回の自動投稿は8時間後です。`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラー';
      setError(`記事の自動生成に失敗しました: ${errorMessage}`);
      setAutoPostStatus('自動投稿がエラーにより停止しました。');
      stopAutoPosting();
    }
  }, [siteData, stopAutoPosting]);

  const startAutoPosting = useCallback(() => {
    // 最初の記事をすぐに生成
    fetchAndAddNewArticles();

    // 8時間ごとに記事を生成するタイマーを設定
    autoPostIntervalRef.current = window.setInterval(() => {
      fetchAndAddNewArticles();
    }, EIGHT_HOURS_IN_MS);
  }, [fetchAndAddNewArticles]);

  const handleGenerate = useCallback(async (siteName: string, siteKeywords: string, articleKeywords: string) => {
    setIsLoading(true);
    setError(null);
    setSiteData(null);
    stopAutoPosting();

    try {
      const data = await generateSeoSite(siteName, siteKeywords);
      setSiteData(data);
      articleKeywordsRef.current = articleKeywords;
      startAutoPosting();
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [stopAutoPosting, startAutoPosting]);
  
  useEffect(() => {
    // コンポーネントのアンマウント時にタイマーをクリーンアップ
    return () => stopAutoPosting();
  }, [stopAutoPosting]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="space-y-6">
              <SeoForm onGenerate={handleGenerate} isLoading={isLoading} />
              {autoPostStatus && (
                <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-green-500">
                  <h3 className="font-semibold text-slate-800">自動投稿ステータス</h3>
                  <p className="text-sm text-slate-600 mt-1">{autoPostStatus}</p>
                </div>
              )}
              {siteData && (
                <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-blue-500">
                  <h3 className="font-semibold text-slate-800 mb-3">サイトのエクスポート</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    生成されたサイトをHTMLファイルとしてダウンロードし、
                    お好みのサーバーにアップロードできます。
                  </p>
                  <ExportButton siteData={siteData} />
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-lg h-[75vh] min-h-[600px] flex flex-col">
              {isLoading && !siteData && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <h2 className="mt-6 text-xl font-semibold text-slate-700">ウェブサイトを生成中...</h2>
                  <p className="mt-2 text-slate-500">AIがサイトの基本構造を作成しています。少々お待ちください。</p>
                </div>
              )}
              {error && (
                <div className="flex items-center justify-center h-full text-center p-8">
                   <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                    <p className="text-red-700 font-semibold">生成に失敗しました</p>
                    <p className="text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              )}
              {!isLoading && !error && siteData && (
                <SitePreview siteData={siteData} />
              )}
               {!isLoading && !error && !siteData && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251.023.501.05.75.082a.75.75 0 01.75.75v5.714a2.25 2.25 0 00.659 1.591L14.25 14.5M9.75 3.104a6.375 6.375 0 00-6.375 6.375c0 1.54.497 3.018 1.357 4.236l3.265-3.265M21 12a8.956 8.956 0 01-2.086 5.897l-3.265-3.265m0 0a2.25 2.25 0 00-3.182 0l-1.99 1.99a2.25 2.25 0 000 3.182l3.182 3.182a2.25 2.25 0 003.182 0l1.99-1.99a2.25 2.25 0 000-3.182z" />
                  </svg>
                  <h2 className="mt-6 text-2xl font-bold text-slate-700">ウェブサイトプレビュー</h2>
                  <p className="mt-2 text-slate-500">生成されたウェブサイトはここに表示されます。<br/>フォームを入力して、AIの力を体験しましょう！</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;