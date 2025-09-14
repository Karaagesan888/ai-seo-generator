import type { SiteData, Article, Page } from '../types';

// HTML テンプレート生成
const generateHTMLPage = (
  title: string,
  content: string,
  siteData: SiteData,
  isArticle = false,
  article?: Article
): string => {
  const themeColors = {
    blue: '#2563eb',
    green: '#16a34a',
    purple: '#9333ea',
    red: '#dc2626',
    indigo: '#4f46e5'
  };

  const primaryColor = themeColors[siteData.themeColor] || themeColors.blue;

  // MarkdownコンテンツをシンプルなHTMLに変換
  const convertMarkdownToHTML = (markdown: string): string => {
    return markdown
      .replace(/^## (.+)$/gm, '<h2 id="$1" style="font-size: 1.875rem; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e5e7eb;">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 id="$1" style="font-size: 1.5rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem;">$1</h3>')
      .replace(/^\* (.+)$/gm, '<li style="margin-left: 1.25rem; list-style-type: disc;">$1</li>')
      .replace(/^([^<\n].+)$/gm, '<p style="margin: 0.75rem 0; line-height: 1.625;">$1</p>')
      .replace(/(<li[^>]*>.*<\/li>)/gs, '<ul style="margin: 1rem 0; padding-left: 1.5rem;">$1</ul>');
  };

  const navigation = `
    <nav style="display: flex; gap: 1rem;">
      <a href="index.html" style="padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; font-weight: 500; transition: background-color 0.15s; color: #4b5563; background-color: #f3f4f6;">Home</a>
      <a href="about.html" style="padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; font-weight: 500; transition: background-color 0.15s; color: #4b5563; background-color: #f3f4f6;">About Us</a>
      <a href="blog.html" style="padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; font-weight: 500; transition: background-color 0.15s; color: #4b5563; background-color: #f3f4f6;">News</a>
    </nav>
  `;

  // 目次生成（記事ページの場合）
  let tableOfContents = '';
  if (isArticle && article) {
    const headings = article.content.match(/^##+ .+$/gm) || [];
    if (headings.length > 0) {
      const tocItems = headings.map(heading => {
        const level = heading.match(/^(#+)/)?.[1].length || 2;
        const text = heading.replace(/^#+\s/, '');
        const id = text.replace(/\s+/g, '-').toLowerCase();
        const marginLeft = (level - 2) * 1;
        return `<li style="margin-left: ${marginLeft}rem;"><a href="#${id}" style="color: ${primaryColor}; text-decoration: none; font-size: 0.875rem;">${text}</a></li>`;
      }).join('');

      tableOfContents = `
        <div style="margin-bottom: 2rem; padding: 1rem; background-color: #f8fafc; border-radius: 0.5rem; border: 1px solid #e2e8f0;">
          <h3 style="font-weight: bold; font-size: 1.125rem; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid #cbd5e1;">目次</h3>
          <ul style="margin: 0; padding: 0; list-style: none;">
            ${tocItems}
          </ul>
        </div>
      `;
    }
  }

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${siteData.siteName}</title>
    <meta name="description" content="${isArticle && article ? article.metaDescription : `${siteData.siteName} - ${title}`}">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f9fafb;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
        }
        header {
            background-color: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
        }
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: ${primaryColor};
            text-decoration: none;
        }
        nav a:hover {
            background-color: #e5e7eb !important;
        }
        main {
            padding: 2rem 0;
            min-height: calc(100vh - 200px);
        }
        .content {
            background-color: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            max-width: 800px;
            margin: 0 auto;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 1.5rem;
            color: ${primaryColor};
            text-decoration: none;
            font-size: 0.875rem;
        }
        .back-link:hover {
            text-decoration: underline;
        }
        .article-meta {
            color: #6b7280;
            font-style: italic;
            margin-bottom: 1.5rem;
        }
        footer {
            background-color: #374151;
            color: white;
            text-align: center;
            padding: 2rem 0;
            margin-top: 3rem;
        }
        @media (max-width: 768px) {
            .container {
                padding: 0 0.5rem;
            }
            .content {
                padding: 1rem;
                margin: 0;
                border-radius: 0;
            }
            nav {
                flex-direction: column;
                gap: 0.5rem;
            }
            .header-content {
                flex-direction: column;
                gap: 1rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <a href="index.html" class="logo">${siteData.siteName}</a>
                ${navigation}
            </div>
        </div>
    </header>

    <main>
        <div class="container">
            <div class="content">
                ${isArticle ? `<a href="blog.html" class="back-link">← ブログ一覧に戻る</a>` : ''}
                <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem; color: #111827;">${title}</h1>
                ${isArticle && article ? `<div class="article-meta">${article.metaDescription}</div>` : ''}
                ${tableOfContents}
                ${isArticle ? '<hr style="margin: 1rem 0;">' : ''}
                <div class="content-body">
                    ${convertMarkdownToHTML(content)}
                </div>
            </div>
        </div>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2025 ${siteData.siteName}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;
};

// ブログ一覧ページ生成
const generateBlogListHTML = (siteData: SiteData, blogPage: Page): string => {
  const themeColors = {
    blue: '#2563eb',
    green: '#16a34a', 
    purple: '#9333ea',
    red: '#dc2626',
    indigo: '#4f46e5'
  };

  const primaryColor = themeColors[siteData.themeColor] || themeColors.blue;

  const articlesHTML = blogPage.articles.map(article => `
    <div style="background-color: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; transition: box-shadow 0.15s, transform 0.15s; cursor: pointer;" 
         onclick="location.href='articles/${article.slug}.html'"
         onmouseover="this.style.boxShadow='0 10px 15px rgba(0, 0, 0, 0.1)'; this.style.transform='translateY(-2px)'"
         onmouseout="this.style.boxShadow='0 4px 6px rgba(0, 0, 0, 0.05)'; this.style.transform='translateY(0)'">
      <h3 style="font-size: 1.25rem; font-weight: bold; color: ${primaryColor}; margin-bottom: 0.5rem;">${article.title}</h3>
      <p style="font-size: 0.875rem; color: #6b7280; margin: 0.5rem 0 1rem 0; height: 2.5rem; overflow: hidden;">${article.metaDescription}</p>
      <span style="font-size: 0.875rem; font-weight: 600; color: ${primaryColor};">記事を読む →</span>
    </div>
  `).join('');

  // ベースのHTMLページを生成してから記事カードを注入
  const baseHTML = generateHTMLPage(blogPage.title, blogPage.content, siteData);
  
  return baseHTML.replace(
    '<div class="content-body">',
    `<div class="content-body">
     <div style="margin-top: 2rem;">
       <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
         ${articlesHTML}
       </div>
     </div>
     <div style="display: none;">`
  ).replace('</div>\n            </div>\n        </div>\n    </main>', '</div>\n</div>\n            </div>\n        </div>\n    </main>');
};

// JSZipをインポート（ブラウザ環境での使用を想定）
declare const JSZip: any;

export const generateStaticSite = async (siteData: SiteData): Promise<void> => {
  try {
    // JSZipの動的インポート
    const JSZip = (await import('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js' as any)).default;
    
    const zip = new JSZip();

    // 各ページのHTML生成
    siteData.pages.forEach(page => {
      if (page.path === '/blog') {
        // ブログ一覧ページ
        const blogHTML = generateBlogListHTML(siteData, page);
        zip.file('blog.html', blogHTML);

        // 記事ページ
        const articlesFolder = zip.folder('articles');
        page.articles.forEach(article => {
          const articleHTML = generateHTMLPage(article.title, article.content, siteData, true, article);
          articlesFolder?.file(`${article.slug}.html`, articleHTML);
        });
      } else {
        // 通常のページ
        const fileName = page.path === '/' ? 'index.html' : `${page.path.substring(1)}.html`;
        const pageHTML = generateHTMLPage(page.title, page.content, siteData);
        zip.file(fileName, pageHTML);
      }
    });

    // sitemap.xml生成
    const sitemap = generateSitemap(siteData);
    zip.file('sitemap.xml', sitemap);

    // robots.txt生成  
    const robots = `User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml`;
    zip.file('robots.txt', robots);

    // ZIPファイルを生成してダウンロード
    const content = await zip.generateAsync({ type: 'blob' });
    
    // ダウンロードリンクを作成
    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${siteData.siteName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-website.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log('サイトのエクスポートが完了しました');
    
  } catch (error) {
    console.error('エクスポートエラー:', error);
    throw new Error('サイトのエクスポートに失敗しました');
  }
};

// sitemap.xml生成
const generateSitemap = (siteData: SiteData): string => {
  const baseUrl = 'https://yourdomain.com'; // 後でカスタマイズ可能にする
  
  let urls = siteData.pages.map(page => {
    const loc = page.path === '/' ? baseUrl : `${baseUrl}${page.path}.html`;
    return `  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  // 記事のURL追加
  const blogPage = siteData.pages.find(p => p.path === '/blog');
  if (blogPage) {
    blogPage.articles.forEach(article => {
      urls.push(`  <url>
    <loc>${baseUrl}/articles/${article.slug}.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
    });
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
};