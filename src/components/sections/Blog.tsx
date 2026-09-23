import Image from 'next/image';
import content from '@/data/content.json';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Blog() {
  return (
    <section className="blog-section" id="blog">
      <div className="shell">
        <div className="blog-heading">
          <SectionHeading label="BLOG"><span className="desktop-blog-title">Artigos &amp; notícias</span><span className="mobile-blog-title">Blog Novra</span></SectionHeading>
          <a className="outline-button" href="https://novra.vn/blog">Ver artigos</a>
        </div>
        <div className="blog-grid">
          {content.blogs.slice(0, 4).map((post) => (
            <article className="blog-card" key={post.href}>
              <a href={post.href}>
                <figure><Image src={post.image.src} alt={post.image.alt} fill sizes="(max-width:809px) 45vw, 25vw" /></figure>
                <div className="blog-copy">
                  <time>{post.date}</time>
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                </div>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
