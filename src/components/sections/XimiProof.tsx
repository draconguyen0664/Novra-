import Image from 'next/image';
import { ximiProjects } from '@/data/ximitech';

const metrics = [
  ['150+', 'Dự án đã triển khai'],
  ['5 năm', 'Bảo hành kỹ thuật'],
  ['20+', 'Mẫu giao diện theo ngành'],
] as const;

export function XimiProof() {
  return (
    <section className="ximi-proof" id="proof" data-dark>
      <div className="shell">
        <header className="ximi-proof-heading">
          <p className="ximi-kicker">DỰ ÁN THẬT / CÂU CHUYỆN THẬT</p>
          <h2>
            <span><span>WEBSITE ĐƯỢC</span></span>
            <span><span>XÂY ĐỂ VẬN HÀNH</span></span>
          </h2>
          <p>Theo dõi hành trình từ tư vấn, thiết kế đến bàn giao qua những sản phẩm đang hoạt động thực tế.</p>
        </header>

        <div className="ximi-proof-reel">
          {ximiProjects.map((project, index) => (
            <a className="ximi-proof-card" href={project.href} target="_blank" rel="noreferrer" key={project.name}>
              <figure><Image src={project.image} alt={`Giao diện ${project.name}`} fill sizes="(max-width:809px) 78vw, 32vw" /></figure>
              <div><span>{String(index + 1).padStart(2, '0')}</span><h3>{project.name}</h3><i aria-hidden="true">↗</i></div>
            </a>
          ))}
        </div>

        <div className="ximi-proof-metrics">
          {metrics.map(([value, label]) => <p key={label}><strong>{value}</strong><span>{label}</span></p>)}
        </div>
      </div>
    </section>
  );
}
