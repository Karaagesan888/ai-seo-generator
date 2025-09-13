import React from 'react';
import { SiteIcon } from './icons/SiteIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <SiteIcon className="h-8 w-8 text-blue-600" />
            <span className="ml-3 text-2xl font-bold text-slate-800">
              AI SEOサイトジェネレーター
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};