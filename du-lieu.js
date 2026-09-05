/* ═══════════════════════════════════════════════════════════════
   BA LỚP DỮ LIỆU — sửa đúng lớp, không sửa lẫn sang lớp khác.

   Lớp 1 CHINH_SACH  · luật, dùng chung mọi dự án · đổi khi có nghị định mới
   Lớp 2 DU_AN       · từng dự án · thêm dự án mới = thêm một khối
   Lớp 3 NGUOI_BAN   · từng nhân viên · thêm người mới = thêm một dòng

   Chọn lúc chạy bằng địa chỉ link:
     ...?da=trang-cat&nv=nam&n=fb
     da = mã dự án · nv = mã nhân viên · n = kênh (để biết khách đến từ đâu)
   Không có tham số thì dùng MAC_DINH khai trong tu-kiem-tra.js.

   🔴 FILE NÀY LÀ NGUỒN DUY NHẤT. Trang chủ (trang-chu.js) và trang công cụ
      (tu-kiem-tra.js) đều đọc từ đây, nên sửa một chỗ là hai nơi cùng đổi.
      Đừng chép số liệu ra thẳng HTML — trạng thái đợt hồ sơ có đổi theo thời gian,
      chép tay là có ngày trang chủ nói ngược với công cụ ngay trước mặt khách.
   ═══════════════════════════════════════════════════════════════ */

/* ── LỚP 1 · CHÍNH SÁCH ─────────────────────────────────────── */
const CHINH_SACH = {
  traNgay : '17/08/2026',
  hetHan  : '2026-12-31',          // qua mốc này trang tự hiện cảnh báo phải tra lại

  /* Trần thu nhập NỀN toàn quốc — triệu đồng/tháng, thực nhận bình quân 12 tháng.
     Nghị định 136/2026/NĐ-CP, hiệu lực 07/4/2026.
     Lịch sử: 15/30 (NĐ 100/2024) → 20/30/40 (NĐ 261/2025) → 25/35/50 (NĐ 136/2026).
     Ba lần đổi trong hai năm — luôn tra lại trước khi tin con số này. */
  tranNen : { docthan:25, nuoicon:35, kethon:50 },
  tranNguon : 'Nghị định 136/2026/NĐ-CP, hiệu lực 07/4/2026 — đã đối chiếu bản gốc có chữ ký, đọc 24/08/2026',

  /* Vay ưu đãi Ngân hàng Chính sách xã hội */
  vay : { tyLeToiDa:0.80, namToiDa:25, laiSuat:5.4 },

  /* Diện tích bình quân tối đa vẫn được coi là chưa có nhà */
  m2BinhQuan : 15,

  /* Điều kiện nhà ở xét theo đơn vị hành chính nào */
  phamViNhaO : 'Điều 29 NĐ 100/2024/NĐ-CP sửa bởi Điều 32 NĐ 54/2026/NĐ-CP — xét theo <b>tỉnh, thành phố trực thuộc trung ương nơi có dự án</b>'
};

