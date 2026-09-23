import { StructuredData } from '@/components/seo/StructuredData';

export default function Template({ children }: { children: React.ReactNode }) {
  // The measured lower-page CSS is served as a static cacheable asset.
  // eslint-disable-next-line @next/next/no-css-tags
  return <><link rel="stylesheet" href="/lower-sections.css" /><link rel="stylesheet" href="/ximitech-sections.css" /><StructuredData />{children}</>;
}