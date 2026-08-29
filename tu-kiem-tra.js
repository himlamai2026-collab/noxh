/* ═══════════════════════════════════════════════════════════════
   PHẦN CHẠY CỦA CÔNG CỤ TỰ KIỂM TRA — bình thường không cần sửa.

   ⚠️ Trang HTML phải nạp theo ĐÚNG thứ tự này, thiếu bước nào là trắng trang:
        <script>window.TRANG = { duAn:'…', nguoiBan:'nam' };</script>
        <script src="du-lieu.js"></script>     ← số liệu
        <script src="tu-kiem-tra.js"></script> ← file này
   ═══════════════════════════════════════════════════════════════ */

/* Mỗi trang HTML tự khai dự án mặc định của mình bằng window.TRANG trước khi
   nạp file này. Không khai thì rơi về Tràng Cát. */
/* Mỗi trang HTML tự khai dự án mặc định của mình bằng window.TRANG trước khi
   nạp file này. Không khai thì rơi về Tràng Cát. */
const MAC_DINH = window.TRANG || { duAn:'trang-cat', nguoiBan:'nam' };

/* ═══════════════════════════════════════════════════════════════
   Từ đây trở xuống là phần chạy — bình thường không cần sửa
   ═══════════════════════════════════════════════════════════════ */

const Q  = new URLSearchParams(location.search);
/* Gõ ?da=<mã lạ> thì trang tự khoá lại, KHÔNG âm thầm rơi về dự án khác.
   Đây là lỗi có thật: tới 28/08/2026 trang thật vẫn chưa có khối Phố Hiến, nên
   link ?da=pho-hien rơi thẳng về Tràng Cát và tính trần thu nhập cho khách Hưng
   Yên bằng hệ số 1,16 của Hải Phòng — không một dòng cảnh báo nào. */
const maDA   = Q.get('da');
const DA_TIM = maDA ? DU_AN[maDA] : DU_AN[MAC_DINH.duAn];
const LOI_DA = DA_TIM ? null : maDA;
const DA = DA_TIM || DU_AN[MAC_DINH.duAn];   // chỉ để mã dưới không vỡ; trang đã khoá
const NV = NGUOI_BAN[Q.get('nv')]    || NGUOI_BAN[MAC_DINH.nguoiBan];
const KENH = Q.get('n') || 'truc-tiep';

/* Trần thu nhập của địa bàn = trần nền × hệ số tỉnh */
const TRAN = (() => {
  const t = {}, h = DA.heSo;
  for(const k in CHINH_SACH.tranNen) t[k] = Math.round(CHINH_SACH.tranNen[k]*h*10)/10;
  return t;
})();

const VAY = {
  tyLeToiDa : CHINH_SACH.vay.tyLeToiDa,
  namToiDa  : CHINH_SACH.vay.namToiDa,
  laiNHCSXH : CHINH_SACH.vay.laiSuat,
  laiDuAn   : DA.laiDuAn
};

/* Dự án đã có đợt tiếp nhận hồ sơ hay chưa — quyết định lời khuyên về giấy tờ.
   Đang mở đợt: giục làm cho kịp. Chưa mở: chuẩn bị trước, đừng xin giấy sớm quá. */
const DANG_MO = DA.giaiDoan !== 'chua-mo';

const S = {};              // câu trả lời
let step = 0;
const app = document.getElementById('app');
const bar = document.getElementById('bar');

const fmt = n => n.toLocaleString('vi-VN',{maximumFractionDigits:1});

