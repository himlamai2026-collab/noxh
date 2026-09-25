/* Đọc QR căn cước gắn chip bằng zxing-wasm. Trình duyệt: ZXingWASM (thu-vien/zxing-reader.js) + wasm base64 (thu-vien/zxing-wasm-b64.js).
   Node (test): import('zxing-wasm/reader') từ thư mục npm tạm. Chuỗi QR: so|cmndCu|hoTen|ddmmyyyy|gioiTinh|thuongTru|ddmmyyyy (đã xác nhận thẻ thật 25/09/2026). */
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
  function docMot(img) {
    return zx.readBarcodes(img, { formats: ['QRCode'], tryHarder: true, maxNumberOfSymbols: 1 }).then(function (kq) { return kq && kq.length ? kq[0].text : null; });
  }
  function docAnh(nguon) {
    return sanSang().then(function () {
      var tiLe = [1, 2, 3], i = 0;
      function thu() { if (i >= tiLe.length) return null; var img = anhTho(nguon, tiLe[i++]); return docMot(img).then(function (t) { return t || thu(); }); }
      return thu();
    });
  }
  function docTep(tep) {
    return new Promise(function (ok, hong) {
      var url = URL.createObjectURL(tep), im = new Image();
      im.onload = function () { URL.revokeObjectURL(url); ok(im); }; im.onerror = function () { hong(new Error('không mở được ảnh')); }; im.src = url;
    }).then(docAnh);
  }
  function chonTep(oTep) {
    return new Promise(function (ok) {
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
      oTep.onchange = function () { xong(oTep.files[0] ? docTep(oTep.files[0]) : null); };
      oTep.oncancel = function () { xong(null); };                              // Chrome 113+ / Safari 16.4+
      if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('focus', laiTieuDiem);
      oTep.click();
    }).then(function (t) { return t ? boc(t) : null; });
  }
  function camera(v, khung, nutDong) {
    return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } } }).then(function (stream) {
      v.srcObject = stream; khung.classList.remove('an');
      return v.play().then(function () { return stream; }, function (e) {
        stream.getTracks().forEach(function (t) { t.stop(); }); khung.classList.add('an'); throw e;
      });
    }).then(function (stream) {
      return new Promise(function (ok) {
        var dung = false;
        function tat() { dung = true; stream.getTracks().forEach(function (t) { t.stop(); }); khung.classList.add('an'); nutDong.onclick = null; }
        nutDong.onclick = function () { tat(); ok(null); };
        (function vong() {
          if (dung) return;
          docAnh(v).then(function (t) { var r = t && boc(t); if (r) { tat(); ok(r); } else setTimeout(vong, 250); }, function () { setTimeout(vong, 250); });
        })();
      });
    });
  }
  function chon(c) {
    var coCam = typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && location.protocol === 'https:';
    return sanSang().then(function () { return coCam ? camera(c.video, c.khung, c.nutDong).catch(function () { return chonTep(c.oTep); }) : chonTep(c.oTep); });
  }
  return { boc: boc, docAnh: docAnh, chon: chon, sanSang: sanSang };
});
