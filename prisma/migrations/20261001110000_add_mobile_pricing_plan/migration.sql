-- Support scope-based pricing and localized card copy, then seed the five published plans.
ALTER TABLE "PricingPlan"
  ALTER COLUMN "priceFrom" DROP NOT NULL,
  ADD COLUMN "bestForVi" TEXT,
  ADD COLUMN "bestForEn" TEXT,
  ADD COLUMN "ctaVi" TEXT,
  ADD COLUMN "ctaEn" TEXT;

INSERT INTO "PricingPlan" (
  "id", "key", "nameVi", "nameEn", "labelVi", "labelEn",
  "priceFrom", "originalPrice", "currency", "durationVi", "durationEn",
  "descriptionVi", "descriptionEn", "bestForVi", "bestForEn",
  "featuresVi", "featuresEn", "ctaVi", "ctaEn",
  "recommended", "sortOrder", "published", "createdAt", "updatedAt"
)
VALUES
(
  'pricing-landing-page', 'landing-page', 'Landing Page', 'Landing Page', 'Khởi động nhanh', 'Fast start',
  1888000, 3000000, 'VND', '3–5 ngày', '3–5 days',
  'Landing page tập trung vào một chiến dịch, dịch vụ hoặc luồng thu lead.',
  'A focused landing page for a campaign, service launch or lead flow.',
  'Chiến dịch, giới thiệu dịch vụ, form tư vấn',
  'Campaigns, service launches and lead forms',
  ARRAY['1 giao diện responsive', 'SEO nền tảng', 'Form liên hệ', 'GA4 + Pixel cơ bản', 'Bảo hành 5 năm', 'Tặng hosting 1 năm']::TEXT[],
  ARRAY['1 responsive interface', 'Technical SEO foundation', 'Contact form', 'Basic GA4 + Pixel', '5-year warranty', '1 year hosting included']::TEXT[],
  'Nhận báo giá Landing', 'Get a Landing Page quote', false, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'pricing-business-website', 'business-website', 'Website doanh nghiệp', 'Business Website', 'Đề xuất', 'Recommended',
  5000000, 8000000, 'VND', '7–14 ngày', '7–14 days',
  'Website doanh nghiệp theo nhận diện thương hiệu, có CMS và nền tảng SEO bền vững.',
  'A brand-led business website with CMS and a durable SEO foundation.',
  'Công ty, portfolio, dịch vụ cần SEO bền vững',
  'Companies, portfolios and services that need durable SEO',
  ARRAY['UI/UX theo thương hiệu', 'SEO on-page nâng cao', 'CMS dễ cập nhật', 'GA4', 'Search Console', 'Sitemap', 'Bảo hành 5 năm']::TEXT[],
  ARRAY['Brand-led UI/UX', 'Advanced on-page SEO', 'Easy-to-update CMS', 'GA4', 'Search Console', 'Sitemap', '5-year warranty']::TEXT[],
  'Tư vấn gói doanh nghiệp', 'Discuss the business plan', true, 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'pricing-ecommerce', 'ecommerce', 'Website bán hàng', 'E-commerce Website', 'Tăng trưởng', 'Growth',
  10000000, 15000000, 'VND', '3–4 tuần', '3–4 weeks',
  'Website bán hàng với quản lý sản phẩm, đơn hàng và luồng chuyển đổi.',
  'An ecommerce website with product, order and conversion management.',
  'Cửa hàng, danh mục sản phẩm và bán hàng trực tuyến',
  'Shops, product catalogs and online sales',
  ARRAY['Giao diện bán hàng riêng', 'Product schema', 'Quản lý sản phẩm', 'Quản lý đơn hàng', 'Giỏ hàng', 'Theo dõi chuyển đổi', 'Bảo hành 5 năm']::TEXT[],
  ARRAY['Custom commerce interface', 'Product schema', 'Product management', 'Order management', 'Cart', 'Conversion tracking', '5-year warranty']::TEXT[],
  'Tư vấn Website bán hàng', 'Discuss Ecommerce', false, 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'pricing-web-app', 'web-app', 'Web App theo yêu cầu', 'Custom Web App', 'Theo yêu cầu', 'Tailored',
  10000000, NULL, 'VND', 'Theo phạm vi', 'Scope based',
  'Web App được thiết kế theo quy trình, dữ liệu và nghiệp vụ riêng của dự án.',
  'A Web App designed around the project workflow, data and business rules.',
  'Dashboard, CRM gọn, booking và quy trình nội bộ',
  'Dashboards, lightweight CRM, booking and internal workflows',
  ARRAY['Prototype trước khi code', 'Backend / API riêng', 'Dashboard', 'Phân quyền', 'Quy trình theo yêu cầu', 'Báo cáo', 'Bảo hành 5 năm']::TEXT[],
  ARRAY['Prototype before development', 'Custom backend / API', 'Dashboard', 'Roles and permissions', 'Custom workflow', 'Reports', '5-year warranty']::TEXT[],
  'Tư vấn Web App', 'Discuss a Web App', false, 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'pricing-mobile-app', 'mobile-app', 'MOBILE APP', 'MOBILE APP', 'ỨNG DỤNG DI ĐỘNG', 'MOBILE DEVELOPMENT',
  NULL, NULL, 'VND', '4–8 tuần', '4–8 weeks',
  'Thiết kế và phát triển ứng dụng di động theo phạm vi sản phẩm.',
  'Mobile application design and development based on product scope.',
  'Ứng dụng iOS/Android, booking, bán hàng, thành viên, quản lý, loyalty hoặc sản phẩm MVP.',
  'iOS/Android apps, booking, ecommerce, membership, management, loyalty and MVP products.',
  ARRAY['Thiết kế UI/UX app', 'Flutter / React Native tùy dự án', 'iOS & Android', 'Backend / API', 'Push Notification', 'Đăng nhập / phân quyền', 'Tích hợp thanh toán nếu cần', 'Dashboard quản trị', 'Bảo hành theo phạm vi dự án']::TEXT[],
  ARRAY['Mobile UI/UX Design', 'Flutter / React Native when appropriate', 'iOS & Android', 'Backend / API', 'Push Notifications', 'Authentication / Roles', 'Payment integration when needed', 'Admin Dashboard', 'Project-based warranty']::TEXT[],
  'Tư vấn Mobile App', 'Discuss Mobile App', false, 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO UPDATE SET
  "nameVi" = EXCLUDED."nameVi",
  "nameEn" = EXCLUDED."nameEn",
  "labelVi" = EXCLUDED."labelVi",
  "labelEn" = EXCLUDED."labelEn",
  "priceFrom" = EXCLUDED."priceFrom",
  "originalPrice" = EXCLUDED."originalPrice",
  "currency" = EXCLUDED."currency",
  "durationVi" = EXCLUDED."durationVi",
  "durationEn" = EXCLUDED."durationEn",
  "descriptionVi" = EXCLUDED."descriptionVi",
  "descriptionEn" = EXCLUDED."descriptionEn",
  "bestForVi" = EXCLUDED."bestForVi",
  "bestForEn" = EXCLUDED."bestForEn",
  "featuresVi" = EXCLUDED."featuresVi",
  "featuresEn" = EXCLUDED."featuresEn",
  "ctaVi" = EXCLUDED."ctaVi",
  "ctaEn" = EXCLUDED."ctaEn",
  "recommended" = EXCLUDED."recommended",
  "sortOrder" = EXCLUDED."sortOrder",
  "published" = true,
  "updatedAt" = CURRENT_TIMESTAMP;