/* ── Định nghĩa các bước ─────────────────────────────────────── */
const STEPS = [
{
  key:'doiTuong', type:'choice',
  q:'Anh/chị thuộc nhóm nào sau đây?',
  hint:'Nhà ở xã hội chỉ bán cho các nhóm được luật chỉ định. Chọn nhóm gần nhất.',
  opts:[
    {v:'kcn',   t:'Công nhân, người lao động trong khu công nghiệp'},
    {v:'thap',  t:'Người thu nhập thấp tại khu vực đô thị'},
    {v:'canbo', t:'Cán bộ, công chức, viên chức'},
    {v:'llvt',  t:'Lực lượng vũ trang (quân đội, công an)', s:'Nhóm này có mức thu nhập riêng — cần hỏi trực tiếp'},
    {v:'ngheo', t:'Hộ nghèo, hộ cận nghèo'},
    {v:'khac',  t:'Không thuộc nhóm nào ở trên', s:'Luật có 12 nhóm — vẫn nên hỏi lại cho chắc'}
  ]
},
{
  key:'nhaO', type:'choice',
  q:`Anh/chị hoặc vợ/chồng có đang đứng tên nhà ở nào <u>tại ${DA.tinh}</u> không?`,
  hint:DA.luuYNhaO || `Điều kiện nhà ở xét trong phạm vi ${DA.tinh} — nơi có dự án.`,
  opts:[
    {v:'khong', t:'Không có nhà nào đứng tên'},
    {v:'khac',  t:'Có nhà, nhưng ở tỉnh/thành phố khác', s:'Nhà ở quê tỉnh khác — không ảnh hưởng tới điều kiện'},
    {v:'hp15d', t:`Có nhà tại ${DA.tinhNgan}, bình quân dưới ${CHINH_SACH.m2BinhQuan} m²/người`},
    {v:'hp15t', t:`Có nhà tại ${DA.tinhNgan}, bình quân từ ${CHINH_SACH.m2BinhQuan} m²/người trở lên`}
  ]
},
{
  key:'honNhan', type:'choice',
  q:'Tình trạng hôn nhân của anh/chị?',
  hint:'Mỗi trường hợp có một mức trần thu nhập khác nhau.',
  opts:[
    {v:'docthan', t:'Độc thân',                        s:`Trần thu nhập ${fmt(TRAN.docthan)} triệu/tháng`},
    {v:'nuoicon', t:'Độc thân, đang nuôi con chưa thành niên', s:`Trần thu nhập ${fmt(TRAN.nuoicon)} triệu/tháng`},
    {v:'kethon',  t:'Đã kết hôn',                      s:`Trần ${fmt(TRAN.kethon)} triệu/tháng — tính tổng cả hai vợ chồng`}
  ]
},
{
  key:'thuNhap', type:'number',
  q:'Thu nhập thực nhận bình quân mỗi tháng là bao nhiêu?',
  hint:'Là số tiền thực tế nhận về sau khi trừ bảo hiểm và thuế. Nếu đã kết hôn thì cộng tổng thu nhập hai vợ chồng.',
  unit:'triệu đồng/tháng', min:0, max:500
},
{
  key:'daHuong', type:'choice',
  q:'Anh/chị đã từng được hưởng chính sách hỗ trợ về nhà ở chưa?',
  hint:'Gồm: đã mua/thuê mua nhà ở xã hội, được hỗ trợ nhà ở từ ngân sách nhà nước, được tặng nhà tình nghĩa/tình thương.',
  opts:[
    {v:'chua', t:'Chưa từng'},
    {v:'roi',  t:'Đã từng được hưởng'}
  ]
},
{
  key:'giay', type:'choice',
  q:'Anh/chị đã có Giấy xác nhận về điều kiện nhà ở chưa?',
  hint:'Là giấy do cơ quan có thẩm quyền cấp, xác nhận anh/chị chưa có nhà. Giấy này có giá trị 06 tháng.',
  opts:[
    {v:'moi',  t:'Đã có, cấp trong vòng 6 tháng trở lại', s:'Rất tốt — hồ sơ có thể nộp được ngay'},
    {v:'cu',   t:'Đã có nhưng cấp lâu hơn 6 tháng',       s:'Cần xin lại giấy mới'},
    {v:'chua', t:'Chưa có / chưa biết giấy này'}
  ]
},
{
  key:'gia', type:'money',
  q:'Ước tính khoản trả góp mỗi tháng',
  hint:'Bước này không ảnh hưởng tới điều kiện — chỉ để anh/chị biết trước con số phải trả hàng tháng. Có thể bỏ qua.'
}
]
/* Dự án chưa công bố giá thì bỏ hẳn bước này. Hỏi "giá căn hộ đang quan tâm"
   khi chưa có bảng giá nào là đẩy khách vào chỗ tự bịa ra một con số. */
.filter(b => b.key !== 'gia' || !!DA.gia);

/* ── Lời mời gọi/nhắn, hiện ở MỌI câu hỏi ────────────────────
   Khách bí ở câu nào là gọi được ngay tại câu đó, không phải trả lời hết
   6 câu mới thấy số. Sửa lời mời thì sửa ở đây — mỗi câu một dòng.      */
const LOI_HOI = {
  doiTuong:'Không chắc mình thuộc nhóm nào?',
  nhaO    :'Nhà đứng tên bố mẹ, nhà chung sổ, đang ở trọ… khó chọn?',
  honNhan :'Trường hợp của anh/chị hơi khác?',
  thuNhap :'Lương có thưởng, có tăng ca — tính thế nào cho đúng?',
  daHuong :'Không nhớ đã từng được hỗ trợ nhà ở hay chưa?',
  giay    :'Chưa rõ giấy này xin ở đâu?',
  gia     :'Muốn biết giá đợt này và mức vay thực tế?'
};

function khoiHoiNgay(key){
  if(!NV.sdt && !NV.zalo) return '';
  const loi = LOI_HOI[key] || 'Chưa rõ chọn mục nào?';
  return `<div class="hoingay">
      <span><b>${loi}</b> Hỏi trực tiếp cho chắc.</span>
      <span class="lk">
        ${NV.sdt ?`<a href="tel:${NV.sdt}">Gọi tư vấn</a>`:''}
        ${NV.zalo?`<a href="${NV.zalo}" target="_blank" rel="noopener">Nhắn Zalo</a>`:''}
      </span>
    </div>`;
}

