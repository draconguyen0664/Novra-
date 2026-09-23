export const ximiServices = [
  {
    number: '01',
    title: 'Website theo yêu cầu',
    description: 'Website doanh nghiệp, bán hàng, landing page hoặc giới thiệu dịch vụ với giao diện riêng, nội dung đúng ngành và tính năng theo nhu cầu.',
  },
  {
    number: '02',
    title: 'Web App theo yêu cầu',
    description: 'Xây web app quản lý, dashboard, đặt lịch, bán hàng hoặc cổng nội bộ với giao diện nhanh, dễ dùng và dễ mở rộng.',
  },
  {
    number: '03',
    title: 'SEO & tối ưu chuyển đổi',
    description: 'Tối ưu cấu trúc heading, tốc độ tải, schema, sitemap, nội dung bán hàng và form liên hệ.',
  },
] as const;

export const ximiProjects = [
  {
    name: 'PPF Đồng Nai',
    category: 'Website dịch vụ chăm sóc xe',
    description: 'Website trung tâm dán phim bảo vệ sơn, phim cách nhiệt và độ xe, có thư viện dự án và luồng đặt lịch kiểm tra xe.',
    image: '/media/ximi-ppf-dong-nai.webp',
    href: 'https://ppfdongnai.com/',
  },
  {
    name: 'HQN Group',
    category: 'Website doanh nghiệp xây dựng',
    description: 'Giới thiệu hệ sinh thái công ty, lĩnh vực hoạt động và năng lực thi công theo phong cách hiện đại.',
    image: '/media/ximi-hqn-group.webp',
    href: 'https://hqngroup.vn/',
  },
  {
    name: 'EngMind Study',
    category: 'Nền tảng luyện thi tiếng Anh',
    description: 'Nền tảng học trực tuyến, đề thi thử, khu vực xem lại lỗi sai, thư viện e-book và bộ công cụ tập trung học.',
    image: '/media/ximi-engmind-study.webp',
    href: 'https://engmindstudy.vn/',
  },
  {
    name: 'LumineCloud',
    category: 'Website dịch vụ hosting game',
    description: 'Bảng cấu hình phần cứng, bảng giá theo gói, panel quản trị và luồng khởi tạo server nhanh.',
    image: '/media/ximi-lumine-cloud.webp',
    href: 'https://luminecloud.com/',
  },
] as const;

export const ximiBenefits = [
  ['Bàn giao nhanh', 'Website trong 3–7 ngày, App trong 1–2 tuần'],
  ['Dễ nâng cấp', 'Sau này cần thêm trang, form hoặc tính năng vẫn dễ làm tiếp'],
  ['Hỗ trợ tận tâm', 'Tư vấn rõ ràng, hướng dẫn sử dụng miễn phí sau bàn giao'],
  ['Bảo hành 5 năm', 'Sửa lỗi kỹ thuật thuộc phạm vi đã nghiệm thu trong 5 năm'],
] as const;

export const ximiPlans = [
  {
    name: 'Landing Page',
    label: 'Khởi động nhanh',
    originalPrice: '3.000.000đ',
    price: '1.888.000đ',
    time: '3–5 ngày',
    bestFor: 'Chiến dịch, giới thiệu dịch vụ, form tư vấn',
    features: ['1 giao diện responsive', 'SEO nền tảng', 'Form liên hệ', 'GA4 + Pixel cơ bản', 'Bảo hành 5 năm', 'Tặng hosting 1 năm'],
    cta: 'Nhận báo giá Landing',
  },
  {
    name: 'Website doanh nghiệp',
    label: 'Đề xuất',
    originalPrice: '8.000.000đ',
    price: '5.000.000đ',
    time: '7–14 ngày',
    bestFor: 'Công ty, portfolio, dịch vụ cần SEO bền',
    features: ['UI/UX theo thương hiệu', 'SEO on-page nâng cao', 'CMS dễ cập nhật', 'GA4', 'Search Console', 'Sitemap', 'Bảo hành 5 năm'],
    cta: 'Tư vấn gói doanh nghiệp',
    recommended: true,
  },
  {
    name: 'Website bán hàng',
    label: 'Tăng trưởng',
    originalPrice: '15.000.000đ',
    price: '10.000.000đ',
    time: '3–4 tuần',
    bestFor: 'Shop, catalog sản phẩm, bán hàng online',
    features: ['Giao diện bán hàng riêng', 'Schema sản phẩm', 'Quản lý sản phẩm', 'Quản lý đơn hàng', 'Giỏ hàng', 'Theo dõi chuyển đổi', 'Bảo hành 5 năm'],
    cta: 'Xây web bán hàng',
  },
  {
    name: 'Web App Custom',
    label: 'Theo yêu cầu',
    price: 'Từ 10.000.000đ',
    time: 'Theo phạm vi',
    bestFor: 'Dashboard, CRM mini, đặt lịch, workflow nội bộ',
    features: ['Prototype trước khi code', 'Backend / API tùy chỉnh', 'Dashboard', 'Phân quyền', 'Custom workflow', 'Báo cáo', 'Bảo hành 5 năm'],
    cta: 'Trao đổi giải pháp',
  },
] as const;

