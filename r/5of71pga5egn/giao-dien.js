/* Giao diện trang soạn hồ sơ: form ↔ object k (spec §3) → SoanHoSo. Không có logic luật ở đây. */
(function () {
  var o = function (id) { return document.getElementById(id); };
  var TRUONG_NGUOI = ['hoTen', 'ngaySinh', 'gioiTinh', 'cccdSo', 'cccdNgayCap', 'cccdNoiCap', 'noiOHienTai', 'thuongTru', 'ngheNghiep', 'tenCoQuan', 'dien', 'vieclam', 'thuNhapThang', 'congAnXa', 'ubndXa'];
  var KHOA_NHAP = 'soan-ho-so.nhap';

  function khoiNguoi(t) {
    var dien = Object.keys(CAI_DAT.tenDien).map(function (k) { return '<option value="' + k + '">' + CAI_DAT.tenDien[k] + '</option>'; }).join('');
    return '<div class="hang">' +
      '<label>Họ và tên <input id="' + t + '_hoTen"></label>' +
      '<label>Ngày sinh <input id="' + t + '_ngaySinh" placeholder="dd/mm/yyyy"></label>' +
      '<label>Giới tính <select id="' + t + '_gioiTinh"><option>Nam</option><option>Nữ</option></select></label>' +
      '<label>Số căn cước <input id="' + t + '_cccdSo" inputmode="numeric"></label>' +
      '<label>Ngày cấp <input id="' + t + '_cccdNgayCap" placeholder="dd/mm/yyyy"></label>' +
      '<label>Nơi cấp <input id="' + t + '_cccdNoiCap" value="' + CAI_DAT.noiCapChip + '"></label></div>' +
      '<button id="nutQR_' + t + '" class="phu" type="button">Quét QR bằng camera</button>' +
      '<button id="nutAnh_' + t + '" class="phu" type="button">Tải ảnh căn cước lên</button>' +
      '<input type="file" id="anhQR_' + t + '" accept="image/*" multiple class="an">' +
      '<details class="cachKhac"><summary>Cách khác: dán chuỗi QR</summary>' +
      '<small>Quét mã bằng app khác (Zalo, app Camera, VNeID) rồi dán chuỗi hiện ra vào đây.</small>' +
      '<input id="chuoiQR_' + t + '" placeholder="033…|…|Họ tên|…"></details>' +
      '<label>Nơi ở hiện tại <input id="' + t + '_noiOHienTai"></label>' +
      '<label>Đăng ký thường trú / tạm trú <input id="' + t + '_thuongTru"></label>' +
      '<div class="hang"><label>Nghề nghiệp <input id="' + t + '_ngheNghiep"></label>' +
      '<label>Tên cơ quan / công ty <input id="' + t + '_tenCoQuan"></label>' +
      '<label>Diện đối tượng <select id="' + t + '_dien">' + dien + '</select></label>' +
      '<label>Việc làm <select id="' + t + '_vieclam"><option value="hop-dong">Có hợp đồng lao động</option><option value="cong-chuc">Công chức, viên chức, LLVT</option><option value="huu-tri">Hưu trí</option><option value="tu-do">Lao động tự do (không HĐLĐ)</option><option value="khong">Không có việc làm / đang học / nội trợ</option></select></label>' +
      '<label>Thu nhập tháng (đồng; không có thì ghi 0) <input id="' + t + '_thuNhapThang" inputmode="numeric"></label>' +
      '<label>Công an xã/phường (nếu tự do / không có việc làm) <input id="' + t + '_congAnXa" placeholder="phường Phố Hiến"></label>' +
      '<label>UBND xã/phường (nếu Mẫu 03 / thu hồi đất) <input id="' + t + '_ubndXa"></label></div>';
  }
  function docNguoi(t) {
    var ng = {}; TRUONG_NGUOI.forEach(function (f) { ng[f] = o(t + '_' + f).value.trim(); });
    ng.cccd = { so: ng.cccdSo, ngayCap: ng.cccdNgayCap, noiCap: ng.cccdNoiCap }; delete ng.cccdSo; delete ng.cccdNgayCap; delete ng.cccdNoiCap;
    var so = String(ng.thuNhapThang).replace(/[^\d]/g, '');
    ng.thuNhapThang = so === '' ? '' : Number(so);        // trống ≠ 0: diện không xét thu nhập để trống, sàng tự biết ai phải ghi
    return ng;
  }
  function doNguoi(t, ng) {
    ng = ng || {}; var c = ng.cccd || {};
    TRUONG_NGUOI.forEach(function (f) {
      var v = f === 'cccdSo' ? c.so : f === 'cccdNgayCap' ? c.ngayCap : f === 'cccdNoiCap' ? c.noiCap : ng[f];
      if (v !== undefined && v !== null) o(t + '_' + f).value = v;
    });
  }
  function docForm() {
    var k = { duAn: o('duAn').value, hinhThuc: o('hinhThuc').value, sdt: o('sdt').value.replace(/\D/g, ''),
      nguoiDungDon: docNguoi('dd'), honNhan: o('honNhan').value, soDangKyKetHon: o('soDangKyKetHon').value.trim(),
      voChong: o('honNhan').value === 'ket-hon' ? docNguoi('vc') : null, nhaO: o('nhaO').value,
      nhaO_duoi15: o('nhaO').value === 'duoi-15m2' ? { gcnSo: o('n15_gcnSo').value.trim(), dienTichSan: Number(o('n15_dienTichSan').value), soNguoi: Number(o('n15_soNguoi').value) } : null,
      nhaO_xa: o('nhaO').value === 'xa-noi-lam' ? { diaChiNhaDangCo: o('nx_diaChiNhaDangCo').value.trim(), xaNoiLamViec: o('nx_xaNoiLamViec').value.trim() } : null,
      xaDuAn: o('nhaO').value === 'xa-noi-lam' ? o('nx_xaDuAn').value.trim() : '',
      kinhGuiDon: o('kinhGuiDon').value.trim(), kinhGuiMau02: o('kinhGuiMau02').value.trim() };
    return k;
  }
  function doForm(k) {
    if (!k) return;
    ['duAn', 'hinhThuc', 'sdt', 'honNhan', 'soDangKyKetHon', 'nhaO', 'kinhGuiDon', 'kinhGuiMau02'].forEach(function (f) { if (k[f] !== undefined) o(f).value = k[f]; });
    doNguoi('dd', k.nguoiDungDon); doNguoi('vc', k.voChong);
    if (k.nhaO_duoi15) { o('n15_gcnSo').value = k.nhaO_duoi15.gcnSo || ''; o('n15_dienTichSan').value = k.nhaO_duoi15.dienTichSan || ''; o('n15_soNguoi').value = k.nhaO_duoi15.soNguoi || ''; }
    if (k.nhaO_xa) { o('nx_diaChiNhaDangCo').value = k.nhaO_xa.diaChiNhaDangCo || ''; o('nx_xaNoiLamViec').value = k.nhaO_xa.xaNoiLamViec || ''; o('nx_xaDuAn').value = k.xaDuAn || ''; }
    anHien();
  }
  function anHien() {
    o('khoi_kh').classList.toggle('an', o('honNhan').value !== 'ket-hon');
    o('khoi_n15').classList.toggle('an', o('nhaO').value !== 'duoi-15m2');
    o('khoi_nx').classList.toggle('an', o('nhaO').value !== 'xa-noi-lam');
  }
  function doiDuAn() {
    var c = CAI_DAT.duAn[o('duAn').value];
    o('kinhGuiDon').value = c.kinhGuiDon; o('kinhGuiMau02').value = c.kinhGuiMau02;
  }
  var choQuyetNhap = false;                                // đang hiện dải nháp cũ → chưa ghi đè nháp cho tới khi bấm Tiếp tục / Khách mới
  function luuNhap() { if (choQuyetNhap) return; try { var k = docForm(); k.luc = new Date().toISOString(); localStorage.setItem(KHOA_NHAP, JSON.stringify(k)); } catch (e) {} }
  function docNhap() { try { return JSON.parse(localStorage.getItem(KHOA_NHAP) || 'null'); } catch (e) { return null; } }
  function boNhap() { try { localStorage.removeItem(KHOA_NHAP); } catch (e) {} }
  function hai(n) { return String(n).padStart(2, '0'); }
  function hienDaiNhap(nhap) {
    var ten = (nhap.nguoiDungDon && String(nhap.nguoiDungDon.hoTen || '').trim()) || '(chưa tên)', d = nhap.luc ? new Date(nhap.luc) : null;
    var luc = d && !isNaN(d) ? hai(d.getHours()) + ':' + hai(d.getMinutes()) + ' ' + hai(d.getDate()) + '/' + hai(d.getMonth() + 1) : '(không rõ giờ)';
    o('daiNhap_ten').textContent = ten; o('daiNhap_luc').textContent = luc;           // textContent: tên từ bộ nhớ không chạy thành HTML
    choQuyetNhap = true; o('daiNhap').classList.remove('an');
    o('nutTiepTuc').onclick = function () { choQuyetNhap = false; o('daiNhap').classList.add('an'); doForm(nhap); };
    o('nutKhachMoi').onclick = function () { choQuyetNhap = false; o('daiNhap').classList.add('an'); boNhap(); };
  }
  function hien(chu, loi) { o('ketQua').className = loi ? 'loi' : ''; o('ketQua').textContent = chu; }
  function soat() {
    var loi = SoanHoSo.sang(docForm());
    var chan = loi.filter(function (e) { return !e.nhac; }), nhac = loi.filter(function (e) { return e.nhac; });
    if (chan.length) { hien('CHƯA QUA SÀNG:\n' + chan.map(function (e) { return '• ' + e.loi; }).join('\n') + (nhac.length ? '\n\nNhắc:\n' + nhac.map(function (e) { return '• ' + e.loi; }).join('\n') : ''), true); return false; }
    var ds = SoanHoSo.chonTo(docForm());
    hien('QUA SÀNG. Bộ sẽ có ' + ds.length + ' tờ:\n' + ds.map(function (t) { return '• ' + t.tenFile; }).join('\n') + (nhac.length ? '\n\nNhắc:\n' + nhac.map(function (e) { return '• ' + e.loi; }).join('\n') : ''));
    return true;
  }
  function xuat() {
    if (!soat()) return;
    var k = docForm();
    SoanHoSo.soan(k, { PizZip: PizZip, Docxtemplater: docxtemplater, JSZip: JSZip, MAU: MAU }).then(function (kq) {
      return kq.zip.generateAsync({ type: 'blob' }).then(function (blob) {
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = kq.ten; document.body.appendChild(a); a.click(); a.remove();
        hien('ĐÃ XUẤT ' + kq.ten + '\n' + kq.to.map(function (t) { return '• ' + t.tenFile; }).join('\n') + '\n');
        var nut = document.createElement('button'); nut.type = 'button'; nut.id = 'nutKhachMoiSauXuat'; nut.textContent = 'Khách mới';
        nut.addEventListener('click', function () { boNhap(); location.reload(); });      // đã xuất xong → xoá nháp (có căn cước) không hỏi lại
        o('ketQua').appendChild(nut);
        if (typeof SoKhach !== 'undefined') SoKhach.ghiSauXuat(k, kq).then(function (r) { if (r && r.chu) o('ketQua').appendChild(document.createTextNode('\n\n' + r.chu)); });
      });
    }).catch(function (e) { hien('LỖI: ' + e.message + (e.loi ? '\n' + e.loi.map(function (x) { return '• ' + x.loi; }).join('\n') : ''), true); });
  }
  function xoa() { if (!confirm('Xoá toàn bộ ô đang điền?')) return; boNhap(); location.reload(); }
  var HONG_DOC = 'Không đọc được mã QR trong ảnh.\n' +
    '• Ảnh phải là MẶT TRƯỚC thẻ căn cước gắn chip, thấy rõ ô mã QR ở góc trên bên phải.\n' +
    '• Mã phải nét: chụp cách 20–30 cm, đủ sáng, không loá, không nghiêng. Ảnh mờ thì không máy nào đọc được.\n' +
    '• Ảnh khách gửi qua Zalo bị nén nhỏ → xin họ gửi lại kiểu "Tệp / File gốc".\n' +
    '• Thẻ cũ không có ô mã QR thì gõ tay, hoặc quét bằng app khác rồi dán chuỗi (mục "Cách khác").';
  function nhanQR(t, r) {                              // đổ dữ liệu một thẻ đã đọc được vào khối người t
    doNguoi(t, { hoTen: r.hoTen, ngaySinh: r.ngaySinh, gioiTinh: r.gioiTinh, thuongTru: r.thuongTru, cccd: { so: r.so, ngayCap: r.ngayCap, noiCap: CAI_DAT.noiCapChip } });
    if (!o(t + '_noiOHienTai').value) o(t + '_noiOHienTai').value = r.thuongTru;
    luuNhap(); hien('Đã đọc căn cước: ' + r.hoTen + ' · ' + r.so + '\nSoát lại họ tên và thường trú trên thẻ rồi điền tiếp nghề nghiệp, diện, thu nhập.');
  }
  function tienDo(i, n, tep, soTep) {
    hien('Đang đọc ảnh' + (soTep > 1 ? ' ' + tep + '/' + soTep : '') + '… lượt ' + i + '/' + n);
  }
  function gaiQR(t) {
    if (typeof QuetQR === 'undefined') { o('nutQR_' + t).classList.add('an'); o('nutAnh_' + t).classList.add('an'); return; }
    if (QuetQR.coCamera()) {
      o('nutQR_' + t).addEventListener('click', function () {
        hien('Đang mở camera… đưa MẶT TRƯỚC thẻ vào khung, mã QR ở góc trên phải. Không tự ra thì bấm "Chụp lấy về đọc kỹ".');
        QuetQR.chon({ video: o('videoQR'), khung: o('khungQR'), nutDong: o('nutDongQR'), nutChup: o('nutChupQR'),
          oTep: o('anhQR_' + t), baoTien: tienDo, bao: function (c) { hien(c); } }).then(function (r) {
          if (!r) { hien(HONG_DOC, true); return; }
          nhanQR(t, r);
        }).catch(function (e) { hien('Lỗi quét: ' + e.message, true); });
      });
    } else o('nutQR_' + t).classList.add('an');       // mở bằng file:// trên laptop: không có camera, chỉ tải ảnh lên
    o('nutAnh_' + t).addEventListener('click', function () {
      QuetQR.taiAnh({ oTep: o('anhQR_' + t), baoTien: tienDo }).then(function (r) {
        if (!r) { hien(HONG_DOC, true); return; }
        nhanQR(t, r);
      }).catch(function (e) { hien('Lỗi đọc ảnh: ' + e.message, true); });
    });
    o('chuoiQR_' + t).addEventListener('input', function () {
      var v = this.value.trim(); if (!v) return;
      var r = QuetQR.boc(v);
      if (!r) { hien('Chuỗi dán vào chưa đúng kiểu QR căn cước (phải là 7 phần cách nhau bằng dấu |, mở đầu bằng 12 số).', true); return; }
      nhanQR(t, r); this.value = '';
    });
  }
  function khoiDong() {
    o('duAn').innerHTML = Object.keys(CAI_DAT.duAn).map(function (k) { return '<option value="' + k + '">' + CAI_DAT.duAn[k].ten + '</option>'; }).join('');
    o('khoi_dd').innerHTML = khoiNguoi('dd'); o('khoi_vc').innerHTML = khoiNguoi('vc');
    doiDuAn(); anHien(); var nhap = docNhap(); if (nhap) hienDaiNhap(nhap);        // nháp cũ KHÔNG tự đổ vào form: hỏi Tiếp tục / Khách mới
    o('duAn').addEventListener('change', doiDuAn); o('honNhan').addEventListener('change', anHien); o('nhaO').addEventListener('change', anHien);
    document.body.addEventListener('input', luuNhap); document.body.addEventListener('change', luuNhap);
    o('nutSoat').addEventListener('click', soat); o('nutXuat').addEventListener('click', xuat); o('nutXoa').addEventListener('click', xoa);
    gaiQR('dd'); gaiQR('vc');
    if (typeof SoKhach !== 'undefined') SoKhach.gan(document.body);
  }
  window.GiaoDien = { docForm: docForm, doForm: doForm, luuNhap: luuNhap, docNhap: docNhap, xuat: xuat, soat: soat };
  document.addEventListener('DOMContentLoaded', khoiDong);
})();