/* ── Vẽ giao diện ────────────────────────────────────────────── */
function render(){
  bar.style.width = Math.round(step/STEPS.length*100)+'%';
  window.scrollTo({top:0,behavior:'smooth'});

  if(step >= STEPS.length){ return renderKetQua(); }

  const st = STEPS[step];
  let body = '';

  if(st.type==='choice'){
    body = st.opts.map(o=>
      `<button class="opt${S[st.key]===o.v?' sel':''}" data-v="${o.v}">${o.t}${o.s?`<small>${o.s}</small>`:''}</button>`
    ).join('');
  }
  else if(st.type==='number'){
    body = `<label class="fl">Thu nhập</label>
      <div class="unit">
        <input type="number" id="inp" inputmode="decimal" placeholder="ví dụ: 18" step="0.1"
               min="${st.min}" max="${st.max}" value="${S[st.key]??''}">
        <span>${st.unit}</span>
      </div>`;
  }
  else if(st.type==='money'){
    body = `<label class="fl">Giá căn hộ đang quan tâm</label>
      <div class="unit">
        <input type="number" id="gia" inputmode="decimal" placeholder="ví dụ: 650" step="1" value="${S.gia??''}">
        <span>triệu đồng</span>
      </div>
      <label class="fl" style="margin-top:14px">Số tiền đã chuẩn bị được</label>
      <div class="unit">
        <input type="number" id="von" inputmode="decimal" placeholder="ví dụ: 150" step="1" value="${S.von??''}">
        <span>triệu đồng</span>
      </div>
      <div class="note">Giá bán chính thức do chủ đầu tư công bố theo từng đợt. Anh/chị cứ điền mức đang cân nhắc,
      máy sẽ tính khoản vay và tiền trả hàng tháng tương ứng.</div>`;
  }

  app.innerHTML = `
    <div class="stepno">Câu ${step+1} / ${STEPS.length}</div>
    <div class="card">
      <h2>${st.q}</h2>
      <p class="hint">${st.hint}</p>
      ${body}
      <div class="nav">
        ${step>0?'<button class="back" id="back">Quay lại</button>':''}
        ${st.type!=='choice'?`<button class="go" id="next">${st.type==='money'?'Xem kết quả':'Tiếp tục'}</button>`:''}
        ${st.type==='money'?'<button class="back" id="skip">Bỏ qua</button>':''}
      </div>
    </div>
    ${khoiHoiNgay(st.key)}`;

  app.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
    S[STEPS[step].key]=b.dataset.v; step++; render();
  });
  const bk=document.getElementById('back'); if(bk) bk.onclick=()=>{step--;render();};
  const sk=document.getElementById('skip'); if(sk) sk.onclick=()=>{S.gia=null;S.von=null;step++;render();};
  const nx=document.getElementById('next');
  if(nx) nx.onclick=()=>{
    if(STEPS[step].type==='number'){
      const v=parseFloat(document.getElementById('inp').value);
      if(isNaN(v)||v<0){ alert('Anh/chị vui lòng nhập mức thu nhập.'); return; }
      S[STEPS[step].key]=v;
    } else {
      S.gia=parseFloat(document.getElementById('gia').value)||null;
      S.von=parseFloat(document.getElementById('von').value)||null;
    }
    step++; render();
  };
}

/* ── Chấm điều kiện ──────────────────────────────────────────── */
function chamDieuKien(){
  const r=[]; let chan=false, hoi=false;

  // 1. Đối tượng
  if(S.doiTuong==='khac'){
    r.push({i:'⚠️',t:'<b>Nhóm đối tượng:</b> chưa xác định',
      s:'Luật quy định 12 nhóm được mua nhà ở xã hội. Anh/chị nên hỏi trực tiếp để đối chiếu — có thể vẫn thuộc một nhóm nào đó.'});
    hoi=true;
  } else if(S.doiTuong==='llvt'){
    r.push({i:'⚠️',t:'<b>Nhóm đối tượng:</b> lực lượng vũ trang — thuộc diện được mua',
      s:'Nhóm này có mức thu nhập tính riêng, khác mức dân sự. Cần đối chiếu trực tiếp thay vì dùng kết quả ở đây.'});
    hoi=true;
  } else {
    r.push({i:'✅',t:'<b>Nhóm đối tượng:</b> thuộc diện được mua nhà ở xã hội'});
  }

  // 2. Nhà ở
  if(S.nhaO==='hp15t'){
    r.push({i:'🚫',t:'<b>Điều kiện nhà ở:</b> chưa đạt',
      s:`Anh/chị đang có nhà tại ${DA.tinhNgan} với diện tích bình quân từ ${CHINH_SACH.m2BinhQuan} m²/người trở lên. Luật xét phạm vi toàn ${DA.tinh} nơi có dự án, nên trường hợp này chưa đủ điều kiện.`});
    chan=true;
  } else if(S.nhaO==='hp15d'){
    r.push({i:'✅',t:`<b>Điều kiện nhà ở:</b> đạt theo diện dưới ${CHINH_SACH.m2BinhQuan} m²/người`,
      s:'Cần giấy tờ chứng minh diện tích. Đây là điểm hay bị vướng khi thẩm định, nên chuẩn bị kỹ.'});
  } else if(S.nhaO==='khac'){
    r.push({i:'✅',t:'<b>Điều kiện nhà ở:</b> đạt',
      s:`Nhà ở tỉnh/thành phố khác không ảnh hưởng. Luật chỉ xét nhà trong phạm vi ${DA.tinh}.`});
  } else {
    r.push({i:'✅',t:'<b>Điều kiện nhà ở:</b> đạt'});
  }

  // 3. Thu nhập
  const tran = TRAN[S.honNhan];
  const nhan = {docthan:'độc thân',nuoicon:'độc thân đang nuôi con chưa thành niên',kethon:'đã kết hôn (tính tổng hai người)'}[S.honNhan];
  if(S.thuNhap > tran){
    r.push({i:'🚫',t:`<b>Điều kiện thu nhập:</b> vượt trần`,
      s:`Trường hợp ${nhan} có trần ${fmt(tran)} triệu/tháng tại ${DA.tinhNgan}. Anh/chị khai ${fmt(S.thuNhap)} triệu, vượt ${fmt(S.thuNhap-tran)} triệu.`});
    chan=true;
  } else {
    r.push({i:'✅',t:'<b>Điều kiện thu nhập:</b> đạt',
      s:`Trần cho trường hợp ${nhan} tại ${DA.tinhNgan} là ${fmt(tran)} triệu/tháng. Anh/chị còn cách trần ${fmt(tran-S.thuNhap)} triệu.`});
  }

  // 4. Đã hưởng chính sách
  if(S.daHuong==='roi'){
    r.push({i:'🚫',t:'<b>Chính sách hỗ trợ nhà ở:</b> đã hưởng',
      s:'Mỗi người chỉ được hưởng chính sách hỗ trợ về nhà ở một lần.'});
    chan=true;
  } else {
    r.push({i:'✅',t:'<b>Chính sách hỗ trợ nhà ở:</b> chưa từng hưởng'});
  }

  // 5. Giấy tờ
  if(S.giay==='moi'){
    r.push({i:'⭐',t:'<b>Giấy xác nhận điều kiện nhà ở:</b> đã có, còn hạn',
      s:DANG_MO
          ? 'Đây là lợi thế lớn. Giấy có giá trị 06 tháng, hồ sơ của anh/chị có thể nộp được ngay trong đợt này.'
          : 'Giấy có giá trị 06 tháng. Dự án này chưa mở đợt nhận hồ sơ, nên anh/chị nhớ canh ngày hết hạn — tới đợt mà giấy đã quá 06 tháng thì phải xin lại.'});
  } else if(S.giay==='cu'){
    r.push({i:'⚠️',t:'<b>Giấy xác nhận điều kiện nhà ở:</b> đã quá 6 tháng',
      s:'Cần xin lại giấy mới. Thủ tục nhanh hơn lần đầu vì anh/chị đã biết đường đi.'});
  } else {
    r.push({i:'⚠️',t:'<b>Giấy xác nhận điều kiện nhà ở:</b> chưa có',
      s:DANG_MO
          ? 'Đây là giấy tờ mất thời gian nhất trong bộ hồ sơ. Nên bắt đầu xin sớm, đừng đợi đến sát hạn nộp.'
          : 'Đây là giấy tờ mất thời gian nhất trong bộ hồ sơ. Nhưng dự án này chưa mở đợt nhận hồ sơ, xin bây giờ là giấy hết hạn trước ngày nộp. Việc nên làm lúc này là hỏi trước xin ở đâu, cần những gì.'});
  }

  return {r, ket: chan ? 'bad' : (hoi ? 'warn' : 'ok')};
}

