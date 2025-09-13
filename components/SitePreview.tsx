import React, { useState, useMemo, useEffect } from 'react';
import type { SiteData } from '../types';

interface SitePreviewProps {
  siteData: SiteData;
}

const themeColorClasses = {
  blue: {
    bg: 'bg-blue-600',
    text: 'text-blue-600',
    hoverBg: 'hover:bg-blue-700',
  },
  green: {
    bg: 'bg-green-600',
    text: 'text-green-600',
    hoverBg: 'hover:bg-green-700',
  },
  purple: {
    bg: 'bg-purple-600',
    text: 'text-purple-600',
    hoverBg: 'hover:bg-purple-700',
  },
  red: {
    bg: 'bg-red-600',
    text: 'text-red-600',
    hoverBg: 'hover:bg-red-700',
  },
  indigo: {
    bg: 'bg-indigo-600',
    text: 'text-indigo-600',
    hoverBg: 'hover:bg-indigo-700',
  },
};

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, ''); // Remove all non-word chars
};


// A component to render markdown-like content with heading styles and IDs.
const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none text-slate-700">
      {content.split('\n').map((line, index) => {
        if (line.startsWith('## ')) {
          const text = line.substring(3);
          return <h2 key={index} id={slugify(text)} className="text-3xl font-bold mt-8 mb-4 border-b pb-2">{text}</h2>;
        }
        if (line.startsWith('### ')) {
          const text = line.substring(4);
          return <h3 key={index} id={slugify(text)} className="text-2xl font-bold mt-6 mb-3">{text}</h3>;
        }
        // H4 and subsequent tags are treated as regular text as per the default case
        if (line.startsWith('* ')) {
          return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
        }
        if (line.trim() === '') {
          return <div key={index} className="h-4"></div>;
        }
        return <p key={index} className="my-3 leading-relaxed">{line}</p>;
      })}
    </div>
  );
};

// New constant for navigation titles
const navTitles: { [key: string]: string } = {
  '/': 'Home',
  '/about': 'about us',
  '/blog': 'news',
};


export const SitePreview: React.FC<SitePreviewProps> = ({ siteData }) => {
  const [activePath, setActivePath] = useState('/');
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);

  useEffect(() => {
    // Reset view when siteData changes to ensure the preview updates correctly
    setActivePath('/');
    setSelectedArticleSlug(null);
  }, [siteData]);

  const activePage = useMemo(() => {
    return siteData.pages.find(p => p.path === activePath);
  }, [siteData.pages, activePath]);

  const blogPage = useMemo(() => {
    return siteData.pages.find(p => p.path === '/blog');
  }, [siteData.pages]);

  const selectedArticle = useMemo(() => {
    if (!selectedArticleSlug || !blogPage) return null;
    return blogPage.articles.find(a => a.slug === selectedArticleSlug);
  }, [blogPage, selectedArticleSlug]);

    // Generate headings for Table of Contents
  const headings = useMemo(() => {
    if (!selectedArticle) return [];
    const lines = selectedArticle.content.split('\n');
    return lines
      .filter(line => line.startsWith('## ') || line.startsWith('### '))
      .map(line => {
        const level = line.startsWith('## ') ? 2 : 3;
        const text = line.replace(/^#+\s/, '');
        const slug = slugify(text);
        return { level, text, slug };
      });
  }, [selectedArticle]);


  const handleNavClick = (path: string) => {
    setActivePath(path);
    setSelectedArticleSlug(null); // Reset article selection when changing page
  };

  const handleArticleClick = (slug: string) => {
    setSelectedArticleSlug(slug);
  };

  const handleBackToList = () => {
    setSelectedArticleSlug(null);
  }

  const theme = themeColorClasses[siteData.themeColor] || themeColorClasses.blue;

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 overflow-hidden rounded-2xl">
      {/* Header */}
      <header className={'flex-shrink-0 bg-white border-b shadow-sm'}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className={`text-2xl font-bold ${theme.text}`}>{siteData.siteName}</h1>
            <nav className="flex space-x-1 sm:space-x-4">
              {siteData.pages.map(page => (
                <button
                  key={page.path}
                  onClick={() => handleNavClick(page.path)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                    activePath === page.path
                      ? `${theme.bg} text-white`
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {navTitles[page.path] || page.title}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
        <div className="mx-auto">
          {selectedArticle ? (
            // Article View
            <div>
              <button onClick={handleBackToList} className={`mb-6 text-sm font-medium ${theme.text} hover:underline`}>
                &larr; ブログ一覧に戻る
              </button>
              <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{selectedArticle.title}</h1>
              <p className="text-slate-500 mb-6 italic">{selectedArticle.metaDescription}</p>
              
              {/* Table of Contents */}
              {headings.length > 0 && (
                <div className="mb-8 p-4 border rounded-lg bg-slate-100/70">
                  <h3 className="font-bold text-lg mb-3 pb-2 border-b">目次</h3>
                  <ul className="space-y-2">
                    {headings.map(({ level, text, slug }) => (
                      <li key={slug} className={level === 3 ? 'ml-4' : ''}>
                        <a href={`#${slug}`} className={`${theme.text} hover:underline text-sm`}>
                          {text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <hr className="my-4" />
              <MarkdownContent content={selectedArticle.content} />
            </div>
          ) : activePage ? (
            // Page View
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">{activePage.title}</h2>
              <MarkdownContent content={activePage.content} />

              {activePage.path === '/blog' && blogPage && blogPage.articles.length > 0 && (
                <div className="mt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {blogPage.articles.map(article => (
                       <div 
                         key={article.slug} 
                         className="bg-white p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border group" 
                         onClick={() => handleArticleClick(article.slug)}
                       >
                         <h4 className={`text-xl font-bold ${theme.text} mb-2`}>{article.title}</h4>
                         <p className="text-sm text-slate-600 mt-2 mb-4 h-10 overflow-hidden">{article.metaDescription}</p>
                         <span className={`text-sm font-semibold ${theme.text} group-hover:underline`}>
                           記事を読む &rarr;
                         </span>
                       </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
             <div className="text-center text-slate-500">
               <p>ページが見つかりません。</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};