import Image from 'next/image';
import { AiPrompt, CapabilitiesAccordion, XimiFaqAccordion } from './XimiInteractive';
import { XimiMotion } from './XimiMotion';
import { ximiBenefits, ximiPlans, ximiProcess, ximiProjects, ximiServices } from '@/data/ximitech';

function EditorialHeading({ label, lines, copy }: { label: string; lines: string[]; copy?: string }) {
  return (
    <header className="ximi-heading">
      <p className="ximi-kicker">{label}</p>
      <h2>{lines.map((line) => <span className="ximi-heading-line" key={line}><span>{line}</span></span>)}</h2>
      {copy && <p className="ximi-heading-copy">{copy}</p>}
    </header>
  );
}

export function XimiSections() {
  return (
    <>
      <section className="ximi-section ximi-ai" id="ai-consultation">
        <div className="shell">
          <EditorialHeading
            label="01 — AI CONSULTATION"
            lines={['MÔ TẢ WEBSITE', 'BẠN CẦN']}
            copy="Trao đổi về chi phí, tính năng, SEO hoặc ý tưởng — Novra AI tư vấn ngay."
          />
          <AiPrompt />
        </div>
      </section>

      <section className="ximi-section ximi-services" id="services">
        <div className="shell">
          <EditorialHeading
            label="02 — DỊCH VỤ"
            lines={['WEBSITE &', 'WEB APP', 'CHUYÊN NGHIỆP']}
            copy="Làm website đầy đủ tính năng, cá nhân hóa theo mô hình kinh doanh và tối ưu để khách hàng dễ tin tưởng hơn."
          />
          <div className="ximi-service-list">
            {ximiServices.map((service) => (
              <article className="ximi-service-row" key={service.number}>
                <span>{service.number}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <i aria-hidden="true">↗</i>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ximi-section ximi-projects" id="selected-projects">
        <div className="shell">
          <EditorialHeading label="03 — SELECTED PROJECTS" lines={['150+ WEBSITE', 'ĐANG CHẠY THẬT']} />
          <div className="ximi-project-list">
            {ximiProjects.map((project, index) => (
              <article className={`ximi-project${index % 2 ? ' is-reverse' : ''}`} key={project.name}>
                <a className="ximi-project-media" href={project.href} target="_blank" rel="noreferrer">
                  <Image src={project.image} alt={`Giao diện website ${project.name}`} fill sizes="(max-width:809px) 90vw, 58vw" />
                </a>
                <div className="ximi-project-copy">
                  <p>{project.category}</p>
                  <h3><a href={project.href} target="_blank" rel="noreferrer">{project.name}<span aria-hidden="true">↗</span></a></h3>
                  <p>{project.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ximi-section ximi-benefits" id="why-ximitech" data-dark>
        <div className="shell">
          <div className="ximi-benefit-top">
            <EditorialHeading
              label="04 — LỢI ÍCH"
              lines={['LỢI ÍCH', 'KHI CHỌN', 'NOVRA']}
              copy="Novra làm website dễ dùng, dễ bán hàng, dễ quản lý với chi phí rõ ràng và hỗ trợ sau bàn giao."
            />
            <div className="ximi-screen-stack" aria-label="Các giao diện website Novra">
              {ximiProjects.slice(0, 3).map((project, index) => (
                <figure className="ximi-screen-layer" key={project.name} style={{ '--screen-index': index } as React.CSSProperties}>
                  <Image src={project.image} alt="" fill sizes="(max-width:809px) 80vw, 42vw" />
                </figure>
              ))}
            </div>
          </div>
          <div className="ximi-benefit-grid">
            {ximiBenefits.map(([title, description], index) => (
              <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{description}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="ximi-section ximi-pricing" id="pricing">
        <div className="shell">
          <EditorialHeading
            label="05 — CHI PHÍ MINH BẠCH"
            lines={['BẢNG GIÁ', 'DỊCH VỤ']}
            copy="So sánh rõ giá, thời gian, phạm vi và SEO trước khi bắt đầu dự án."
          />
          <div className="ximi-pricing-grid">
            {ximiPlans.map((plan, index) => (
              <article className={`ximi-price-panel${'recommended' in plan && plan.recommended ? ' is-recommended' : ''}`} key={plan.name}>
                <div className="ximi-plan-top"><span>{String(index + 1).padStart(2, '0')}</span><small>{plan.label}</small></div>
                <h3>{plan.name}</h3>
                <div className="ximi-plan-price">{'originalPrice' in plan && plan.originalPrice && <del>{plan.originalPrice}</del>}<strong>{plan.price}</strong><span>Khởi điểm</span></div>
                <dl><div><dt>Thời gian</dt><dd>{plan.time}</dd></div><div><dt>Phù hợp</dt><dd>{plan.bestFor}</dd></div></dl>
                <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
                <a href="https://zalo.me/0888889805" target="_blank" rel="noreferrer">{plan.cta}<span aria-hidden="true">↗</span></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ximi-section ximi-capabilities" id="kho-giao-dien">
        <div className="shell ximi-capability-layout">
          <EditorialHeading label="06 — KHẢ NĂNG" lines={['WEBSITE GIÚP BẠN', 'LÀM ĐƯỢC GÌ?']} />
          <CapabilitiesAccordion />
        </div>
      </section>

      <section className="ximi-section ximi-process" id="process" data-dark>
        <div className="shell">
          <EditorialHeading label="07 — QUY TRÌNH" lines={['QUY TRÌNH RÕ', 'ĐỂ KHÁCH DỄ KIỂM SOÁT']} />
          <div className="ximi-process-track">
            <div className="ximi-process-line" aria-hidden="true"><span /></div>
            {ximiProcess.map(([number, title, description]) => (
              <article className="ximi-process-step" key={number}>
                <span>{number}</span><h3>{title}</h3><p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ximi-section ximi-faq" id="faq">
        <div className="shell ximi-faq-layout">
          <EditorialHeading label="08 — FAQ" lines={['GIẢI ĐÁP NHANH', 'MỌI THẮC MẮC']} />
          <XimiFaqAccordion />
        </div>
      </section>

      <section className="ximi-section ximi-trust" id="about-ximitech">
        <div className="shell">
          <EditorialHeading
            label="09 — ABOUT / TRUST"
            lines={['VỀ NOVRA']}
            copy="Novra xây dựng website, web app và công cụ quản lý dễ dùng cho cá nhân, cửa hàng và doanh nghiệp."
          />
          <div className="ximi-trust-grid">
            <article><strong>150+</strong><span>Dự án đang vận hành</span></article>
            <article><strong>5 năm</strong><span>Bảo hành kỹ thuật</span></article>
            <div><p>Mỗi dự án bắt đầu bằng việc hiểu mục tiêu kinh doanh, chốt rõ phạm vi và bàn giao đầy đủ để khách hàng chủ động vận hành.</p><p>Chi phí, thời gian và trách nhiệm hỗ trợ được xác nhận rõ bằng văn bản trước khi triển khai.</p></div>
          </div>
        </div>
      </section>

      <section className="ximi-section ximi-final-cta" id="contato" data-dark>
        <div className="shell">
          <p className="ximi-kicker">10 — BẮT ĐẦU DỰ ÁN</p>
          <h2><span className="ximi-cta-line"><span>BẠN ĐANG CẦN</span></span><span className="ximi-cta-line"><span>MỘT WEBSITE?</span></span></h2>
          <p>Gửi yêu cầu hoặc mẫu tham khảo. Novra sẽ tư vấn giải pháp và phạm vi phù hợp.</p>
          <div className="ximi-cta-actions">
            <a className="ximi-primary-cta" href="https://zalo.me/0888889805" target="_blank" rel="noreferrer">Nhận tư vấn và báo giá <span aria-hidden="true">↗</span></a>
            <a className="ximi-phone" href="tel:+84888889805">088 888 9805</a>
          </div>
        </div>
      </section>
      <XimiMotion />
    </>
  );
}