/* ── Tính trả góp (phương pháp trả đều hàng tháng) ───────────── */
function tinhTraGop(gia, von){
  const vayToiDa = gia * VAY.tyLeToiDa;
  const canVay   = Math.max(0, gia - (von||0));
  const vay      = Math.min(canVay, vayToiDa);
  const n        = VAY.namToiDa*12;
  const tra = lai => { const r=lai/100/12; return vay*r/(1-Math.pow(1+r,-n)); };
  return {
    vay, thieuVon: canVay > vayToiDa ? canVay - vayToiDa : 0,
    m1: tra(VAY.laiNHCSXH), m2: VAY.laiDuAn ? tra(VAY.laiDuAn) : null,
    dotDau: gia*0.30
  };
}

/* ── Màn hình kết quả ────────────────────────────────────────── */
function renderKetQua(){
  bar.style.width='100%';
  const {r,ket} = chamDieuKien();

  const tieude = {
    ok  :{c:'v-ok',  h:'✅ Anh/chị đủ điều kiện nộp hồ sơ',
          p:'Theo các thông tin vừa khai, anh/chị đáp ứng cả bốn điều kiện bắt buộc. Việc còn lại là chuẩn bị giấy tờ.'},
    warn:{c:'v-warn',h:'⚠️ Gần đủ — còn một điểm cần đối chiếu',
          p:'Các điều kiện chính đều đạt, nhưng có mục cần hỏi trực tiếp mới kết luận được. Đừng tự loại mình.'},
    bad :{c:'v-bad', h:'🚫 Theo thông tin này thì chưa đủ điều kiện',
          p:'Có ít nhất một điều kiện bắt buộc chưa đạt. Bên dưới ghi rõ vướng ở đâu.'}
  }[ket];

  let html = `<div class="verdict ${tieude.c}"><h2>${tieude.h}</h2><p>${tieude.p}</p></div>
    <div class="card"><ul class="checks">` +
    r.map(x=>`<li><span class="ic">${x.i}</span><span>${x.t}${x.s?`<span class="sub">${x.s}</span>`:''}</span></li>`).join('') +
    `</ul></div>`;

  /* Trả góp */
  if(S.gia){
    const t = tinhTraGop(S.gia, S.von);
    html += `<h3 class="sec">Khoản phải trả hàng tháng</h3><div class="card"><div class="money"><table>
      <tr><td>Giá căn hộ</td><td>${fmt(S.gia)} triệu</td></tr>
      <tr><td>Vốn đã chuẩn bị</td><td>${fmt(S.von||0)} triệu</td></tr>
      <tr><td>Số tiền cần vay</td><td>${fmt(t.vay)} triệu</td></tr>
      <tr><td>Trả góp ${VAY.namToiDa} năm, lãi ${fmt(VAY.laiNHCSXH)}%/năm<span class="sub">Ngân hàng Chính sách xã hội</span></td><td class="big">${fmt(t.m1)} tr/tháng</td></tr>
      ${t.m2!=null?`<tr><td>Trả góp ${VAY.namToiDa} năm, lãi ${fmt(VAY.laiDuAn)}%/năm<span class="sub">Gói ngân hàng liên kết dự án</span></td><td class="big">${fmt(t.m2)} tr/tháng</td></tr>`:''}
      </table></div>
      ${t.thieuVon>0?`<div class="note">⚠️ Ngân hàng chính sách cho vay tối đa ${Math.round(VAY.tyLeToiDa*100)}% giá trị căn hộ.
        Với mức giá này, anh/chị cần chuẩn bị thêm khoảng <b>${fmt(t.thieuVon)} triệu</b> vốn tự có.</div>`:''}
      <div class="note">Đợt đóng tiền đầu tiên theo quy định không quá 30% giá trị hợp đồng —
        khoảng <b>${fmt(t.dotDau)} triệu</b> với mức giá trên.<br><br>
        ⚠️ <b>Đây là số ước tính</b>, tính theo cách trả đều hàng tháng. Ngân hàng có thể áp dụng cách tính dư nợ giảm dần,
        khi đó những năm đầu phải trả cao hơn con số này. Lãi suất ưu đãi cũng được điều chỉnh theo từng thời kỳ.
        Con số chính thức phải lấy từ bảng tính của ngân hàng.</div>
      </div>`;
  }

  /* Thông tin dự án */
  if(ket!=='bad' && (DA.gia || DA.thanhToan || DA.vanPhong)){
    html += `<h3 class="sec">Thông tin dự án ${DA.ten}</h3><div class="card">
      ${DA.gia?`<div class="note"><b>Giá bán:</b> ${DA.gia}<br><span class="sub">Nguồn: ${DA.giaNguon}</span></div>`:''}
      ${DA.thanhToan?`<div class="note"><b>Tiến độ đóng tiền:</b> ${DA.thanhToan}<br><span class="sub">Nguồn: ${DA.ttNguon}</span></div>`:''}
      ${DA.vanPhong?`<div class="note"><b>Văn phòng bán hàng:</b> ${DA.vanPhong}</div>`:''}
      <div class="note">⚠️ Giá và tiến độ thanh toán do chủ đầu tư công bố theo từng đợt và có thể đã thay đổi.
        Trước khi ký bất cứ giấy tờ nào, đề nghị đối chiếu với bảng giá bản cứng tại văn phòng bán hàng.</div>
      </div>`;
  }

  /* Việc cần làm */
  if(ket!=='bad'){
    html += `<h3 class="sec">Giấy tờ cần chuẩn bị</h3><div class="card"><ul class="checks">
      <li><span class="ic">1</span><span><b>Đơn đăng ký mua nhà ở xã hội</b><span class="sub">Theo mẫu của chủ đầu tư</span></span></li>
      <li><span class="ic">2</span><span><b>Giấy tờ tuỳ thân</b><span class="sub">Căn cước công dân, giấy đăng ký kết hôn hoặc giấy xác nhận độc thân</span></span></li>
      <li><span class="ic">3</span><span><b>Giấy xác nhận về điều kiện nhà ở</b><span class="sub">Giấy này có giá trị 06 tháng${S.giay==='moi'?' — anh/chị đã có, còn hạn':''}</span></span></li>
      <li><span class="ic">4</span><span><b>Giấy xác nhận về thu nhập</b><span class="sub">Công an cấp xã xác nhận theo quy định mới. Cơ chế hiện nay là kê khai, cam kết và hậu kiểm</span></span></li>
      <li><span class="ic">5</span><span><b>Giấy tờ chứng minh thuộc nhóm đối tượng</b><span class="sub">Hợp đồng lao động, quyết định tuyển dụng, giấy xác nhận hộ nghèo… tuỳ nhóm</span></span></li>
      </ul>
      <div class="note"><b>Ba điều nên biết trước khi bắt tay làm:</b><br>
      ${DANG_MO
        ? '· Giấy xác nhận điều kiện nhà ở <b>có giá trị 06 tháng</b> — làm sớm không sợ hết hạn, nhưng làm muộn thì không kịp đợt.'
        : '· Giấy xác nhận điều kiện nhà ở <b>chỉ có giá trị 06 tháng</b> — dự án chưa mở đợt nhận hồ sơ, xin bây giờ là tới đợt lại hết hạn. Cứ tìm hiểu trước cho rõ, có lịch đợt rồi hãy đi xin.'}<br>
      · Một bộ hồ sơ <b>dùng được cho nhiều dự án</b>, chỉ không nộp cùng lúc vào hai dự án đang mở bán.<br>
      · Hồ sơ bị <b>hậu kiểm bởi Sở Xây dựng</b>. Khai đúng ngay từ đầu — khai sai bị huỷ kết quả kể cả khi đã trúng.</div>
      </div>`;
  } else {
    html += `<h3 class="sec">Còn cửa nào không?</h3><div class="card">`;
    if(S.nhaO==='hp15t'){
      html += `<div class="note">Trường hợp đang có nhà, <b>Nghị quyết 201/2025/QH15</b> có mở thêm một hướng:
        người đã có nhà thuộc sở hữu của mình nhưng <b>nhà ở cách xa nơi làm việc</b> vẫn có thể được hưởng chính sách.
        ⚠️ Cách bao nhiêu ki-lô-mét thì được tính là "cách xa" thì cần tra văn bản hướng dẫn — đây là câu nên hỏi trực tiếp,
        đừng tự kết luận theo hướng nào.</div>`;
    }
    if(S.thuNhap > TRAN[S.honNhan]){
      html += `<div class="note">Về thu nhập: mức xét là <b>thu nhập thực nhận bình quân</b> trong 12 tháng liên tục,
        không phải thu nhập của tháng cao nhất. Nếu anh/chị vừa tính gộp cả khoản thưởng bất thường thì nên tính lại.
        Ngoài ra trần tại ${DA.tinhNgan} hiện là <b>${fmt(TRAN.docthan)} / ${fmt(TRAN.nuoicon)} / ${fmt(TRAN.kethon)} triệu</b>
        (${DA.heSo===1 ? CHINH_SACH.tranNguon : DA.heSoNguon}) — cao hơn nhiều bài viết cũ còn lưu trên mạng.</div>`;
    }
    if(S.daHuong==='roi'){
      html += `<div class="note">Chính sách hỗ trợ nhà ở chỉ được hưởng một lần. Đây là điều kiện cứng, không có ngoại lệ.
        Nếu anh/chị chưa chắc lần trước có phải là "chính sách hỗ trợ nhà ở" theo đúng nghĩa của luật hay không thì nên hỏi lại.</div>`;
    }
    /* Chỉ có đúng ba đường rơi vào nhánh này: vượt trần thu nhập · đã có nhà ·
       đã hưởng chính sách. Cả ba đều là ràng buộc RIÊNG của nhà ở xã hội —
       người bị loại ở đây phần lớn vẫn mua được nhà, chỉ là không mua theo diện này.
       Trước đây màn hình này chỉ nói "chờ quy định nới", với họ gần như vô nghĩa. */
    html += `<div class="note">Ba điều kiện có thể vướng ở trên — trần thu nhập, đã có nhà,
      đã hưởng chính sách — là ràng buộc <b>riêng của nhà ở xã hội</b>. Nhà ở thương mại
      không xét thu nhập, không xét đã có nhà, cũng không phải bốc thăm. Nếu anh/chị muốn
      nghe về hướng đó, cứ để lại số — em hỏi giúp bên phụ trách rồi báo lại.
      <br>Em phụ trách mảng nhà ở xã hội, nên phần thương mại em nối máy chứ không tự báo giá.</div>`;

    html += `<div class="note">Điều kiện có thể thay đổi, và hoàn cảnh của anh/chị cũng vậy.
      Nếu muốn, để lại số điện thoại — khi có đợt mở bán mới hoặc quy định được nới, bên em sẽ báo lại.</div></div>`;
  }

  /* Ô để lại thông tin */
  html += `<h3 class="sec">${ket==='bad'?'Nhận thông báo khi có đợt mới':'Nhận bản checklist và hướng dẫn'}</h3>
    <div class="card" id="leadbox">
      <p class="hint" style="margin-bottom:14px">
        ${ket==='bad'
          ? 'Không bắt buộc. Để lại số nếu anh/chị muốn được báo khi quy định thay đổi, khi có đợt mở bán mới, hoặc muốn nghe về hướng nhà ở thương mại.'
          : (DANG_MO
              ? 'Để lại số điện thoại để nhận bản checklist giấy tờ, địa chỉ nộp từng loại giấy và lịch các mốc quan trọng của đợt này.'
              : 'Dự án chưa công bố giá và chưa mở đợt nhận hồ sơ. Để lại số điện thoại để nhận bản checklist giấy tờ, và được báo ngay khi có lịch tiếp nhận — người chuẩn bị trước là người kịp đợt đầu.')}
      </p>
      <label class="fl">Họ và tên</label>
      <input type="text" id="ho" placeholder="Nguyễn Văn A">
      <label class="fl" style="margin-top:12px">Số điện thoại</label>
      <input type="tel" id="sdt" inputmode="tel" placeholder="09xxxxxxxx">
      <label class="consent">
        <input type="checkbox" id="dongy">
        <span>Tôi đồng ý để <b>${NV.ten}</b> — nhân viên kinh doanh dự án ${DA.ten}, ${DA.diaChi} —
        liên hệ với tôi qua số điện thoại trên để tư vấn về việc mua ${ket==='bad'?'nhà ở':'nhà ở xã hội'}.
        Thông tin chỉ dùng cho mục đích này, không chuyển cho bên thứ ba, và tôi có thể yêu cầu xoá bất cứ lúc nào
        bằng cách nhắn lại số điện thoại đó.</span>
      </label>
      <button class="go" id="guiLead" disabled>Gửi thông tin</button>
      <div class="note" style="margin-top:12px">
        Các câu trả lời ở trên chỉ được xử lý ngay trên máy của anh/chị. Không có gì được gửi đi
        cho tới khi anh/chị bấm nút này.
      </div>
    </div>
    <div class="nav" style="margin-top:14px;flex-wrap:wrap">
      ${NV.zalo?`<a class="go" style="flex:1 1 45%;text-align:center;text-decoration:none;line-height:1.4;padding:14px" href="${NV.zalo}" target="_blank" rel="noopener">Nhắn Zalo</a>`:''}
      ${NV.sdt?`<a class="go" style="flex:1 1 45%;text-align:center;text-decoration:none;line-height:1.4;padding:14px" href="tel:${NV.sdt}">Gọi tư vấn</a>`:''}
      <button class="back" id="lam-lai" style="flex:1 1 100%">Kiểm tra lại từ đầu</button>
    </div>`;

  app.innerHTML = html;

  const cb=document.getElementById('dongy'), btn=document.getElementById('guiLead');
  const sdt=document.getElementById('sdt');
  const check=()=>{ btn.disabled = !(cb.checked && /^0\d{8,10}$/.test(sdt.value.trim())); };
  cb.onchange=check; sdt.oninput=check;
  btn.onclick=guiLead;
  document.getElementById('lam-lai').onclick=()=>{
    for(const k in S) delete S[k]; step=0; render();
  };
}