/* ── LỚP 2 · DỰ ÁN ──────────────────────────────────────────── */
const DU_AN = {

  'trang-cat': {
    ten     : 'Happy Home Tràng Cát',
    diaChi  : 'phường Tràng Cát, TP Hải Phòng',
    tinh    : 'thành phố Hải Phòng',      // đơn vị hành chính xét điều kiện nhà ở
    tinhNgan: 'Hải Phòng',

    heSo      : 1.16,                      // nhân với tranNen ra trần của địa phương
    heSoNguon : 'Quyết định 55/2026/QĐ-UBND, hiệu lực 01/8/2026',

    /* Cảnh báo riêng của địa bàn — để trống nếu dự án khác không có */
    luuYNhaO : 'Lưu ý: Hải Dương đã sáp nhập vào Hải Phòng từ 01/7/2025. Nhà ở Chí Linh, Kinh Môn, Bình Giang… nay tính là nhà tại Hải Phòng.',
    luuYNguon: 'Hải Phòng sáp nhập Hải Dương từ 01/7/2025 — Nghị quyết 202/2025/QH15',

    /* 'dang-mo' = đang có đợt tiếp nhận hồ sơ → giục khách làm giấy cho kịp
       'chua-mo' = chưa công bố đợt nào        → khuyên chuẩn bị, KHÔNG giục xin giấy
       Giấy xác nhận điều kiện nhà ở chỉ sống 06 tháng, xin sớm quá là phải xin lại. */
    giaiDoan : 'dang-mo',
    /* Nguồn + ngày soát của DÒNG TRẠNG THÁI trên. Bắt buộc có, vì
       "đang nhận hồ sơ" mà không nói ngày soát thì vài tuần nữa
       thành câu nói sai với khách. */
    dotNguon : 'Sở Xây dựng Hải Phòng đăng 21/08/2026 · chưa công bố ngày đóng đợt',

    laiDuAn  : 5.9,                        // gói lãi suất riêng của dự án, null nếu chưa có
    vanPhong : 'Vincom Plaza Ngô Quyền',

    /* Giá — VnExpress 25/12/2025 */
    gia      : '21,2–23,7 triệu/m² · căn nhỏ nhất khoảng 600 triệu, lớn nhất khoảng 1,64 tỷ',
    giaNguon : 'VnExpress, 25/12/2025',
    giaGoiY  : 750,                        // số điền sẵn ở ô giá, triệu đồng

    /* Tiến độ đóng tiền — market.vinhomes.vn, tra 8/2026 */
    thanhToan: '30% khi ký hợp đồng · 10% mỗi đợt vào ngày 60 / 120 / 180 / 240 · 25% khi bàn giao (kèm VAT và phí bảo trì) · 5% khi có sổ',
    ttNguon  : 'market.vinhomes.vn — đơn vị phân phối, tra tháng 8/2026'
  },

  /* ── Happy Home Phố Hiến — thêm 24/08/2026 ───────────────────
     Dự án MỚI XONG MÓNG: chưa công bố giá, chưa có đợt nhận hồ sơ.
     Công cụ này ở đây chỉ làm ĐÚNG MỘT VIỆC — sàng điều kiện.
     🔴 Tuyệt đối không điền giá vào khối này cho tới khi Vinhomes
        công bố chính thức: 20 tr/m² và 13–16 tr/m² đang trôi trên
        mạng là GIÁ CỦA DỰ ÁN KHÁC.                                 */
  'pho-hien': {
    ten     : 'Happy Home Phố Hiến (Vinhomes)',
    diaChi  : 'phường Phố Hiến, tỉnh Hưng Yên',
    tinh    : 'tỉnh Hưng Yên',
    tinhNgan: 'Hưng Yên',

    /* heSo = 1 nghĩa là DÙNG THẲNG MỨC NỀN, không phải "hệ số bằng 1".
       Căn cứ: NĐ 136/2026 Điều 1 khoản 1 điểm d — UBND cấp tỉnh *được*
       quyết định hệ số (quyền tùy chọn), trần = thu nhập bình quân đầu
       người của tỉnh ÷ của cả nước. Tra 24/08/2026 chưa thấy Hưng Yên
       ban hành Quyết định nào. Tỉnh chỉ được NỚI LÊN, không được siết
       xuống → sàng bằng mức nền chỉ có thể sai theo hướng nhẹ (bảo một
       người đủ điều kiện là hãy chờ hỏi lại), không bao giờ sai theo
       hướng chết người (bảo một người không đủ là đã đủ).
       🔴 KHÔNG mượn hệ số 1,16 của Hải Phòng sang đây. */
    heSo      : 1,
    heSoNguon : '⚠️ chưa thấy Hưng Yên ban hành Quyết định hệ số riêng (tra 24/08/2026) — đang áp mức nền toàn quốc; nếu tỉnh ban hành thì chỉ có thể cao hơn mức này',

    luuYNhaO : 'Lưu ý: Thái Bình đã sáp nhập vào Hưng Yên từ 01/7/2025. Nhà ở tại Vũ Thư, Kiến Xương, Tiền Hải, TP Thái Bình cũ… nay tính là nhà tại Hưng Yên.',
    luuYNguon: 'Hưng Yên sáp nhập Thái Bình từ 01/7/2025 — Nghị quyết 202/2025/QH15',

    giaiDoan : 'chua-mo',                  // mới xong móng, chưa công bố đợt nhận hồ sơ
    dotNguon : 'soát ngày 24/08/2026',

    laiDuAn  : null,                       // chưa có gói lãi suất riêng của dự án
    vanPhong : '',                         // chưa có văn phòng bán hàng công bố

    /* 🔴 Để trống có chủ đích — xem chú thích đầu khối */
    gia      : '',
    giaNguon : '',
    giaGoiY  : 0,

    thanhToan: '',
    ttNguon  : ''
  }

  /* ── MẪU THÊM DỰ ÁN MỚI — chép khối dưới, bỏ dấu chú thích, điền đủ ──
  ,'ma-du-an': {
    ten:'', diaChi:'', tinh:'', tinhNgan:'',
    heSo:null, heSoNguon:'',        // ⚠️ phải tra quyết định của tỉnh đó, KHÔNG mượn hệ số 1,16
                                    //    tra rồi mà tỉnh chưa ban hành → điền 1 (dùng mức nền), xem khối 'pho-hien'
    luuYNhaO:'', luuYNguon:'',
    giaiDoan:'chua-mo',             // đổi sang 'dang-mo' khi dự án mở đợt nhận hồ sơ
    dotNguon:'',                    // nguồn + ngày soát của dòng trạng thái, hiện trên trang chủ
    laiDuAn:null, vanPhong:'',
    gia:'', giaNguon:'', giaGoiY:0,
    thanhToan:'', ttNguon:''
  }
  ── heSo để null thì công cụ tự khoá lại, không cho khách trả lời sai ── */
};

