export const heroCards = Array.from({ length: 8 }, (_, index) => ({
  src: `/media/asset-${String(index + 1).padStart(3, '0')}.webp`,
}));

export type PortfolioTag = 'framer' | 'figma' | 'site' | 'application' | 'consulting' | 'institutional' | 'system' | 'ai' | 'onePage' | 'blog' | 'branding' | 'landing' | 'saas' | 'claude';

type PortfolioProject = { title: string; image?: string; video?: string; tags: readonly PortfolioTag[] };

export const portfolioProjects: readonly PortfolioProject[] = [
  { title: 'Camila Farani', image: '/media/asset-009.jpg', video: '/media/asset-010.mp4', tags: ['framer', 'figma', 'site'] },
  { title: 'KFC Brasil', image: '/media/asset-011.webp', video: '/media/asset-012.mp4', tags: ['site', 'application'] },
  { title: 'Tera', image: '/media/asset-013.png', tags: ['framer', 'site', 'landing', 'consulting'] },
  { title: 'Vibra', image: '/media/asset-014.jpg', tags: ['figma', 'site', 'institutional'] },
  { title: 'Wiz Benefits', image: '/media/asset-015.jpg', video: '/media/asset-016.mp4', tags: ['saas', 'figma', 'system'] },
  { title: 'Pepper', image: '/media/asset-017.webp', video: '/media/asset-018.mp4', tags: ['saas', 'framer', 'figma', 'application', 'system'] },
  { title: 'Elogiou', image: '/media/asset-019.webp', tags: ['saas', 'framer', 'figma', 'branding'] },
  { title: 'Gogame', image: '/media/asset-020.jpg', tags: ['saas', 'figma', 'application'] },
  { title: 'Milhas Pix', image: '/media/asset-021.jpg', video: '/media/asset-022.webm', tags: ['saas', 'figma', 'site', 'landing', 'system'] },
  { title: 'Visor', image: '/media/asset-023.jpg', tags: ['saas', 'framer', 'figma', 'blog', 'application', 'system'] },
  { title: 'Medellin Games', image: '/media/asset-024.webp', tags: ['figma', 'site', 'institutional'] },
  { title: 'Youmentor', image: '/media/asset-025.webp', video: '/media/asset-026.mp4', tags: ['saas', 'figma', 'application', 'system'] },
  { title: 'Kpass', image: '/media/asset-027.jpg', tags: ['figma', 'application'] },
  { title: 'Cappta', image: '/media/asset-028.png', tags: ['figma', 'ai', 'application'] },
  { title: 'Haudience', video: '/media/asset-029.mp4', tags: ['saas', 'figma', 'site', 'system'] },
  { title: 'Spedy', image: '/media/asset-030.jpg', tags: ['saas', 'framer', 'figma', 'site', 'branding'] },
  { title: 'Vitat', image: '/media/asset-031.png', tags: ['figma', 'landing', 'blog', 'onePage'] },
  { title: 'Treeunfe', image: '/media/asset-032.jpg', video: '/media/asset-033.mp4', tags: ['saas', 'framer', 'figma', 'claude', 'blog'] },
  { title: 'Biz', image: '/media/asset-034.jpg', tags: ['framer', 'ai', 'site', 'blog', 'institutional'] },
  { title: 'Stric', image: '/media/asset-035.jpg', video: '/media/asset-036.mp4', tags: ['saas', 'framer', 'ai', 'site', 'branding'] },
] as const;

export const featuredProjects = [
  { name: 'PPF Đồng Nai', image: '/media/ximi-ppf-dong-nai.webp', href: 'https://ppfdongnai.com/' },
  { name: 'HQN Group', image: '/media/ximi-hqn-group.webp', href: 'https://hqngroup.vn/' },
  { name: 'EngMind Study', image: '/media/ximi-engmind-study.webp', href: 'https://engmindstudy.vn/' },
  { name: 'LumineCloud', image: '/media/ximi-lumine-cloud.webp', href: 'https://luminecloud.com/' },
] as const;