/* ── Gửi lead ────────────────────────────────────────────────── */
function tomTat(){
  const nhan={docthan:'Độc thân',nuoicon:'Độc thân nuôi con',kethon:'Đã kết hôn'};
  const nhom={kcn:'Công nhân KCN',thap:'Thu nhập thấp đô thị',canbo:'Cán bộ công chức',llvt:'Lực lượng vũ trang',ngheo:'Hộ nghèo/cận nghèo',khac:'Chưa rõ nhóm'};
  const nha ={khong:'Không có nhà',khac:'Có nhà tỉnh khác',
              hp15d:`Có nhà ${DA.tinhNgan}, dưới ${CHINH_SACH.m2BinhQuan}m²/người`,
              hp15t:`Có nhà ${DA.tinhNgan}, từ ${CHINH_SACH.m2BinhQuan}m²/người trở lên`};
  const gi  ={moi:'Đã có, còn hạn',cu:'Đã có, quá 6 tháng',chua:'Chưa có'};
  const kq  ={ok:'Đủ điều kiện',warn:'Cần đối chiếu thêm',bad:'Chưa đủ điều kiện'};
  const ket = chamDieuKien().ket;
  return [
    `Nhóm: ${nhom[S.doiTuong]}`,
    `Nhà ở: ${nha[S.nhaO]}`,
    `Hôn nhân: ${nhan[S.honNhan]}`,
    `Thu nhập: ${fmt(S.thuNhap)} tr/tháng (trần ${fmt(TRAN[S.honNhan])} tr)`,
    `Đã hưởng chính sách: ${S.daHuong==='roi'?'Rồi':'Chưa'}`,
    `Giấy xác nhận: ${gi[S.giay]}`,
    S.gia?`Giá quan tâm: ${fmt(S.gia)} tr, vốn có: ${fmt(S.von||0)} tr`:null,
    `Kết quả: ${kq[ket]||ket}`
  ].filter(Boolean).join('\n');
}

