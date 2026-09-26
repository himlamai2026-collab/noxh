/* Sổ khách trên trang: gọi Apps Script (link + khoá lưu localStorage máy này, KHÔNG nằm trong mã). */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.SoKhach = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  var KHOA = 'soan-ho-so.so';
  function bao(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function caiDat() { try { return JSON.parse(localStorage.getItem(KHOA) || '{}'); } catch (e) { return {}; } }
  /* Cài một chạm: mở trang bằng link có đuôi #so=<link Apps Script>&khoa=<khoá> → lưu vào máy này rồi xoá đuôi khỏi thanh địa chỉ. */
  function docHashCaiDat(hash) {
    var h = String(hash || ''); if (h.charAt(0) === '#') h = h.slice(1);
    var ra = {}; h.split('&').forEach(function (c) { var i = c.indexOf('='); if (i > 0) { try { ra[decodeURIComponent(c.slice(0, i))] = decodeURIComponent(c.slice(i + 1)); } catch (e) {} } });
    if (!ra.so || !ra.khoa || !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(ra.so)) return null;
    return { link: ra.so, khoa: ra.khoa };
  }
  function nhanCaiDatTuLink() {
    if (typeof location === 'undefined') return false;
    var c = docHashCaiDat(location.hash); if (!c) return false;
    luuCaiDat(c);
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    return true;
  }
  function luuCaiDat(c) { try { localStorage.setItem(KHOA, JSON.stringify(c)); } catch (e) {} }
  function goi(hanhDong, them) {
    var c = caiDat(); if (!c.link || !c.khoa) return Promise.resolve({ ok: false, loi: 'chưa cài sổ (link + khoá ở cuối trang)' });
    var body = JSON.stringify(Object.assign({ khoa: c.khoa, hanhDong: hanhDong }, them || {}));
    return fetch(c.link, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body, redirect: 'follow' })
      .then(function (r) { return r.json(); }).catch(function (e) { return { ok: false, loi: 'không gọi được sổ: ' + e.message }; });
  }
  function root_CAI() { return (typeof CAI_DAT !== 'undefined') ? CAI_DAT : { duAn: {}, tenDien: {} }; }
  function ghiSauXuat(k, kq) {
    return Promise.resolve().then(function () {
      if (!k || !k.nguoiDungDon) return { chu: 'KHÔNG ghi được sổ: thiếu người đứng đơn' };
      var CAI = root_CAI(), dd = k.nguoiDungDon, duAn = CAI.duAn && CAI.duAn[k.duAn];
      if (!duAn) return { chu: 'KHÔNG ghi được sổ: không rõ dự án "' + k.duAn + '"' };
      return goi('ghi', { dong: { hoTen: dd.hoTen, sdt: k.sdt, duAn: duAn.ten, hinhThuc: k.hinhThuc, dien: (CAI.tenDien && CAI.tenDien[dd.dien]) || dd.dien,
        honNhan: k.honNhan, nhaO: k.nhaO, to: (kq && kq.to ? kq.to.map(function (t) { return t.ma; }).join(' ') : ''),
        nguon: (typeof location !== 'undefined' && location.protocol === 'file:') ? 'laptop' : 'dien-thoai', tenZip: kq && kq.ten } })
        .then(function (r) {
          if (r && r.ok) { taiBang(); return { chu: 'Đã ghi sổ khách (hàng ' + r.hang + ').' }; }
          return { chu: 'KHÔNG ghi được sổ: ' + (r && r.loi ? r.loi : 'không rõ lỗi') };
        });
    }).catch(function (e) { return { chu: 'KHÔNG ghi được sổ: ' + (e && e.message ? e.message : String(e)) }; });
  }
  function danhSach() { return goi('danhSach', { gioiHan: 50 }); }
  function doiTrangThai(sdt, tt, ghiChu) { return goi('trangThai', { sdt: sdt, trangThai: tt, ghiChu: ghiChu }); }
  var bang = null;
  function taiBang() {
    if (!bang) return; bang.textContent = 'Đang tải…';
    danhSach().then(function (r) {
      if (!r.ok) { bang.textContent = r.loi; return; }
      if (!r.ds.length) { bang.textContent = 'Sổ trống.'; return; }
      var h = '<table style="width:100%;border-collapse:collapse;font-size:14px"><tr><th>Ngày</th><th>Khách</th><th>SĐT</th><th>Dự án</th><th>Trạng thái</th><th></th></tr>';
      r.ds.forEach(function (d) {
        h += '<tr><td>' + bao(d.ngay) + '</td><td>' + bao(d.hoTen) + '</td><td>' + bao(d.sdt) + '</td><td>' + bao(d.duAn) + '</td><td>' + bao(d.trangThai) + '</td><td>' +
          '<select data-sdt="' + bao(d.sdt) + '"><option>①đăng ký</option><option>②gom giấy</option><option>③đủ giấy</option></select></td></tr>';
      });
      bang.innerHTML = h + '</table>';
      Array.prototype.forEach.call(bang.querySelectorAll('select'), function (s) {
        s.value = r.ds.find(function (d) { return d.sdt === s.dataset.sdt; }).trangThai || '①đăng ký';
        s.addEventListener('change', function () { doiTrangThai(s.dataset.sdt, s.value).then(taiBang); });
      });
    });
  }
  function gan(body) {
    var vuaCai = nhanCaiDatTuLink();
    var c = caiDat(), khung = document.createElement('div');
    khung.innerHTML = '<h2>Sổ khách (Google Sheet)</h2><div class="hang"><label>Link Apps Script <input id="so_link" value="' + bao(c.link) + '"></label>' +
      '<label>Khoá <input id="so_khoa" type="password" value="' + bao(c.khoa) + '"></label></div>' +
      '<button id="so_luu" class="phu" type="button">Lưu cài đặt sổ</button><button id="so_tai" class="phu" type="button">Tải danh sách</button><div id="so_bang"></div>';
    body.appendChild(khung); bang = khung.querySelector('#so_bang');
    khung.querySelector('#so_luu').addEventListener('click', function () { luuCaiDat({ link: khung.querySelector('#so_link').value.trim(), khoa: khung.querySelector('#so_khoa').value }); taiBang(); });
    khung.querySelector('#so_tai').addEventListener('click', taiBang);
    if (vuaCai) { var b = document.createElement('div'); b.textContent = 'Đã cài sổ khách vào máy này từ link. Lần sau mở trang bình thường, không cần link có đuôi nữa.'; khung.insertBefore(b, bang); }
    if (c.link && c.khoa) taiBang();
  }
  return { caiDat: caiDat, luuCaiDat: luuCaiDat, docHashCaiDat: docHashCaiDat, nhanCaiDatTuLink: nhanCaiDatTuLink, goi: goi, ghiSauXuat: ghiSauXuat, danhSach: danhSach, doiTrangThai: doiTrangThai, gan: gan };
});
