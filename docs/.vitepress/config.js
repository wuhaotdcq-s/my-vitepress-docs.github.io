// 导入 VitePress 必要的配置工具、KaTeX 插件 + 路径/文件处理模块
import { defineConfig } from 'vitepress'
import { katex } from '@mdit/plugin-katex'
import { readdirSync, statSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// 修复 ESM 中 __filename 和 __dirname 的定义
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 递归处理目录结构的函数
function processDirectory(currentPath, baseUrl, level = 0) {
  const items = [];
  
  if (!existsSync(currentPath)) {
    return items;
  }
  
  const entries = readdirSync(currentPath);
  
  entries.forEach(entry => {
    const fullPath = join(currentPath, entry);
    
    try {
      const stats = statSync(fullPath);
      
      if (stats.isDirectory()) {
        // 处理目录（支持无限层级）
        const subItems = processDirectory(fullPath, `${baseUrl}${entry}/`, level + 1);
        
        if (subItems.length > 0) {
          items.push({
            text: entry,
            collapsed: level > 0, // 二级及以上目录默认折叠
            items: subItems
          });
        }
      } else if (stats.isFile() && entry.endsWith('.md') && entry !== 'index.md') {
        // 处理文件
        const fileName = entry.replace('.md', '');
        items.push({
          text: fileName,
          link: `${baseUrl}${fileName}`
        });
      }
    } catch (error) {
      console.warn(`无法处理路径 ${fullPath}:`, error.message);
    }
  });
  
  return items;
}

// 生成侧边栏的主函数（支持三级目录）
function generateSidebar() {
  const sidebar = {};
  const rootDirs = ['学习', '工作', '兴趣'];
  
  rootDirs.forEach(dir => {
    const dirPath = join(__dirname, '..', dir);
    
    if (!existsSync(dirPath)) {
      console.warn(`⚠️ 目录 "${dir}" 不存在`);
      return;
    }
    
    try {
      let sidebarItems = [];
      
      // 添加目录首页
      if (existsSync(join(dirPath, 'index.md'))) {
        sidebarItems.push({
          text: `${dir}首页`,
          link: `/${dir}/`
        });
      }
      
      // 递归处理目录结构
      const directoryItems = processDirectory(dirPath, `/${dir}/`);
      sidebarItems = sidebarItems.concat(directoryItems);
      
      // 设置侧边栏配置
      sidebar[`/${dir}/`] = [
        {
          text: dir,
          collapsed: false,
          items: sidebarItems
        }
      ];
      
      console.log(`✅ ${dir} 侧边栏生成完成，共 ${sidebarItems.length} 个项目`);
      
    } catch (error) {
      console.error(`❌ 处理目录 "${dir}" 时出错:`, error.message);
    }
  });
  
  return sidebar;
}

// 导出 VitePress 核心配置
export default defineConfig({
  title: '我的文档',
  description: '基于 VitePress 构建的文档站点，支持多级目录',
  base: '/',

  markdown: {
    config: (md) => {
      md.use(katex, {
        throwOnError: false,
        errorColor: '#cc0000'
      });
    }
  },

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: '学习', link: '/学习/' },
      { text: '工作', link: '/工作/' },
      { text: '兴趣', link: '/兴趣/' }
    ],

    sidebar: generateSidebar(),

    // 添加上一篇/下一篇按钮中文化配置
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],
    
    // 页脚
    footer: {
      message: '文档使用 VitePress 构建',
      copyright: '© 2025 我的文档 | 保留所有权利'
    },
    
    // 搜索配置（中文化）
    search: {
      provider: 'local',
      options: {
        detailedView: true,
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },
    
    // 大纲配置（中文化）
    outline: {
      level: [2, 3],
      label: '本页目录'
    },

    // 其他界面元素中文化
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题切换',
    lightModeSwitchTitle: '切换到亮色模式',
    darkModeSwitchTitle: '切换到暗色模式',
    
    // 最后更新时间（中文化）
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    },
    
    // 编辑链接（中文化）
    editLink: {
      pattern: 'https://github.com/wuhaotdcq-s/your-repo/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    
    // 404页面中文化
    notFound: {
      title: '页面未找到',
      quote: '可能是链接失效或页面已被移动。',
      linkLabel: '返回首页',
      linkText: '返回首页'
    }
  },

  // 外观配置
  appearance: 'dark',
  
  // 最后更新时间
  lastUpdated: true,

  // 头部配置
  head: [
    ['link', { rel: 'stylesheet', href: '/custom.css' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }]
  ],

  // 构建配置
  vite: {
    server: {
      port: 3000,
      host: true
    },
    build: {
      minify: 'terser',
      chunkSizeWarningLimit: 1000
    }
  }
});