/* Xếp loại khách để bên bán biết gọi ai trước — ghi thẳng vào bảng lead.
   Không có loại nào bị vứt đi: 🚫 hôm nay có thể là khách của đợt sau. */
function xepLoai(ket){
  if(ket==='bad')  return 'nuoi';          // chưa đủ điều kiện → báo lại khi quy định nới hoặc có đợt mới
  if(ket==='warn') return 'can-doi-chieu'; // cần hỏi thêm một điểm mới kết luận được
  return S.giay==='moi' ? 'nop-ngay' : 'du-dieu-kien';
}

function guiLead(){
  const btn=document.getElementById('guiLead');
  const ket = chamDieuKien().ket;
  const data={
    ten   : document.getElementById('ho').value.trim(),
    sdt   : document.getElementById('sdt').value.trim(),
    duAn  : Q.get('da') || MAC_DINH.duAn,
    nhanVien: Q.get('nv') || MAC_DINH.nguoiBan,
    nguon : KENH,
    ketQua: ket,
    phanLoai: xepLoai(ket),
    traLoi: JSON.stringify(S),
    tomTat: tomTat(),
    thoiDiem: new Date().toISOString()
  };
  btn.disabled=true; btn.textContent='Đang gửi…';

  const xong = ()=>{
    document.getElementById('leadbox').innerHTML =
      `<div class="verdict v-ok" style="margin:0"><h2>✅ Đã ghi nhận</h2>
       <p>Cảm ơn anh/chị. Bên em sẽ liên hệ trong thời gian sớm nhất${NV.sdt?`, hoặc anh/chị nhắn Zalo / gọi trước theo số <b>${NV.sdt}</b>`:''}.</p></div>`;
  };

  if(NOI_NHAN){
    fetch(NOI_NHAN,{method:'POST',mode:'no-cors',
      headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(data)})
      .then(xong).catch(()=>{ btn.disabled=false; btn.textContent='Gửi lại';
        alert('Chưa gửi được. Anh/chị kiểm tra kết nối mạng và thử lại giúp em.'); });
  } else {
    /* Chưa gắn nơi nhận — chỉ mở được Zalo, thông tin CHƯA về tới người bán.
       Không được báo "đã ghi nhận" ở nhánh này: khách phải biết là còn phải bấm gửi,
       không thì họ đóng máy và tưởng xong, còn bên bán thì mất trắng khách. */
    const msg = `Em muốn đăng ký tư vấn NOXH ${DA.ten}.\nTên: ${data.ten}\nSĐT: ${data.sdt}\n${data.tomTat}`;
    let daChep = false;
    if(navigator.clipboard){
      try{ navigator.clipboard.writeText(msg); daChep = true; }catch(e){}
    }
    if(NV.zalo) window.open(NV.zalo,'_blank');
    document.getElementById('leadbox').innerHTML =
      `<div class="verdict v-warn" style="margin:0"><h2>⏳ Còn một bước nữa</h2>
       <p>Cửa sổ Zalo vừa mở${daChep?' và nội dung đã được chép sẵn — anh/chị chỉ cần <b>dán và bấm gửi</b>':' — anh/chị nhắn giúp em nội dung bên dưới'}.
       Chưa bấm gửi bên Zalo thì bên em <b>chưa nhận được</b> thông tin.</p></div>
       <textarea readonly style="width:100%;margin-top:10px;padding:11px 12px;font:inherit;font-size:13.5px;
         border:1.5px solid var(--line);border-radius:10px;background:#fbfcfd;min-height:110px;resize:vertical">${msg}</textarea>
       ${NV.sdt?`<p class="note" style="margin-top:10px">Không dùng Zalo thì anh/chị gọi thẳng số <b>${NV.sdt}</b> cũng được.</p>`:''}`;
  }
}

