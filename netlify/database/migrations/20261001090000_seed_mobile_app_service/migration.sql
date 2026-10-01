-- Add Mobile App Development to the Novra CMS service catalog.
INSERT INTO "Service" (
  "id", "slugVi", "slugEn", "nameVi", "nameEn",
  "descriptionVi", "descriptionEn", "contentVi", "contentEn",
  "featured", "sortOrder", "published", "createdAt", "updatedAt"
)
VALUES (
  'service-mobile-app-development',
  'phat-trien-ung-dung-di-dong',
  'mobile-app-development',
  'Phát triển ứng dụng di động',
  'Mobile App Development',
  'Thiết kế và phát triển ứng dụng iOS/Android, từ MVP đến sản phẩm hoàn chỉnh, có thể kết hợp dashboard quản trị và backend API.',
  'Design and development of iOS and Android applications, from MVPs to production products, including admin dashboards and backend APIs when needed.',
  'Tư vấn kiến trúc phù hợp cho Flutter, React Native hoặc native sau khi làm rõ người dùng, tính năng và yêu cầu vận hành.',
  'Architecture guidance for Flutter, React Native or native development after clarifying users, features and operational requirements.',
  true,
  3,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slugEn") DO UPDATE SET
  "nameVi" = EXCLUDED."nameVi",
  "nameEn" = EXCLUDED."nameEn",
  "descriptionVi" = EXCLUDED."descriptionVi",
  "descriptionEn" = EXCLUDED."descriptionEn",
  "contentVi" = EXCLUDED."contentVi",
  "contentEn" = EXCLUDED."contentEn",
  "featured" = EXCLUDED."featured",
  "published" = EXCLUDED."published",
  "updatedAt" = CURRENT_TIMESTAMP;