/* BẢNG CÀI ĐẶT máy soạn hồ sơ. Sửa ở đây, không sửa soan.js.
   Mọi con số kèm nguồn + ngày tra. ⚠️ = chưa xác minh, đổi khi có bộ hồ sơ thật (spec §6, §11). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CAI_DAT = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var LLVT = 'Sĩ quan, quân nhân chuyên nghiệp, hạ sĩ quan thuộc lực lượng vũ trang nhân dân, công nhân công an, công chức, công nhân và viên chức quốc phòng đang phục vụ tại ngũ; người làm công tác cơ yếu, người làm công tác khác trong tổ chức cơ yếu hưởng lương từ ngân sách nhà nước đang công tác';
  return {
    duAn: {
      'pho-hien': {
        ten: 'Happy Home Phố Hiến', tinh: 'Hưng Yên', mauDon: '01-don-pho-hien',
        kinhGuiDon: 'Công ty Cổ phần Vinhomes',                       // ⚠️ theo bản đơn công ty phát cho Phố Hiến (in sẵn); pháp nhân CĐT chưa xác minh — hỏi văn phòng
        kinhGuiMau02: 'Văn phòng Đăng ký đất đai tỉnh Hưng Yên',        // ⚠️ suy từ mẫu Hải Phòng công ty phát; sửa được ngay trên form
        tranThuNhap: { docThan: 25000000, nuoiCon: 35000000, voChong: 50000000,
          nguon: 'NĐ 136/2026/NĐ-CP Điều 1 khoản 1 (hiệu lực 07/4/2026); Hưng Yên chưa ban hành hệ số (tra 24/08/2026)' }
      },
      'trang-cat': {
        ten: 'Happy Home Tràng Cát', tinh: 'Hải Phòng', mauDon: '01-don-trang-cat',
        kinhGuiDon: 'Công ty Cổ phần Vinhomes',                       // ⚠️ chưa xác minh
        kinhGuiMau02: 'Văn phòng Đăng ký đất đai thành phố Hải Phòng',  // ✅ mẫu "xa nơi làm việc" công ty phát in sẵn tên này
        tranThuNhap: { docThan: 29000000, nuoiCon: 40600000, voChong: 58000000,
          nguon: 'QĐ 55/2026/QĐ-UBND Hải Phòng, hệ số 1,16 (hiệu lực 01/8/2026, tra 24/08/2026)' }
      }
    },
    /* Chữ ghi vào dòng "Thuộc đối tượng" — nguyên văn chân trang các mẫu (Mẫu 02/03 TT 08/2026, Mẫu 01a TT 32/2025). */
    chuDoiTuong: {
      '5-thu-nhap-thap': 'Người thu nhập thấp tại khu vực đô thị',
      '6-cong-nhan': 'Công nhân, người lao động đang làm việc tại doanh nghiệp, hợp tác xã, liên hiệp hợp tác xã trong và ngoài khu công nghiệp',
      '8-cbccvc': 'Cán bộ, công chức, viên chức theo quy định của pháp luật về cán bộ, công chức, viên chức',
      '7-llvt-quan-doi': LLVT,
      '7-llvt-cong-an': LLVT,
      '9-tra-nha-cong-vu': 'Đối tượng đã trả lại nhà ở công vụ theo quy định tại khoản 4 Điều 125 của Luật Nhà ở, trừ trường hợp bị thu hồi nhà ở công vụ do vi phạm quy định của Luật Nhà ở',
      '10-thu-hoi-dat': 'Hộ gia đình, cá nhân thuộc trường hợp bị thu hồi đất và phải giải tỏa, phá dỡ nhà ở theo quy định của pháp luật mà chưa được Nhà nước bồi thường bằng nhà ở, đất ở',
      '11-sinh-vien': 'Học sinh, sinh viên đại học, học viện, trường đại học, cao đẳng, dạy nghề, học sinh trường dân tộc nội trú công lập, trường chuyên biệt theo quy định của pháp luật',
      '1-nguoi-co-cong': 'Người có công với cách mạng, thân nhân liệt sĩ thuộc trường hợp được hỗ trợ cải thiện nhà ở theo quy định của Pháp lệnh Ưu đãi người có công với cách mạng',
      '4-ho-ngheo-do-thi': 'Hộ gia đình nghèo, cận nghèo tại khu vực đô thị'
    },
    tenDien: {
      '5-thu-nhap-thap': 'Người thu nhập thấp đô thị', '6-cong-nhan': 'Công nhân / người lao động', '8-cbccvc': 'Cán bộ, công chức, viên chức',
      '7-llvt-quan-doi': 'LLVT — quân đội', '7-llvt-cong-an': 'LLVT — công an', '9-tra-nha-cong-vu': 'Đã trả nhà công vụ',
      '10-thu-hoi-dat': 'Bị thu hồi đất', '11-sinh-vien': 'Học sinh, sinh viên (chỉ thuê)', '1-nguoi-co-cong': 'Người có công', '4-ho-ngheo-do-thi': 'Hộ nghèo, cận nghèo đô thị'
    },
    chuHuuTri: ' (nghỉ hưu)',            // Mẫu 01a chân trang 8: đã nghỉ hưu thì ghi thêm
    noiCapChip: 'Cục Cảnh sát quản lý hành chính về trật tự xã hội',   // thẻ CCCD gắn chip 2021; thẻ mẫu 2024 ⚠️ chưa xác minh
    /* Bản kê: ai ký, xin ở đâu, bao lâu — theo chân trang từng mẫu. */
    noiXin: {
      '01-don': { ten: 'Đơn đăng ký mua, thuê mua, thuê nhà ở xã hội (Mẫu 01, NĐ 136/2026)', aiKy: 'Khách tự ký', noiXin: 'Không cần xác nhận', baoLau: '—' },
      '02-mau-01a': { ten: 'Giấy xác nhận về đối tượng, thu nhập (Mẫu 01a, TT 32/2025)', aiKy: 'Cơ quan / công ty nơi làm việc; nghỉ hưu: cơ quan BHXH đang chi trả', noiXin: 'Phòng nhân sự / kế toán', baoLau: 'Thường 1–3 ngày (⚠️ tuỳ công ty)' },
      '02-mau-05': { ten: 'Đơn đề nghị xác nhận điều kiện về thu nhập (Mẫu 05, TT 08/2026)', aiKy: 'Công an cấp xã nơi thường trú/tạm trú', noiXin: 'Công an xã/phường', baoLau: '⚠️ chưa xác minh' },
      '02-mau-04': { ten: 'Giấy xác nhận về điều kiện thu nhập (Mẫu 04, lực lượng vũ trang)', aiKy: 'Cơ quan, đơn vị nơi công tác', noiXin: 'Đơn vị', baoLau: '⚠️ chưa xác minh' },
      '02b-mau-bqp': { ten: 'Giấy xác nhận về đối tượng (Bộ Quốc phòng)', aiKy: 'Đơn vị cấp Trung đoàn trở lên', noiXin: 'Đơn vị', baoLau: '⚠️ chưa xác minh' },
      '02b-mau-noca': { ten: 'Giấy chứng minh đối tượng trong Công an nhân dân', aiKy: 'Cấp có thẩm quyền của đơn vị', noiXin: 'Đơn vị', baoLau: '⚠️ chưa xác minh' },
      '02-mau-01-tt08': { ten: 'Giấy xác nhận về đối tượng (Mẫu 01, TT 08/2026)', aiKy: 'UBND cấp xã (thu hồi đất) / cơ quan quản lý nhà công vụ / nhà trường', noiXin: 'Theo chân trang mẫu', baoLau: '⚠️ chưa xác minh' },
      '03-mau-02': { ten: 'Giấy xác nhận về điều kiện nhà ở — chưa có nhà (Mẫu 02, TT 08/2026)', aiKy: 'Cơ quan cấp Giấy chứng nhận đất đai của TỈNH CÓ DỰ ÁN', noiXin: 'Văn phòng Đăng ký đất đai / Trung tâm phục vụ hành chính công', baoLau: '07 ngày làm việc (TT 08/2026)' },
      '03-mau-03': { ten: 'Giấy xác nhận về điều kiện nhà ở — dưới 15 m²/người (Mẫu 03)', aiKy: 'UBND cấp xã nơi thường trú', noiXin: 'UBND xã/phường', baoLau: '⚠️ chưa xác minh' },
      '03-xa-noi-lam': { ten: 'Giấy xác nhận điều kiện nhà ở — có nhà nhưng xa nơi làm việc', aiKy: 'Văn phòng Đăng ký đất đai', noiXin: 'Văn phòng Đăng ký đất đai', baoLau: '⚠️ chưa xác minh' },
      '03b-xn-noi-lam-viec': { ten: 'Giấy xác nhận về nơi làm việc', aiKy: 'Cơ quan / công ty nơi làm việc', noiXin: 'Phòng nhân sự', baoLau: '⚠️ chưa xác minh' }
    },
    /* Giấy nhân thân phải mang kèm (không có mẫu) — ⚠️ số bản, hạn công chứng, ảnh: chờ bộ thật (spec §11). */
    giayKem: [
      'Căn cước công dân của người đứng đơn (và của vợ/chồng nếu đã kết hôn) — bản sao công chứng',
      'Giấy đăng ký kết hôn (đã kết hôn) HOẶC giấy xác nhận tình trạng hôn nhân (độc thân)',
      'Giấy khai sinh của con (nếu khai diện độc thân nuôi con dưới 18 tuổi)',
      'Giấy xác nhận cư trú (CT01) nếu văn phòng yêu cầu',
      'Diện người có công / hộ nghèo, cận nghèo: bản sao giấy chứng nhận tương ứng'
    ],
    luuY: [
      'Giấy nhà ở xin trước (07 ngày làm việc), giấy thu nhập / đối tượng xin sau.',
      'Vợ và chồng mỗi người một tờ nhà ở và một tờ thu nhập, không gộp.',
      'Ngày ký và chữ ký để trống, ký tay khi nộp.',
      'Chụp gửi Nam soát trước khi đi xin dấu, tránh phải đi lại.'
    ],
    cauUyTin: '🤝 Liên hệ trực tiếp văn phòng chủ đầu tư Vinhomes: không tiền cò, không mất phí',
    lienHe: 'Trần Ngọc Nam · Zalo 0879 388 988'
  };
});
