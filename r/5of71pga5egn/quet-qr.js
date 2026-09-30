/* Đọc QR căn cước bằng zxing-wasm. Trình duyệt: ZXingWASM (thu-vien/zxing-reader.js) + wasm base64 (thu-vien/zxing-wasm-b64.js).
   Node (test): import('zxing-wasm/reader') từ thư mục npm tạm. Chuỗi QR: so|cmndCu|hoTen|ddmmyyyy|gioiTinh|thuongTru|ddmmyyyy (đã xác nhận thẻ thật 25/09/2026).
   Hai đường đọc: docAnh() NHANH (vòng camera, thử cả ảnh ×1/×2/×3) · docKy() KỸ (ảnh tải lên, ảnh chụp lấy về: cắt từng
   vùng ảnh, đổi cỡ về ~1600 px, đổi cách nhị phân hoá) — thêm 01/10/2026 vì camera trên điện thoại không quét được. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(root, true);
  else root.QuetQR = factory(root, false);
})(typeof self !== 'undefined' ? self : this, function (root, laNode) {
  var zx = null, sanSangP = null;
  function b64ToU8(b64) {
    if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(b64, 'base64'));
    var bin = atob(b64), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u;
  }
  function sanSang() {
    if (sanSangP) return sanSangP;
    sanSangP = (function () {
      if (laNode) return import('zxing-wasm/reader').then(function (m) { zx = m; });   // gói npm tại chỗ (package.json)
      zx = root.ZXingWASM; if (!zx) return Promise.reject(new Error('thiếu thu-vien/zxing-reader.js'));
      var b64 = root.ZXING_WASM_B64; if (!b64) return Promise.reject(new Error('thiếu thu-vien/zxing-wasm-b64.js'));
      return Promise.resolve(zx.prepareZXingModule({ overrides: { wasmBinary: b64ToU8(b64).buffer }, fireImmediately: true })).then(function () {});
    })();
    return sanSangP;
  }
  function ngay(s) { return /^\d{8}$/.test(s) ? s.slice(0, 2) + '/' + s.slice(2, 4) + '/' + s.slice(4) : null; }
  function boc(chuoi) {
    var p = String(chuoi || '').trim().split('|'); if (p.length < 7) return null;
    if (!/^\d{12}$/.test(p[0])) return null;
    var ns = ngay(p[3]), nc = ngay(p[6]); if (!ns || !nc) return null;
    return { so: p[0], cmndCu: p[1], hoTen: p[2].trim(), ngaySinh: ns, gioiTinh: p[4].trim(), thuongTru: p[5].trim(), ngayCap: nc };
  }
  function phongDai(img, k) {                       // img {data,width,height} → nearest ×k (node không có canvas)
    if (k === 1) return img;
    var w = img.width * k, h = img.height * k, ra = new Uint8ClampedArray(w * h * 4);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var s = ((y / k | 0) * img.width + (x / k | 0)) * 4, d = (y * w + x) * 4;
      ra[d] = img.data[s]; ra[d + 1] = img.data[s + 1]; ra[d + 2] = img.data[s + 2]; ra[d + 3] = 255;
    }
    return { data: ra, width: w, height: h };
  }
  function anhTho(nguon, k) {                        // trình duyệt: vẽ lên canvas ×k → ImageData
    if (nguon && nguon.data && nguon.width) return phongDai(nguon, k);
    var w = (nguon.naturalWidth || nguon.videoWidth || nguon.width) * k, h = (nguon.naturalHeight || nguon.videoHeight || nguon.height) * k;
    var c = document.createElement('canvas'); c.width = w; c.height = h; var g = c.getContext('2d');
    g.imageSmoothingEnabled = false; g.drawImage(nguon, 0, 0, w, h); return g.getImageData(0, 0, w, h);
  }
  function docMot(img, them) {
    var o = { formats: ['QRCode'], tryHarder: true, maxNumberOfSymbols: 1 };
    if (them) for (var f in them) o[f] = them[f];
    return zx.readBarcodes(img, o).then(function (kq) { return kq && kq.length ? kq[0].text : null; });
  }
  function docAnh(nguon) {                           // đường NHANH: cả ảnh ×1 → ×2 → ×3 (vòng camera chạy 250 ms/lượt)
    return sanSang().then(function () {
      var tiLe = [1, 2, 3], i = 0;
      function thu() { if (i >= tiLe.length) return null; var img = anhTho(nguon, tiLe[i++]); return docMot(img).then(function (t) { return t || thu(); }); }
      return thu();
    });
  }

  /* ---- đường KỸ: cắt vùng + đổi cỡ + đổi cách nhị phân hoá ----
     Mã QR in ở góc TRÊN PHẢI mặt trước thẻ căn cước gắn chip. Ảnh khách gửi thường chụp cả bàn nên mã chỉ
     chiếm một góc nhỏ: cắt vùng rồi đưa vùng đó về ~1600 px đọc trúng hơn hẳn so với đọc cả ảnh một lần. */
  var VUNG = [
    { x: 0, y: 0, w: 1, h: 1 },            // cả ảnh
    { x: .42, y: 0, w: .58, h: .58 },      // góc trên phải — chỗ in mã
    { x: .5, y: 0, w: .5, h: 1 },          // nửa phải (ảnh chụp dọc)
    { x: 0, y: 0, w: .58, h: .58 },        // góc trên trái (ảnh bị lộn 180°)
    { x: .25, y: .2, w: .5, h: .6 },       // giữa
    { x: .42, y: .42, w: .58, h: .58 },
    { x: 0, y: .42, w: .58, h: .58 }
  ];
  var CO_DICH = 1600;                                 // cỡ cạnh dài THU ảnh lớn về — zxing đọc trúng nhất quanh mức này
  var TRAN_CANH = 4200;                               // cạnh dài tối đa sau khi PHÓNG — hơn nữa thì canvas quá to, trình duyệt bỏ
  /* Đo 01/10/2026 trên 5 ảnh căn cước thật: ảnh đã bị điện thoại/Zalo nén nhỏ (960×1280) chỉ đọc được khi
     PHÓNG TO ×2/×3, còn ảnh máy ảnh (4000 px) lại phải THU về ~1600. Nên mỗi vùng thử cả hai chiều, và
     danh sách luôn mở đầu bằng đúng 3 lượt của đường nhanh (cả ảnh ×1, ×2, ×3) để đường kỹ không bao giờ đọc kém hơn. */
  function tiLeCho(canhDai) {
    var ra = [1], khop = CO_DICH / canhDai;
    [2, 3].forEach(function (k) { if (canhDai * k <= TRAN_CANH) ra.push(k); });
    if (khop < .85 || khop > 1.15) ra.push(khop);
    return ra.filter(function (k, i) { return ra.every(function (t, j) { return j >= i || Math.abs(t - k) > .15; }); });
  }
  function kichThuoc(nguon) {
    if (nguon && nguon.data && nguon.width) return { w: nguon.width, h: nguon.height };
    return { w: nguon.naturalWidth || nguon.videoWidth || nguon.width, h: nguon.naturalHeight || nguon.videoHeight || nguon.height };
  }
  function catTho(img, sx, sy, sw, sh, dw, dh) {      // node: cắt + lấy mẫu gần nhất (không có canvas)
    var ra = new Uint8ClampedArray(dw * dh * 4);
    for (var y = 0; y < dh; y++) {
      var ys = sy + Math.min(sh - 1, (y * sh / dh) | 0);
      for (var x = 0; x < dw; x++) {
        var xs = sx + Math.min(sw - 1, (x * sw / dw) | 0), s = (ys * img.width + xs) * 4, d = (y * dw + x) * 4;
        ra[d] = img.data[s]; ra[d + 1] = img.data[s + 1]; ra[d + 2] = img.data[s + 2]; ra[d + 3] = 255;
      }
    }
    return { data: ra, width: dw, height: dh };
  }
  function vungAnh(nguon, v, k) {                     // cắt vùng v (theo tỉ lệ) rồi đổi cỡ ×k → ImageData
    var s = kichThuoc(nguon);
    var sx = Math.round(v.x * s.w), sy = Math.round(v.y * s.h);
    var sw = Math.min(s.w - sx, Math.max(1, Math.round(v.w * s.w))), sh = Math.min(s.h - sy, Math.max(1, Math.round(v.h * s.h)));
    var dw = Math.max(1, Math.round(sw * k)), dh = Math.max(1, Math.round(sh * k));
    if (nguon && nguon.data && nguon.width) return catTho(nguon, sx, sy, sw, sh, dw, dh);
    var c = document.createElement('canvas'); c.width = dw; c.height = dh; var g = c.getContext('2d');
    g.imageSmoothingEnabled = k < 1;                  // thu nhỏ thì làm mượt; phóng to để răng cưa cho ô vuông còn nét
    g.drawImage(nguon, sx, sy, sw, sh, 0, 0, dw, dh);
    return g.getImageData(0, 0, dw, dh);
  }
  function danhSachThu(nguon) {
    var s = kichThuoc(nguon), ra = [];
    VUNG.forEach(function (v, i) {
      var ks = tiLeCho(Math.max(s.w * v.w, s.h * v.h));
      var nhiPhan = i < 3 ? ['LocalAverage', 'GlobalHistogram'] : ['LocalAverage'];   // 3 vùng đầu thử cả hai cách
      nhiPhan.forEach(function (b) { ks.forEach(function (k) { ra.push({ v: v, k: k, b: b }); }); });
    });
    ra = ra.slice(0, 47);
    ra.push({ v: VUNG[0], k: Math.min(1, CO_DICH / Math.max(s.w, s.h)), b: 'LocalAverage', loNhoe: true });   // ảnh mờ, rung tay
    return ra;
  }
  function nhuong() { return new Promise(function (ok) { setTimeout(ok, 0); }); }     // nhả vòng lặp để trang kịp vẽ dòng "đang đọc"
  function docKy(nguon, baoTien) {
    return sanSang().then(function () {
      var ds = danhSachThu(nguon), i = 0;
      function thu() {
        if (i >= ds.length) return null;
        var a = ds[i++]; if (baoTien) { try { baoTien(i, ds.length); } catch (e) {} }
        var img; try { img = vungAnh(nguon, a.v, a.k); } catch (e) { return nhuong().then(thu); }
        return docMot(img, { binarizer: a.b, tryDenoise: !!a.loNhoe })
          .then(function (t) { return t || nhuong().then(thu); }, function () { return nhuong().then(thu); });
      }
      return thu();
    });
  }

  function moAnh(tep) {
    return new Promise(function (ok, hong) {
      var url = URL.createObjectURL(tep), im = new Image();
      im.onload = function () { URL.revokeObjectURL(url); ok(im); };
      im.onerror = function () { URL.revokeObjectURL(url); hong(new Error('không mở được ảnh "' + (tep.name || '') + '" — ảnh HEIC của iPhone thì gửi lại kiểu JPG')); };
      im.src = url;
    });
  }
  function docTep(tep, baoTien) { return moAnh(tep).then(function (im) { return docKy(im, baoTien); }); }
  function docNhieuTep(dsTep, baoTien) {              // chọn 2–3 ảnh thì thử lần lượt, ảnh nào ra mã thì dừng
    var ds = Array.prototype.slice.call(dsTep || []), i = 0, loiDau = null;
    function thu() {
      if (i >= ds.length) { if (loiDau) throw loiDau; return null; }
      var thuTu = ++i;
      return docTep(ds[thuTu - 1], baoTien ? function (a, b) { baoTien(a, b, thuTu, ds.length); } : null)
        .then(function (t) { return t || thu(); }, function (e) { loiDau = loiDau || e; return thu(); });
    }
    return Promise.resolve().then(thu);
  }
  function chonTep(oTep, baoTien) {
    return new Promise(function (ok, hong) {
      var xongRoi = false;
      function don() {                                                          // gỡ hết listener, tránh dính vào lần bấm sau
        oTep.onchange = null; oTep.oncancel = null;
        if (typeof window !== 'undefined' && window.removeEventListener) window.removeEventListener('focus', laiTieuDiem);
      }
      function xong(t) { if (xongRoi) return; xongRoi = true; don(); ok(t); }
      function laiTieuDiem() {                                                  // trình duyệt không hỗ trợ 'cancel': suy ra qua focus quay lại cửa sổ
        setTimeout(function () { if (!xongRoi && oTep.files.length === 0) xong(null); }, 300);
      }
      oTep.value = '';
      oTep.onchange = function () { xong(oTep.files.length ? docNhieuTep(oTep.files, baoTien) : null); };
      oTep.oncancel = function () { xong(null); };                              // Chrome 113+ / Safari 16.4+
      if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('focus', laiTieuDiem);
      oTep.click();
    }).then(function (t) { return t ? boc(t) : null; });
  }
  function taiAnh(c) {                                // nút "Tải ảnh căn cước lên" — KHÔNG mở camera
    return sanSang().then(function () { return chonTep(c.oTep, c.baoTien); });
  }
  function camera(v, khung, nutDong, nutChup, bao) {
    return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, advanced: [{ focusMode: 'continuous' }] } }).then(function (stream) {
      v.srcObject = stream; khung.classList.remove('an');
      if (khung.scrollIntoView) try { khung.scrollIntoView({ block: 'center' }); } catch (e) { khung.scrollIntoView(); }
      return v.play().then(function () { return stream; }, function (e) {
        stream.getTracks().forEach(function (t) { t.stop(); }); khung.classList.add('an'); throw e;
      });
    }).then(function (stream) {
      return new Promise(function (ok) {
        var dung = false, dangDocKy = false;
        function tat() { dung = true; stream.getTracks().forEach(function (t) { t.stop(); }); khung.classList.add('an'); nutDong.onclick = null; if (nutChup) nutChup.onclick = null; }
        nutDong.onclick = function () { tat(); ok(null); };
        if (nutChup) nutChup.onclick = function () {         // "Chụp lấy về đọc kỹ": lấy khung hình đang thấy, chạy đường KỸ
          if (dangDocKy) return; dangDocKy = true;
          var anh; try { anh = vungAnh(v, VUNG[0], 1); } catch (e) { dangDocKy = false; return; }
          docKy(anh, function (a, b) { if (bao) bao('Đang đọc kỹ ảnh vừa chụp… ' + a + '/' + b); })
            .then(function (t) {
              var r = t && boc(t); dangDocKy = false;
              if (r) { tat(); ok(r); } else if (bao) bao('Ảnh vừa chụp chưa ra mã. Đưa thẻ gần hơn cho mã QR chiếm khoảng 1/3 khung rồi chụp lại.');
            }, function () { dangDocKy = false; });
        };
        (function vong() {
          if (dung) return;
          if (dangDocKy) { setTimeout(vong, 400); return; }
          docAnh(v).then(function (t) { var r = t && boc(t); if (r) { tat(); ok(r); } else setTimeout(vong, 250); }, function () { setTimeout(vong, 250); });
        })();
      });
    });
  }
  function coCamera() {                               // camera chỉ chạy trên https (bản điện thoại), KHÔNG chạy từ file:// (laptop)
    return typeof navigator !== 'undefined' && !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia
      && typeof location !== 'undefined' && location.protocol === 'https:';
  }
  function chon(c) {
    return sanSang().then(function () {
      return coCamera() ? camera(c.video, c.khung, c.nutDong, c.nutChup, c.bao).catch(function () { return chonTep(c.oTep, c.baoTien); }) : chonTep(c.oTep, c.baoTien);
    });
  }
  return { boc: boc, docAnh: docAnh, docKy: docKy, docNhieuTep: docNhieuTep, taiAnh: taiAnh, chon: chon, coCamera: coCamera, sanSang: sanSang, vungAnh: vungAnh, VUNG: VUNG };
});
