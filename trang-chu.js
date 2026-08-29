/* ═══════════════════════════════════════════════════════════════
   TRANG CHỦ — mục lục dự án + bài viết mới.

   🔴 KHÔNG viết số liệu vào file này, cũng không viết vào index.html.
      Mọi thứ đọc từ du-lieu.js. Lý do: trạng thái đợt hồ sơ
      ('dang-mo' / 'chua-mo') SẼ đổi theo thời gian. Chép tay ra HTML là
      có ngày trang chủ nói "chưa mở đợt" trong khi công cụ nói ngược lại,
      ngay trước mặt khách, mà không có gì báo lỗi.

   Nạp theo đúng thứ tự:
     <script src="du-lieu.js"></script>
     <script src="trang-chu.js"></script>
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var Q = new URLSearchParams(location.search);

  /* Link cũ dạng /?da=pho-hien vẫn tới đúng nơi, giữ nguyên mã kênh. */
  var daCu = Q.get('da');
  if (daCu && Object.prototype.hasOwnProperty.call(DU_AN, daCu)) {
    Q.delete('da');
    var con = Q.toString();
    location.replace('/' + daCu + '/' + (con ? '?' + con : ''));
    return;
  }

  /* Mã kênh phải đi theo khách sang trang dự án — không thì qua trang chủ
     một nhịp là mất dấu khách đến từ Facebook hay TikTok hay tờ rơi. */
  function duoi() {
    var p = new URLSearchParams();
    ['nv', 'n'].forEach(function (k) {
      var v = Q.get(k);
      if (v) p.set(k, v);
    });
    var s = p.toString();
    return s ? '?' + s : '';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var TRANG_THAI = {
    'dang-mo': { cham: '●', chu: 'Đang có đợt tiếp nhận hồ sơ', lop: 'tt-mo' },
    'chua-mo': { cham: '○', chu: 'Chưa mở đợt tiếp nhận hồ sơ', lop: 'tt-cho' }
  };

  /* ── Thẻ dự án ─────────────────────────────────────────────── */
  function veDuAn() {
    var o = document.getElementById('dsDuAn');
    if (o == null || typeof DU_AN === 'undefined') return;

    /* Chưa điền heSo = chưa tra xong quyết định hệ số của tỉnh đó.
       Dự án như vậy KHÔNG được lên trang chủ: thà thiếu một thẻ còn hơn
       đẩy khách vào một trang tính sai trần thu nhập. */
    var ma = Object.keys(DU_AN).filter(function (k) { return !!DU_AN[k].heSo; });
    if (!ma.length) return;               // giữ nguyên bản tĩnh trong HTML

    var q = duoi();
    o.innerHTML = ma.map(function (k) {
      var d = DU_AN[k];
      var t = TRANG_THAI[d.giaiDoan] || TRANG_THAI['chua-mo'];

      /* Chỉ lấy vế đầu của chuỗi giá cho vừa thẻ; vế sau để dành cho trang công cụ */
      var gia = d.gia
        ? 'Giá tạm tính ' + esc(d.gia.split(' · ')[0]) +
          (d.giaNguon ? ' <span class="ng">— ' + esc(d.giaNguon) + '</span>' : '')
        : 'Chưa công bố giá bán';

      return '<a class="da" href="/' + encodeURIComponent(k) + '/' + q + '">' +
        '<span class="tt ' + t.lop + '">' + t.cham + ' ' + t.chu + '</span>' +
        '<b>' + esc(d.ten) + '</b>' +
        '<span class="noi">' + esc(d.diaChi) + '</span>' +
        '<span class="gia">' + gia + '</span>' +
        (d.dotNguon ? '<span class="ng">' + esc(d.dotNguon) + '</span>' : '') +
        '<span class="di">Tự kiểm tra điều kiện →</span>' +
        '</a>';
    }).join('');
  }

  /* ── Ba bài viết mới nhất ──────────────────────────────────── */
  function veBaiViet() {
    var o = document.getElementById('dsBai');
    if (o == null || typeof BAI_VIET === 'undefined') return;

    o.innerHTML = BAI_VIET.slice(0, 3).map(function (b) {
      return '<a class="bv" href="' + esc(b.url) + '">' +
        '<b>' + esc(b.tieuDe) + '</b>' +
        '<span>' + esc(b.tomTat) + '</span>' +
        '</a>';
    }).join('');
  }

  /* ── Nút gọi / Zalo ────────────────────────────────────────── */
  function veLienHe() {
    var o = document.getElementById('lienHe');
    if (o == null || typeof NGUOI_BAN === 'undefined') return;

    var maNV = Q.get('nv') || (window.TRANG && window.TRANG.nguoiBan) || 'nam';
    var nv = NGUOI_BAN[maNV] || NGUOI_BAN['nam'];
    if (!nv) return;

    var h = '';
    if (nv.zalo) h += '<a href="' + esc(nv.zalo) + '" target="_blank" rel="noopener">Nhắn Zalo hỏi trực tiếp</a>';
    /* Cố ý KHÔNG in số ra chữ — trùng cách công cụ tự kiểm tra vẫn làm.
       Bấm vẫn gọi được vì số nằm trong href tel:. */
    if (nv.sdt) h += '<a href="tel:' + esc(nv.sdt) + '">Gọi tư vấn viên</a>';
    o.innerHTML = h;

    var ten = document.getElementById('tenNV');
    if (ten) ten.textContent = nv.ten;
  }

  veDuAn();
  veBaiViet();
  veLienHe();
})();
