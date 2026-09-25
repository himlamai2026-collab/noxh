/* Lõi máy soạn hồ sơ — dùng chung trình duyệt + node. Luật chọn tờ: spec §4 (đã soát 25/09/2026). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./cai-dat.js'));
  else root.SoanHoSo = factory(root.CAI_DAT);
})(typeof self !== 'undefined' ? self : this, function (CAI_DAT) {
  var CHON = '☒', TRONG = '☐', CHAM_TAY = '……………………………';   // ô chưa có dữ liệu: để dòng chấm cho khách viết tay

  function soTien(n) { return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function khongDau(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function homNay() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function ngayVN() { var d = new Date(); return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear(); }
  function la7(dien) { return String(dien || '').indexOf('7-') === 0; }
  function laThuNhap(dien) { return ['5-thu-nhap-thap', '6-cong-nhan', '8-cbccvc'].indexOf(dien) >= 0; }
  function khongLam(ng) { return ng.vieclam === 'tu-do' || ng.vieclam === 'khong'; }   // không HĐLĐ, không lương hưu → Mẫu 05
  function trong(v) { return v === undefined || v === null || String(v).trim() === ''; }
  /* Vợ/chồng chỉ phải chứng minh thu nhập khi người đứng đơn thuộc diện có điều kiện thu nhập (khoản 5/6/7/8 Điều 76)
     VÀ mua/thuê mua — thuê không xét thu nhập (Điều 78 k2); diện 1/4/9/10 chỉ xét nhà ở. */
  function vcCoToThuNhap(k) { var dd = k.nguoiDungDon || {}; return k.hinhThuc !== 'thue' && (laThuNhap(dd.dien) || la7(dd.dien)); }

  /* ---- chọn tờ ---- */
  function toDoiTuong(ng, laVC) {
    var d = ng.dien, thuNhap = khongLam(ng) ? [{ mau: '02-mau-05', khoaNoiXin: '02-mau-05' }] : [{ mau: '02-mau-01a', khoaNoiXin: '02-mau-01a' }];
    if (la7(d)) return [{ mau: '02-mau-04', khoaNoiXin: '02-mau-04' }, { mau: d === '7-llvt-quan-doi' ? '02b-mau-bqp' : '02b-mau-noca', khoaNoiXin: d === '7-llvt-quan-doi' ? '02b-mau-bqp' : '02b-mau-noca', phu: true }];
    if (laVC) return thuNhap;                    // vợ/chồng: chỉ gọi khi vcCoToThuNhap — tờ thu nhập theo việc làm của chính người đó
    if (['9-tra-nha-cong-vu', '10-thu-hoi-dat', '11-sinh-vien'].indexOf(d) >= 0) return [{ mau: '02-mau-01-tt08', khoaNoiXin: '02-mau-01-tt08' }];
    if (laThuNhap(d)) return thuNhap;
    return [];                                   // diện 1, 4: giấy chứng nhận có sẵn, bản kê ghi
  }
  function toCua(k, laVC) {                      // tờ đối tượng/thu nhập của một người (không tính tờ nhà ở)
    if (!laVC) return toDoiTuong(k.nguoiDungDon || {}, false);
    return k.honNhan === 'ket-hon' && k.voChong && vcCoToThuNhap(k) ? toDoiTuong(k.voChong, true) : [];
  }
  function toNhaO(k) {
    if (k.hinhThuc === 'thue') return [];
    if (k.nhaO === 'duoi-15m2') return [{ mau: '03-mau-03', khoaNoiXin: '03-mau-03' }];
    if (k.nhaO === 'xa-noi-lam') return [{ mau: '03-xa-noi-lam', khoaNoiXin: '03-xa-noi-lam' }, { mau: '03b-xn-noi-lam-viec', khoaNoiXin: '03b-xn-noi-lam-viec', phu: true }];
    return [{ mau: '03-mau-02', khoaNoiXin: '03-mau-02' }];
  }
  function chonTo(k) {
    var cfg = CAI_DAT.duAn[k.duAn]; if (!cfg) throw new Error('dự án lạ: ' + k.duAn);
    var ds = [{ ma: '00', mau: '00-ban-ke', tenFile: '00-ban-ke.docx', cuaAi: '', khoaNoiXin: '' },
              { ma: '01', mau: cfg.mauDon, tenFile: '01-don-dang-ky.docx', cuaAi: 'dd', khoaNoiXin: '01-don' }];
    function them(so, list, cuaAi, ten) {
      list.forEach(function (t) { var ma = so + (t.phu ? 'b' : ''); ds.push({ ma: ma, mau: t.mau, tenFile: ma + '-' + t.mau.replace(/^0\db?-/, '') + '-' + khongDau(ten) + '.docx', cuaAi: cuaAi, khoaNoiXin: t.khoaNoiXin }); });
    }
    them('02', toCua(k, false), 'dd', k.nguoiDungDon.hoTen);
    them('03', toNhaO(k), 'dd', k.nguoiDungDon.hoTen);
    if (k.honNhan === 'ket-hon' && k.voChong) {
      them('04', toCua(k, true), 'vc', k.voChong.hoTen);
      them('05', toNhaO(k), 'vc', k.voChong.hoTen);
    }
    return ds;
  }

  /* ---- sàng ---- */
  function sang(k) {
    var loi = [], cfg = CAI_DAT.duAn[k.duAn], dd = k.nguoiDungDon || {};
    if (!cfg) return [{ o: 'duAn', loi: 'Chưa chọn dự án' }];
    function bat(ng, tien, o, ten) { if (!ng || !String(ng[o] || '').trim()) loi.push({ o: tien + o, loi: 'Thiếu ' + ten }); }
    /* Thu nhập / Công an xã chỉ bắt với người THỰC SỰ có tờ tương ứng trong bộ (toCua) — luật miễn thu nhập
       cho diện 1/4/9/10/11, cho người thuê và cho vợ/chồng của họ; thu nhập 0 là hợp lệ (nội trợ, nghỉ thai sản). */
    function batNguoi(ng, tien, dsTo) {
      bat(ng, tien, 'hoTen', 'họ tên'); bat(ng, tien, 'noiOHienTai', 'nơi ở hiện tại'); bat(ng, tien, 'thuongTru', 'nơi đăng ký thường trú/tạm trú');
      bat(ng, tien, 'ngheNghiep', 'nghề nghiệp'); bat(ng, tien, 'dien', 'diện đối tượng'); bat(ng, tien, 'vieclam', 'loại việc làm');
      if (!ng.cccd || !ng.cccd.so || !ng.cccd.ngayCap || !ng.cccd.noiCap) loi.push({ o: tien + 'cccd', loi: 'Thiếu căn cước (số, ngày cấp, nơi cấp)' });
      var mau = dsTo.map(function (t) { return t.mau; });
      if (mau.some(function (m) { return ['02-mau-01a', '02-mau-05', '02-mau-04'].indexOf(m) >= 0; }) &&
          (trong(ng.thuNhapThang) || !(Number(ng.thuNhapThang) >= 0))) loi.push({ o: tien + 'thuNhapThang', loi: 'Thiếu thu nhập tháng (không có thu nhập thì ghi 0)' });
      if (khongLam(ng) && laThuNhap(ng.dien) && ng.dien !== '5-thu-nhap-thap') loi.push({ o: tien + 'vieclam', loi: 'Lao động tự do / không có việc làm chỉ khai được diện "người thu nhập thấp đô thị" (Mẫu 05 TT 08/2026 chỉ áp cho khoản 5 Điều 76 không có HĐLĐ)' });
      if (mau.indexOf('02-mau-05') >= 0 && !String(ng.congAnXa || '').trim()) loi.push({ o: tien + 'congAnXa', loi: 'Mẫu 05 cần tên Công an xã/phường nơi thường trú/tạm trú (dòng Kính gửi)' });
    }
    if (!/^0\d{9}$/.test(String(k.sdt || ''))) loi.push({ o: 'sdt', loi: 'Số điện thoại phải 10 số, bắt đầu bằng 0' });
    batNguoi(dd, '', toCua(k, false));
    if (dd.dien === '11-sinh-vien' && k.hinhThuc !== 'thue') loi.push({ o: 'dien', loi: 'Học sinh, sinh viên chỉ được THUÊ nhà ở xã hội (Luật Nhà ở 2023 Điều 78)' });
    if (k.honNhan === 'ket-hon') {
      if (!k.voChong) loi.push({ o: 'voChong', loi: 'Đã kết hôn thì phải nhập đủ thông tin vợ/chồng (giấy tờ ghi tên, căn cước người kia)' });
      else batNguoi(k.voChong, 'vc.', toCua(k, true));
      if (!String(k.soDangKyKetHon || '').trim()) loi.push({ o: 'soDangKyKetHon', loi: 'Thiếu số đăng ký kết hôn (Mẫu 02 mục 7)' });
    }
    if (k.hinhThuc !== 'thue') {
      if (['chua-co', 'duoi-15m2', 'xa-noi-lam'].indexOf(k.nhaO) < 0) loi.push({ o: 'nhaO', loi: 'Phải chọn một trong ba: chưa có nhà tại ' + cfg.tinh + ' / có nhà dưới 15 m²/người / có nhà nhưng xa nơi làm việc (NĐ 100/2024 Đ29, sửa bởi NĐ 54/2026)' });
      if (k.nhaO === 'duoi-15m2') {
        var n15 = k.nhaO_duoi15 || {};
        if (!n15.gcnSo || !(n15.dienTichSan > 0) || !(n15.soNguoi > 0)) loi.push({ o: 'nhaO_duoi15', loi: 'Cần số Giấy chứng nhận, diện tích sàn và số người trong hộ' });
        else if (n15.dienTichSan / n15.soNguoi >= 15) loi.push({ o: 'nhaO_duoi15', loi: 'Bình quân ' + (n15.dienTichSan / n15.soNguoi).toFixed(1) + ' m²/người, không dưới 15 m² → không thuộc diện này' });
      }
      if (k.nhaO === 'xa-noi-lam') {
        var nx = k.nhaO_xa || {};
        if (!nx.diaChiNhaDangCo || !nx.xaNoiLamViec) loi.push({ o: 'nhaO_xa', loi: 'Cần địa chỉ nhà đang có và xã/phường nơi làm việc' });
      }
      if (laThuNhap(dd.dien)) {
        var t = cfg.tranThuNhap, tn = Number(dd.thuNhapThang) || 0;
        if (k.honNhan === 'ket-hon' && k.voChong) {
          var tong = tn + (Number(k.voChong.thuNhapThang) || 0);
          if (tong > t.voChong) loi.push({ o: 'thuNhapThang', loi: 'Tổng thu nhập hai vợ chồng ' + soTien(tong) + ' đ vượt trần ' + soTien(t.voChong) + ' đ (' + t.nguon + ')' });
        } else if (k.honNhan === 'doc-than-nuoi-con') {
          if (tn > t.nuoiCon) loi.push({ o: 'thuNhapThang', loi: 'Thu nhập ' + soTien(tn) + ' đ vượt trần độc thân nuôi con ' + soTien(t.nuoiCon) + ' đ (' + t.nguon + ')' });
        } else if (tn > t.docThan) loi.push({ o: 'thuNhapThang', loi: 'Thu nhập ' + soTien(tn) + ' đ vượt trần độc thân ' + soTien(t.docThan) + ' đ (' + t.nguon + ')' });
      }
      if (la7(dd.dien)) loi.push({ o: 'thuNhapThang', nhac: true, loi: 'Diện lực lượng vũ trang: trần là tổng thu nhập sĩ quan cấp Đại tá, máy không tự chặn — đơn vị xác nhận' });
    }
    return loi;
  }

  /* ---- dữ liệu thẻ ---- */
  function chuDoiTuong(ng) {
    var s = CAI_DAT.chuDoiTuong[ng.dien] || '';
    if (ng.vieclam === 'huu-tri' && s) s += CAI_DAT.chuHuuTri;
    return s;
  }
  function nguoi(ng) {
    return { hoTen: ng.hoTen || '', ngaySinh: ng.ngaySinh || '', gioiTinh: ng.gioiTinh || '',
      cccdSo: (ng.cccd && ng.cccd.so) || '', cccdNgayCap: (ng.cccd && ng.cccd.ngayCap) || '', cccdNoiCap: (ng.cccd && ng.cccd.noiCap) || '',
      noiOHienTai: ng.noiOHienTai || '', thuongTru: ng.thuongTru || '', ngheNghiep: ng.ngheNghiep || '', tenCoQuan: ng.tenCoQuan || '',
      thuNhapSo: trong(ng.thuNhapThang) ? '' : soTien(ng.thuNhapThang), thuNhapDong: trong(ng.thuNhapThang) ? '' : soTien(ng.thuNhapThang) + ' đồng/tháng',
      congAnXa: ng.congAnXa || '' };
  }
  function duLieuTo(k, to) {
    var cfg = CAI_DAT.duAn[k.duAn], dd = k.nguoiDungDon, vc = k.voChong;
    var ng = to.cuaAi === 'vc' ? vc : dd, kia = to.cuaAi === 'vc' ? dd : vc;
    var d = nguoi(ng || {});
    d.tinh = cfg.tinh; d.doiTuong = chuDoiTuong(ng || {});
    d.vcHoTen = kia ? kia.hoTen : ''; d.vcCccdSo = kia && kia.cccd ? kia.cccd.so : ''; d.vcCccdNgayCap = kia && kia.cccd ? kia.cccd.ngayCap : ''; d.vcCccdNoiCap = kia && kia.cccd ? kia.cccd.noiCap : '';
    d.soDangKyKetHon = k.honNhan === 'ket-hon' ? (k.soDangKyKetHon || '') : '';
    if (to.mau === '00-ban-ke') return banKe(k);
    if (to.ma === '01') {
      d.kinhGui = k.kinhGuiDon || cfg.kinhGuiDon; d.noiLamViec = la7(dd.dien) ? '' : (dd.tenCoQuan || '');
      d.o_mua = k.hinhThuc === 'thue' ? TRONG : (k.hinhThuc === 'thue-mua' ? TRONG : CHON); d.o_thueMua = k.hinhThuc === 'thue-mua' ? CHON : TRONG; d.o_thue = k.hinhThuc === 'thue' ? CHON : TRONG;
      d.o_nha1 = k.nhaO === 'chua-co' ? CHON : TRONG; d.o_nha2 = k.nhaO === 'duoi-15m2' ? CHON : TRONG; d.o_nha3 = k.nhaO === 'xa-noi-lam' ? CHON : TRONG;
      var tn = laThuNhap(dd.dien), kh = k.honNhan === 'ket-hon';
      d.o_tn1 = tn && !kh && k.honNhan !== 'doc-than-nuoi-con' ? CHON : TRONG; d.o_tn2 = tn && k.honNhan === 'doc-than-nuoi-con' ? CHON : TRONG; d.o_tn3 = tn && kh ? CHON : TRONG;
      var l7 = la7(dd.dien), vc7 = kh && vc && la7(vc.dien);
      d.o_llvt1 = l7 && !kh ? CHON : TRONG; d.o_llvt2 = l7 && kh && vc7 ? CHON : TRONG; d.o_llvt3 = l7 && kh && !vc7 ? CHON : TRONG;
      return d;
    }
    if (to.mau === '02-mau-01a') { d.kinhGui = ng.tenCoQuan || ''; if (to.cuaAi === 'vc') d.doiTuong = ''; return d; }
    if (to.mau === '03-mau-02') { d.kinhGui = k.kinhGuiMau02 || cfg.kinhGuiMau02; return d; }
    if (to.mau === '03-mau-03') { var n15 = k.nhaO_duoi15 || {}; d.kinhGui = ng.ubndXa || ''; d.gcnSo = n15.gcnSo || ''; d.dienTichSan = n15.dienTichSan || ''; return d; }
    if (to.mau === '03-xa-noi-lam' || to.mau === '03b-xn-noi-lam-viec') { var nx = k.nhaO_xa || {}; d.kinhGui = to.mau === '03b-xn-noi-lam-viec' ? (ng.tenCoQuan || '') : (k.kinhGuiMau02 || cfg.kinhGuiMau02); d.noiDuKienMua = cfg.ten + ', tỉnh ' + cfg.tinh; d.noiLamViec = ng.tenCoQuan || ''; d.xaNoiLamViec = nx.xaNoiLamViec || CHAM_TAY; d.xaDuAn = k.xaDuAn || CHAM_TAY; return d; }
    if (to.mau === '02-mau-04' || to.mau === '02b-mau-bqp' || to.mau === '02b-mau-noca') { d.kinhGui = ng.tenCoQuan || ''; return d; }
    if (to.mau === '02-mau-01-tt08') { d.kinhGui = ng.dien === '10-thu-hoi-dat' ? (ng.ubndXa || '') : (ng.tenCoQuan || ''); return d; }
    return d;   // 02-mau-05: đủ từ nguoi(); dòng "Là đối tượng" in sẵn trên mẫu bộ chuẩn 2026, không có thẻ
  }
  function banKe(k) {
    var cfg = CAI_DAT.duAn[k.duAn], ds = chonTo(k).filter(function (t) { return t.ma !== '00'; });
    var coNhaO = ds.some(function (t) { return /^0[35]/.test(t.ma); });                  // 03/03b của người đứng đơn, 05 của vợ/chồng
    var coVC = k.honNhan === 'ket-hon' && ds.some(function (t) { return t.cuaAi === 'vc'; });
    var luuY = CAI_DAT.luuY.filter(function (x) { return !x.khi || (x.khi === 'nhaO' && coNhaO) || (x.khi === 'voChong' && coVC); });
    var coLuong = ds.some(function (t) { return t.mau === '02-mau-01a' || t.mau === '02-mau-04'; });   // bảng lương 12 tháng chỉ đi kèm 01a/04
    var giayKem = CAI_DAT.giayKem.filter(function (g) { return typeof g === 'string' || !g.khi || (g.khi === 'luong' && coLuong); })
      .map(function (g) { return { ten: typeof g === 'string' ? g : g.chu }; });
    var to = ds.map(function (t, i) {
      var nx = CAI_DAT.noiXin[t.khoaNoiXin] || { ten: t.mau, aiKy: '', noiXin: '', baoLau: '' };
      var ai = t.cuaAi === 'vc' ? ' — của ' + k.voChong.hoTen : (t.cuaAi === 'dd' && k.honNhan === 'ket-hon' ? ' — của ' + k.nguoiDungDon.hoTen : '');
      return { stt: t.ma, ten: nx.ten + ai, aiKy: nx.aiKy, noiXin: nx.noiXin, baoLau: nx.baoLau };
    });
    return { tenKhach: k.nguoiDungDon.hoTen, sdt: k.sdt, duAn: cfg.ten, tinh: cfg.tinh, ngaySoan: ngayVN(),
      to: to, giayKem: giayKem, luuY: luuY.map(function (x) { return { chu: x.chu }; }),
      cauUyTin: CAI_DAT.cauUyTin, lienHe: CAI_DAT.lienHe };
  }
  function tenZip(k) { return 'ho-so-' + khongDau(k.nguoiDungDon.hoTen) + '-' + k.sdt + '-' + homNay() + '.zip'; }

  function giaiMa64(b64) {
    if (typeof Buffer !== 'undefined') return Buffer.from(b64, 'base64');
    var bin = atob(b64), u8 = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }
  function soan(k, lib) {
    var loi = sang(k).filter(function (e) { return !e.nhac; });
    if (loi.length) { var e = new Error('Sàng không qua'); e.loi = loi; return Promise.reject(e); }
    // mọi lỗi (thiếu mẫu, thiếu thẻ, Multi error) đi qua reject — một kênh lỗi duy nhất
    return Promise.resolve().then(function () {
      var zip = new lib.JSZip(), ds = chonTo(k);
      ds.forEach(function (to) {
        var b64 = lib.MAU.B64[to.mau]; if (!b64) throw new Error('chưa có mẫu ' + to.mau + ' trong mau.js');
        var d = duLieuTo(k, to);
        var doc = new lib.Docxtemplater(new lib.PizZip(giaiMa64(b64)), { paragraphLoop: true, linebreaks: true,
          nullGetter: function (part) { throw new Error('thiếu thẻ ' + part.value + ' ở ' + to.mau); } });
        doc.render(d);
        zip.file(to.tenFile, doc.getZip().generate({ type: 'uint8array', compression: 'DEFLATE' }));
      });
      zip.file('thong-tin-khach.json', JSON.stringify(k, null, 2));
      return { ten: tenZip(k), zip: zip, to: ds };
    });
  }

  return { chonTo: chonTo, sang: sang, duLieuTo: duLieuTo, tenZip: tenZip, soTien: soTien, khongDau: khongDau, homNay: homNay, CHON: CHON, TRONG: TRONG, soan: soan, giaiMa64: giaiMa64, banKe: banKe };
});