/* ── LỚP 3 · NGƯỜI BÁN ──────────────────────────────────────── */
const NGUOI_BAN = {
  'nam' : { ten:'Trần Ngọc Nam', sdt:'0879388988', zalo:'https://zalo.me/0879388988' }
  /* ,'ten-ma': { ten:'', sdt:'', zalo:'https://zalo.me/<số>' } */
};

/* Nơi nhận thông tin khách để lại. Để trống → mở Zalo của người bán.
   Điền URL Google Apps Script vào đây thì mọi dự án, mọi nhân viên đổ chung một bảng. */
const NOI_NHAN = 'https://script.google.com/macros/s/AKfycbwZN0KZv3CF1UcVUZpRk7nMPQrg6i9wns3EicIWlKLgX0s0lFxBUwI15aRygP-tziHKgQ/exec';

/* ── LỚP 4 · BÀI VIẾT ───────────────────────────────────────────
   Trang chủ lấy 3 bài đầu, /bai-viet/ lấy toàn bộ. Bài mới thêm lên ĐẦU mảng.
   Thêm bài = thêm một khối ở đây + một dòng trong sitemap.xml. Hết. */
const BAI_VIET = [
  { url  : '/bai-viet/nha-o-xa-hoi-pho-hien-hung-yen.html',
    tieuDe: 'Nhà ở xã hội Phố Hiến (Hưng Yên) đang đến đâu?',
    tomTat: 'Happy Home của Vinhomes chưa công bố giá, chưa có đợt hồ sơ — và vì sao con số giá đang trôi trên mạng là của dự án khác.',
    ngay  : '2026-08-28', duAn: 'pho-hien' },

  { url  : '/bai-viet/luong-20-trieu-mua-nha-o-xa-hoi-trang-cat.html',
    tieuDe: 'Lương 20 triệu có mua được nhà ở xã hội Tràng Cát không?',
    tomTat: 'Trần thu nhập tại Hải Phòng vừa nới lên 29 / 40,6 / 58 triệu từ 01/8/2026 — cao hơn nhiều so với con số đa số người đang nhớ.',
    ngay  : '2026-08-21', duAn: 'trang-cat' },

  { url  : '/bai-viet/da-co-nha-o-que-mua-nha-o-xa-hoi-hai-phong.html',
    tieuDe: 'Đã có nhà ở quê, mua nhà ở xã hội Hải Phòng được không?',
    tomTat: 'Được — luật xét theo tỉnh, thành phố nơi có dự án. Nhưng nhà ở Hải Dương cũ nay tính là nhà tại Hải Phòng.',
    ngay  : '2026-08-21', duAn: 'trang-cat' },

  { url  : '/bai-viet/vay-goi-duoi-35-tuoi-han-31-12-2026.html',
    tieuDe: 'Vay gói dưới 35 tuổi — còn mấy tháng nữa?',
    tomTat: '6,5%/năm trong 5 năm đầu, áp dụng đến hết 31/12/2026. Kèm bảng trả góp và những gì phải chuẩn bị trước.',
    ngay  : '2026-08-21', duAn: 'trang-cat' }
];