/* ── Căn cứ pháp lý, tự sinh theo dự án đang chọn ────────────── */
function veCanCu(){
  document.title = `Tự kiểm tra điều kiện mua nhà ở xã hội — ${DA.ten}`;
  document.getElementById('tenDuAn').textContent = `Dự án ${DA.ten} — ${DA.diaChi}`;
  /* Đếm theo STEPS chứ không ghi cứng: dự án chưa có giá thì bớt một bước, ghi cứng
     "6 câu hỏi" là trang nói một đằng còn thanh tiến độ chạy một nẻo. */
  const oSoCau = document.getElementById('soCau');
  if(oSoCau) oSoCau.textContent = `${STEPS.length} câu hỏi`;
  const t = CHINH_SACH.tranNen;
  document.getElementById('canCu').innerHTML = `
    <b>Căn cứ áp dụng</b> (tra ngày ${CHINH_SACH.traNgay}):<br>
    · Trần thu nhập nền ${fmt(t.docthan)} / ${fmt(t.nuoicon)} / ${fmt(t.kethon)} triệu — ${CHINH_SACH.tranNguon}.<br>
    · ${DA.heSo===1
        ? `Trần áp dụng tại ${DA.tinhNgan}: <b>${fmt(TRAN.docthan)} / ${fmt(TRAN.nuoicon)} / ${fmt(TRAN.kethon)} triệu</b> — ${DA.heSoNguon}.`
        : `${DA.tinhNgan} áp hệ số ${DA.heSo.toLocaleString('vi-VN',{maximumFractionDigits:2})} → <b>${fmt(TRAN.docthan)} / ${fmt(TRAN.nuoicon)} / ${fmt(TRAN.kethon)} triệu</b> — ${DA.heSoNguon}.`}<br>
    · Điều kiện nhà ở: ${CHINH_SACH.phamViNhaO}.<br>
    ${DA.luuYNguon?`· ${DA.luuYNguon}.<br>`:''}
    · Vay ưu đãi tối đa ${Math.round(CHINH_SACH.vay.tyLeToiDa*100)}% giá trị căn hộ, thời hạn tới ${CHINH_SACH.vay.namToiDa} năm,
      lãi suất Ngân hàng Chính sách xã hội ${fmt(CHINH_SACH.vay.laiSuat)}%/năm.<br>
    <br>
    <a href="/bai-viet/" style="color:#0b5cab;font-weight:600;text-decoration:none">Đọc giải thích chi tiết ba câu hỏi hay gặp nhất →</a><br>
    <br>
    Chính sách thay đổi thường xuyên — riêng trần thu nhập đã đổi ba lần trong hai năm.
    Nếu anh/chị đọc trang này sau <b>${CHINH_SACH.hetHan.split('-').reverse().join('/')}</b>, đề nghị hỏi lại trước khi làm hồ sơ.`;

  /* Quá hạn rà soát → nói thẳng ngay đầu trang, không giấu xuống chân trang */
  if(new Date().toISOString().slice(0,10) > CHINH_SACH.hetHan){
    const c=document.createElement('div');
    c.style.cssText='background:#fff4e5;border:1px solid #f0b429;color:#7a4a00;margin:14px 0;padding:12px;border-radius:8px;font-size:13px;line-height:1.6';
    c.innerHTML = `⚠️ <b>Số liệu trên trang này lấy ngày ${CHINH_SACH.traNgay} và đã quá hạn rà soát.</b>
      Trần thu nhập và lãi suất có thể đã thay đổi. Kết quả chỉ nên dùng để tham khảo — đề nghị hỏi lại trước khi làm hồ sơ.`;
    app.parentNode.insertBefore(c, app);
  }
}

/* ── Khoá lại nếu dự án chưa được cấu hình đủ ────────────────── */
if(LOI_DA || !DA || !DA.heSo){
  const maXau = String(LOI_DA||'').replace(/[^a-zA-Z0-9-]/g,'').slice(0,40);
  app.innerHTML = `<div class="verdict v-warn">
    <h2>⚠️ ${LOI_DA ? 'Không có dự án này' : 'Dự án chưa được cấu hình'}</h2>
    <p>${LOI_DA
      ? `Địa chỉ đang gọi dự án mã <b>${maXau}</b> — trang không có dự án nào mang mã đó.
         Trang dừng ở đây thay vì tự chuyển sang dự án khác: mỗi tỉnh một mức trần thu nhập,
         trả lời theo tỉnh khác còn tệ hơn không trả lời.`
      : `Thiếu hệ số trần thu nhập của địa phương. Chưa tra được quyết định của tỉnh thì không chạy công cụ —
         đưa ra con số sai còn tệ hơn không đưa gì.`}
      Đề nghị liên hệ người quản trị trang.</p></div>`;
} else {
  veCanCu();
  render();
}
