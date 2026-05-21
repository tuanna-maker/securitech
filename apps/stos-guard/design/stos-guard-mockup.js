/* STOS Guard — 6 screens (requires stos-guard-icons.js) */
(function () {
  var I = window.STOS_ICONS;
  var AVATAR = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop';

  function statusBar() {
    return (
      '<div class="status-bar">' +
      '<span class="sb-time">9:41</span>' +
      '<span class="sb-right">' +
      I.statusSignal +
      I.statusWifi +
      I.statusBatt +
      '</span></div>'
    );
  }

  function buildNav(spec, active) {
    var h = '<nav class="nav" role="tablist">';
    for (var i = 0; i < spec.length; i++) {
      var t = spec[i];
      var on = i === active ? ' on' : '';
      var icon = i === active && t.fill ? t.fill : t.icon;
      var badge = t.badge ? '<span class="nb">' + t.badge + '</span>' : '';
      h +=
        '<button type="button" class="ni' +
        on +
        '" data-nav="' +
        t.go +
        '" aria-label="' +
        t.label +
        '">' +
        '<span class="ni-ic">' +
        icon +
        badge +
        '</span>' +
        t.label +
        '</button>';
    }
    return h + '</nav>';
  }

  var NAV4 = [
    { label: 'Trang chủ', go: 'v-home', icon: I.navHome, fill: I.navHomeFill },
    { label: 'Lịch trực', go: 'v-schedule', icon: I.navCal, fill: I.navCalFill },
    { label: 'Thông báo', go: 'v-incident', icon: I.navBell, fill: I.navBellFill, badge: '2' },
    { label: 'Tài khoản', go: 'v-home', icon: I.navUser, fill: I.navUserFill }
  ];

  var NAV5 = [
    { label: 'Trang chủ', go: 'v-home', icon: I.navHome, fill: I.navHomeFill },
    { label: 'Lịch trực', go: 'v-schedule', icon: I.navCal, fill: I.navCalFill },
    { label: 'Tuần tra', go: 'v-patrol', icon: I.navPatrol, fill: I.navPatrolFill },
    { label: 'Thông báo', go: 'v-incident', icon: I.navBell, fill: I.navBellFill, badge: '2' },
    { label: 'Tài khoản', go: 'v-home', icon: I.navUser, fill: I.navUserFill }
  ];

  function phoneFrame(label, scrHtml, navHtml, id) {
    var aid = id ? ' id="' + id + '"' : '';
    return (
      '<div class="wrap"><div class="phone"' +
      aid +
      '><div class="notch"></div><div class="scr">' +
      scrHtml +
      '</div>' +
      (navHtml || '') +
      '<div class="home-indicator"></div></div><p class="lbl">' +
      label +
      '</p></div>'
    );
  }

  function subHeader(title, subHtml) {
    return (
      '<div class="nav-bar center-title">' +
      '<button type="button" class="back-btn" data-go="v-home" aria-label="Quay lại">' +
      I.back +
      '</button>' +
      '<div><div class="nav-title">' +
      title +
      '</div>' +
      (subHtml || '') +
      '</div></div>'
    );
  }

  function home() {
    return (
      '<div id="v-home" class="view on">' +
      statusBar() +
      '<div class="screen-body">' +
      '<header class="gh">' +
      '<div class="brand"><div class="logo-gold">' +
      I.shieldGold +
      '</div><div><div class="t-bv">BẢO VỆ</div><div class="t-res">STOS RESIDENCE</div></div></div>' +
      '<button type="button" class="bell-btn" aria-label="Thông báo">' +
      I.bell +
      '<span class="badge-dot">3</span></button>' +
      '</header>' +
      '<div class="pcard">' +
      '<img class="av-img" src="' +
      AVATAR +
      '" alt="" width="64" height="64" loading="lazy" />' +
      '<div class="pcard-body">' +
      '<div class="pgreet">Xin chào,</div>' +
      '<div class="pname">Nguyễn Văn Hùng</div>' +
      '<div class="pshift">Ca sáng: 06:00 - 14:00</div>' +
      '<div class="dotr"><span class="dot"></span><span class="dott">Đang làm việc</span></div>' +
      '</div></div>' +
      '<div class="grid">' +
      '<button type="button" class="tile tg" data-go="v-checkin"><span class="ic">' +
      I.doorIn +
      '</span><span class="lb">VÀO CA</span><span class="sb">Check-in</span></button>' +
      '<button type="button" class="tile tr" data-go="v-checkout"><span class="ic">' +
      I.doorOut +
      '</span><span class="lb">KẾT THÚC CA</span><span class="sb">Check-out</span></button>' +
      '<button type="button" class="tile tb" data-go="v-patrol"><span class="ic">' +
      I.shieldPatrol +
      '</span><span class="lb">TUẦN TRA</span><span class="sb">Điểm danh</span></button>' +
      '<button type="button" class="tile to" data-go="v-incident"><span class="ic">' +
      I.warnTri +
      '</span><span class="lb">BÁO SỰ CỐ</span><span class="sb">Gửi báo cáo</span></button>' +
      '</div>' +
      '<button type="button" class="qbtn"><span class="q-ic">' +
      I.users +
      '</span><span class="q-txt"><span class="qt">YÊU CẦU CƯ DÂN</span><span class="qs">Xem &amp; xử lý</span></span></button>' +
      '</div></div>'
    );
  }

  function checkin() {
    return (
      '<div id="v-checkin" class="view">' +
      statusBar() +
      '<div class="screen-body no-nav has-footer-btn">' +
      subHeader('VÀO CA (CHECK-IN)') +
      '<div class="loc-block">' +
      '<div class="map-ring green"><div class="map-inner">' +
      I.pinBlue +
      '</div></div>' +
      '<div class="lok ok">Lấy vị trí thành công</div>' +
      '<div class="addr-title">Sảnh chính - Tòa A</div>' +
      '<div class="addr-sub">35 Lê Văn Lương, Thanh Xuân, Hà Nội</div>' +
      '</div>' +
      '<div class="row-card">' +
      '<span class="rc-ic">' +
      I.clock +
      '</span><div class="rc-body"><div class="rc-label">Thời gian hiện tại</div>' +
      '<div class="rc-time green" id="clk-in">06:02:18</div>' +
      '<div class="rc-date">20/05/2024</div></div></div>' +
      '<div class="row-card inf-card">' +
      '<span class="rc-ic">' +
      I.info +
      '</span><div class="rc-body"><div class="rc-label">Vui lòng đảm bảo bạn đang ở đúng vị trí làm việc</div></div></div>' +
      '</div>' +
      '<div class="footer-cta no-nav"><button type="button" class="btn-cta green">XÁC NHẬN VÀO CA</button></div>' +
      '</div>'
    );
  }

  function checkout() {
    return (
      '<div id="v-checkout" class="view">' +
      statusBar() +
      '<div class="screen-body no-nav has-footer-btn">' +
      subHeader('KẾT THÚC CA (CHECK-OUT)') +
      '<div class="loc-block">' +
      '<div class="map-ring red"><div class="map-inner">' +
      I.pinRed +
      '</div></div>' +
      '<div class="lok err">Lấy vị trí thành công</div>' +
      '<div class="addr-title">Sảnh chính - Tòa A</div>' +
      '<div class="addr-sub">35 Lê Văn Lương, Thanh Xuân, Hà Nội</div>' +
      '</div>' +
      '<div class="row-card">' +
      '<span class="rc-ic">' +
      I.clock +
      '</span><div class="rc-body"><div class="rc-label">Thời gian hiện tại</div>' +
      '<div class="rc-time red">13:59:47</div>' +
      '<div class="rc-date">20/05/2024</div></div></div>' +
      '<div class="chk-card">' +
      '<div class="chk-title">Xác nhận kết thúc ca</div>' +
      '<div class="chk-item">' +
      I.checkSq +
      ' Không có sự cố tồn đọng</div>' +
      '<div class="chk-item">' +
      I.checkSq +
      ' Đã bàn giao chìa khóa/bộ đàm</div>' +
      '<div class="chk-item">' +
      I.checkSq +
      ' Đã hoàn thành tuần tra</div>' +
      '<div class="chk-item">' +
      I.checkSq +
      ' Không có yêu cầu đang chờ xử lý</div>' +
      '</div></div>' +
      '<div class="footer-cta no-nav"><button type="button" class="btn-cta red">XÁC NHẬN KẾT THÚC CA</button></div>' +
      '</div>'
    );
  }

  function schedule() {
    var rows =
      '<div class="shift-card today">' +
      '<div class="shift-date"><div class="day">Thứ 2</div><div class="date">20/05</div></div>' +
      '<div class="shift-meta"><div class="shift-time morning">Ca sáng: 06:00 - 14:00</div><div class="loc">Sảnh chính - Tòa A</div><div class="handover">Người bàn giao: Trần Văn Nam</div></div>' +
      '<span class="badge-pill today">Hôm nay</span></div>' +
      '<div class="shift-card off"><div class="off-txt">NGHỈ</div></div>' +
      '<div class="shift-card"><div class="shift-date"><div class="day">Thứ 4</div><div class="date">22/05</div></div>' +
      '<div class="shift-meta"><div class="shift-time night">Ca đêm: 22:00 - 06:00</div><div class="loc">Sảnh chính - Tòa A</div><div class="handover">Người bàn giao: Lê Hoàng</div></div>' +
      '<span class="badge-pill upcoming">Sắp tới</span></div>' +
      '<div class="shift-card"><div class="shift-date"><div class="day">Thứ 5</div><div class="date">23/05</div></div>' +
      '<div class="shift-meta"><div class="shift-time morning">Ca sáng: 06:00 - 14:00</div><div class="loc">Sảnh chính - Tòa A</div><div class="handover">Người bàn giao: Trần Văn Nam</div></div>' +
      '<span class="badge-pill upcoming">Sắp tới</span></div>' +
      '<div class="shift-card off"><div class="off-txt">NGHỈ</div></div>';

    return (
      '<div id="v-schedule" class="view">' +
      statusBar() +
      '<div class="screen-body">' +
      subHeader('LỊCH TRỰC') +
      '<div class="date-strip"><button type="button" aria-label="Tuần trước">' +
      I.chevL +
      '</button><span>20/05 - 26/05/2024</span><button type="button" aria-label="Tuần sau">' +
      I.chevR +
      '</button></div>' +
      rows +
      '</div></div>'
    );
  }

  function patrol() {
    function pt(name, time, done) {
      var ic = done ? I.checkCircleOk : I.checkCircleNo;
      var st = done
        ? '<div class="pt-time">' + time + '</div><div class="pt-st ok">Đã điểm danh</div>'
        : '<div class="pt-time">---</div><div class="pt-st pending">Chưa điểm danh</div>';
      return (
        '<div class="pt-row"><span class="pt-ic">' +
        ic +
        '</span><span class="pt-name">' +
        name +
        '</span><div class="pt-right">' +
        st +
        '</div><span class="pt-chev">' +
        I.chevR +
        '</span></div>'
      );
    }

    return (
      '<div id="v-patrol" class="view">' +
      statusBar() +
      '<div class="screen-body has-footer-btn">' +
      subHeader('TUẦN TRA', '<div class="nav-sub"><span class="hl">Ca sáng:</span> 06:00 - 14:00</div>') +
      '<div class="prog-card">' +
      '<div class="prog-head"><span>Tiến độ tuần tra</span><b>2/5 điểm</b></div>' +
      '<div class="pbar-wrap"><div class="pbar"><div class="pfill"></div></div><span class="pct">40%</span></div>' +
      '</div>' +
      '<div class="sec-title">Danh sách điểm tuần tra</div>' +
      '<div class="pt-list">' +
      pt('Sảnh chính', '06:10', true) +
      pt('Hầm xe B1', '06:25', true) +
      pt('Thang máy', '', false) +
      pt('Tầng 5', '', false) +
      pt('Sân thượng', '', false) +
      '</div></div>' +
      '<div class="footer-cta"><button type="button" class="btn-cta blue with-icon">' +
      I.qr +
      ' QUÉT QR / CHECK ĐIỂM</button></div>' +
      '</div>'
    );
  }

  function incident() {
    var types = [
      [I.incSecurity, 'An ninh', 'Trật tự'],
      [I.incFire, 'PCCC', 'Cháy nổ'],
      [I.incTech, 'Kỹ thuật', 'Hạ tầng'],
      [I.incBox, 'Mất mát', 'Tài sản'],
      [I.incCar, 'Giao thông', 'Xe cộ'],
      [I.incMore, 'Khác', 'Khác']
    ];
    var tiles = '';
    for (var i = 0; i < types.length; i++) {
      tiles +=
        '<div class="inc-tile">' +
        types[i][0] +
        '<div class="il1">' +
        types[i][1] +
        '</div><div class="il2">' +
        types[i][2] +
        '</div></div>';
    }

    return (
      '<div id="v-incident" class="view">' +
      statusBar() +
      '<div class="screen-body">' +
      subHeader('BÁO SỰ CỐ') +
      '<div class="steps">' +
      '<div class="step on"><div class="sn">1</div><div class="sl">Loại sự cố</div></div>' +
      '<div class="sline"></div>' +
      '<div class="step"><div class="sn">2</div><div class="sl">Chi tiết</div></div>' +
      '<div class="sline"></div>' +
      '<div class="step"><div class="sn">3</div><div class="sl">Gửi báo cáo</div></div>' +
      '</div>' +
      '<div class="inc-heading">Chọn loại sự cố</div>' +
      '<div class="inc-grid">' +
      tiles +
      '</div></div></div>'
    );
  }

  function wireMain(root) {
    if (!root) return;

    function bindNav() {
      var nis = root.querySelectorAll('.ni[data-nav]');
      for (var m = 0; m < nis.length; m++) {
        nis[m].onclick = (function (btn) {
          return function () {
            show(btn.getAttribute('data-nav'));
          };
        })(nis[m]);
      }
    }

    function show(id) {
      var views = root.querySelectorAll('.view');
      for (var i = 0; i < views.length; i++) {
        views[i].classList.toggle('on', views[i].id === id);
      }
      root.querySelector('.scr').scrollTop = 0;

      var nav = root.querySelector('.nav');
      if (id === 'v-checkin' || id === 'v-checkout') {
        if (nav) nav.style.display = 'none';
        return;
      }

      var use5 = id === 'v-patrol' || id === 'v-incident';
      var spec = use5 ? NAV5 : NAV4;
      var map5 = { 'v-home': 0, 'v-schedule': 1, 'v-patrol': 2, 'v-incident': 3 };
      var map4 = { 'v-home': 0, 'v-schedule': 1, 'v-incident': 2 };
      var idx = (use5 ? map5 : map4)[id];
      if (idx === undefined) idx = 0;

      if (nav) {
        nav.style.display = 'flex';
        nav.outerHTML = buildNav(spec, idx);
      } else {
        root.insertAdjacentHTML('beforeend', buildNav(spec, idx));
      }
      bindNav();
    }

    var gos = root.querySelectorAll('[data-go]');
    for (var k = 0; k < gos.length; k++) {
      gos[k].onclick = (function (b) {
        return function () {
          show(b.getAttribute('data-go'));
        };
      })(gos[k]);
    }
    bindNav();
  }

  var demoInner =
    home() +
    checkin() +
    checkout() +
    schedule() +
    patrol() +
    incident();

  document.getElementById('gallery').innerHTML =
    phoneFrame('1 · Trang chủ', home(), buildNav(NAV4, 0)) +
    phoneFrame('2 · Vào ca', checkin(), '') +
    phoneFrame('3 · Kết thúc ca', checkout(), '') +
    phoneFrame('4 · Lịch trực', schedule(), buildNav(NAV4, 1)) +
    phoneFrame('5 · Tuần tra', patrol(), buildNav(NAV5, 2)) +
    phoneFrame('6 · Báo sự cố', incident(), buildNav(NAV5, 3)) +
    phoneFrame('Demo tương tác', demoInner, buildNav(NAV4, 0), 'phone-main');

  var gal = document.getElementById('gallery');
  gal.innerHTML = gal.innerHTML.split('<div').join('<div').split('</div>').join('</div>');

  var main = document.getElementById('phone-main');
  if (main) {
    var slot = main.querySelector('.nav-slot');
    if (slot) {
      var nav = slot.querySelector('.nav');
      if (nav) slot.parentNode.insertBefore(nav, slot);
      slot.remove();
    }
  }

  wireMain(document.getElementById('phone-main'));

  setInterval(function () {
    var el = document.getElementById('clk-in');
    if (!el) return;
    var n = new Date();
    el.textContent =
      String(n.getHours()).padStart(2, '0') +
      ':' +
      String(n.getMinutes()).padStart(2, '0') +
      ':' +
      String(n.getSeconds()).padStart(2, '0');
  }, 1000);
})();