export const ximiCapabilities = [
  { title: 'Giao diện khách nhìn thấy', items: ['Đẹp trên điện thoại', 'Dễ đọc', 'Nút liên hệ rõ', 'Tải nhanh', 'Hiệu ứng mượt', 'Đúng màu thương hiệu', 'Form nhận khách', 'Dễ xem giá'] },
  { title: 'Phần quản lý phía sau', items: ['Quản lý bài viết', 'Quản lý sản phẩm', 'Quản lý đơn hàng', 'Tài khoản nhân viên', 'Phân quyền', 'Lưu dữ liệu', 'Gửi thông báo', 'Báo cáo cơ bản'] },
  { title: 'Công cụ vận hành riêng', items: ['Dashboard', 'CRM mini', 'Đặt lịch', 'Theo dõi đơn', 'Quản lý khách hàng', 'Workflow', 'Mobile', 'Xuất báo cáo'] },
  { title: 'AI hỗ trợ tư vấn', items: ['Chatbot', 'Gợi ý sản phẩm', 'Tóm tắt yêu cầu', 'Lọc khách', 'Trả lời tự động', 'Smart search'] },
] as const;

export const ximiProcess = [
  ['01', 'Hiểu mục tiêu', 'Làm rõ khách cần website để bán hàng, giới thiệu dịch vụ, nhận khách liên hệ hay quản lý nội bộ.'],
  ['02', 'Chốt phạm vi', 'Bóc tách tính năng, nội dung, thời gian, chi phí và phần khách nhận khi bàn giao.'],
  ['03', 'Thiết kế & xây dựng', 'Triển khai giao diện, tính năng, responsive mobile, SEO và kết nối cần thiết.'],
  ['04', 'Bàn giao & bảo hành', 'Hướng dẫn sử dụng, hỗ trợ lỗi kỹ thuật và đồng hành trong quá trình vận hành.'],
] as const;

export const ximiFaq = [
  {
    question: 'Thiết kế website giá rẻ ở đâu uy tín?',
    answer: 'Novra nhận thiết kế Landing Page từ 1.888.000đ, gồm giao diện responsive, form liên hệ, SEO nền tảng và bảo hành 5 năm. Ưu đãi hosting hoặc domain được xác nhận theo báo giá tại thời điểm triển khai. Thời gian tham khảo 3–5 ngày.',
  },
  {
    question: 'Làm website bán hàng giá bao nhiêu?',
    answer: 'Website bán hàng tại Novra có giá từ 10 triệu, thường gồm danh mục, sản phẩm, giỏ hàng, quản lý đơn và bảo hành 5 năm. Thanh toán online, vận chuyển, tồn kho, hosting và domain được xác nhận theo phạm vi báo giá.',
  },
  {
    question: 'Làm website mất bao lâu?',
    answer: 'Landing Page mất khoảng 3–5 ngày, website doanh nghiệp 1–2 tuần và website thương mại điện tử 3–4 tuần. Thời gian cuối cùng được xác nhận theo nội dung và phạm vi tính năng.',
  },
  {
    question: 'Novra có làm web app quản lý theo yêu cầu không?',
    answer: 'Có. Novra nhận làm web app quản lý đơn hàng, đặt lịch, dashboard, CRM mini hoặc hệ thống nội bộ theo yêu cầu và tư vấn luồng nghiệp vụ trước khi báo giá.',
  },
  {
    question: 'Website có được tối ưu SEO không?',
    answer: 'Website được tối ưu SEO on-page gồm tốc độ tải, responsive mobile, cấu trúc heading, meta tags, sitemap và schema phù hợp. Các hạng mục SEO nâng cao được triển khai theo gói riêng.',
  },
  {
    question: 'Sau khi bàn giao website, nếu có lỗi thì sao?',
    answer: 'Novra bảo hành lỗi kỹ thuật thuộc chức năng đã nghiệm thu trong 60 tháng. Yêu cầu mở rộng hoặc thay đổi ngoài phạm vi sẽ được đánh giá và báo chi phí trước khi thực hiện.',
  },
] as const;
