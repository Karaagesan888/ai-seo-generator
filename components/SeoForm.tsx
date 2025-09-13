import React, { useState } from 'react';
import { MagicWandIcon } from './icons/MagicWandIcon';

interface SeoFormProps {
  onGenerate: (siteName: string, siteKeywords: string, articleKeywords: string) => void;
  isLoading: boolean;
}

export const SeoForm: React.FC<SeoFormProps> = ({ onGenerate, isLoading }) => {
  const [siteName, setSiteName] = useState('');
  const [siteKeywords, setSiteKeywords] = useState('');
  const [articleKeywords, setArticleKeywords] = useState('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (siteName.trim() && siteKeywords.trim() && articleKeywords.trim()) {
      onGenerate(siteName, siteKeywords, articleKeywords);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold text-slate-800 mb-1">ウェブサイトを作成</h2>
      <p className="text-slate-500 mb-6">詳細を入力すれば、あとはAIにお任せください。</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="siteName" className="block text-sm font-medium text-slate-700 mb-1">
            サイト名
          </label>
          <input
            type="text"
            id="siteName"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="例：「エコフレンドリーな暮らし」"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>
        <div>
          <label htmlFor="siteKeywords" className="block text-sm font-medium text-slate-700 mb-1">
            サイト全体のキーワード (カンマ区切り)
          </label>
          <textarea
            id="siteKeywords"
            value={siteKeywords}
            onChange={(e) => setSiteKeywords(e.target.value)}
            placeholder="例：サステナブル, 環境保護, ライフスタイル"
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>
         <div>
          <label htmlFor="articleKeywords" className="block text-sm font-medium text-slate-700 mb-1">
            記事生成用のキーワード (カンマ区切り)
          </label>
          <textarea
            id="articleKeywords"
            value={articleKeywords}
            onChange={(e) => setArticleKeywords(e.target.value)}
            placeholder="例：ゼロウェイストの始め方, 再利用可能な製品, 環境に優しい掃除"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !siteName || !siteKeywords || !articleKeywords}
          className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              生成中...
            </>
          ) : (
            <>
              <MagicWandIcon className="w-5 h-5 mr-2" />
              ウェブサイト生成 & 自動投稿開始
            </>
          )}
        </button>
      </form>
    </div>
  );
};