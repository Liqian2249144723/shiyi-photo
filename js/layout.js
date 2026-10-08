/* ============================================================
   拾忆相馆 —— 共享布局（导航 / 页脚 / 悬浮客服）
   ------------------------------------------------------------
   用法：
     - 页面 body 中保留三个挂载点骨架：
         <header class="nav" id="nav" data-nav></header>
         <footer class="footer" data-footer></footer>
         <aside class="floating-widget" id="floatWidget" data-widget></aside>
     - 在 body 末尾、main.js 之前以普通（同步）script 引入本文件：
         <script src="js/layout.js"></script>
         <script src="js/main.js"></script>
     - 导航当前项由 location.pathname 自动判定，增删菜单项只需改此文件。
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 站点配置：改这里即可全站同步 ---------- */
  var SITE = {
    wechat: "shiyi-photo",
    email: "hello@shiyi.art",
    emailSubject: "老照片修复咨询"
  };

  var NAV_LINKS = [
    { file: "services.html", label: "修复服务" },
    { file: "works.html",    label: "修复案例" },
    { file: "process.html",  label: "修复流程" },
    { file: "pricing.html",  label: "价格" },
    { file: "download.html", label: "应用下载" }
  ];

  /* ---------- 当前页面判定（兼容 /、/index.html、file:// 直开） ---------- */
  var current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (current === "") current = "index.html";
  var isHome = current === "index.html";
  // 首页有 hero，锚点落在本页即可；子页需回到首页对应区块
  var anchor = function (hash) { return (isHome ? "" : "index.html") + hash; };

  /* ---------- 二维码（统一在此生成，去掉散落各页的重复 URL） ---------- */
  var qr = function (size, data) {
    return "https://api.qrserver.com/v1/create-qr-code/" +
      "?size=" + size + "&margin=8&bgcolor=f2e8d5&color=2a2118&data=" + data;
  };
  var wechatQr = qr("160x160", "weixin://dl/chat?" + SITE.wechat);

  /* ---------- 导航 ---------- */
  var navHTML = function () {
    var links = NAV_LINKS.map(function (l) {
      var active = l.file === current ? ' class="active" aria-current="page"' : "";
      return '<a href="' + l.file + '"' + active + ">" + l.label + "</a>";
    }).join("");

    return '' +
      '<div class="nav-inner">' +
        '<a href="index.html" class="brand" aria-label="拾忆相馆首页">' +
          '<span class="brand-seal">拾</span>' +
          '<span class="brand-text">' +
            '<span class="brand-cn">拾忆相馆</span>' +
            '<span class="brand-en">SHIYI&nbsp;STUDIO</span>' +
          "</span>" +
        "</a>" +
        '<nav class="nav-links" id="navLinks" aria-label="主导航">' +
          links +
          '<a href="' + anchor("#contact") + '" class="nav-cta">开始修复</a>' +
        "</nav>" +
        '<button class="nav-burger" id="burger" type="button" aria-label="打开菜单" aria-expanded="false" aria-controls="navLinks">' +
          "<span></span><span></span><span></span>" +
        "</button>" +
      "</div>";
  };

  /* ---------- 页脚（全站统一，子页也带上二维码与政策链接） ---------- */
  var footerHTML = function () {
    var trust = anchor("#trust");
    var links = NAV_LINKS.map(function (l) {
      return '<a href="' + l.file + '">' + l.label + "</a>";
    }).join("");

    return '' +
      '<div class="footer-inner">' +
        '<div class="footer-brand">' +
          '<span class="brand-cn">拾忆相馆</span>' +
          "<p>修复一张照片，找回一段时光。</p>" +
          '<div class="footer-qr">' +
            '<img src="' + qr("140x140", "weixin://dl/chat?" + SITE.wechat) + '" ' +
              'alt="客服微信二维码 ' + SITE.wechat + '" width="96" height="96" loading="lazy" />' +
            '<div class="footer-qr-text">' +
              '<p class="footer-qr-label">客服微信</p>' +
              '<p class="footer-qr-id">' + SITE.wechat + "</p>" +
              '<p class="footer-qr-note">扫码咨询 · 2小时内回复</p>' +
            "</div>" +
          "</div>" +
        "</div>" +
        '<nav class="footer-links" aria-label="页脚导航">' + links + "</nav>" +
        '<div class="footer-policies">' +
          '<a href="' + trust + '">隐私政策</a>' +
          '<a href="' + trust + '">退款规则</a>' +
          '<a href="' + trust + '">服务条款</a>' +
          '<a href="' + trust + '">保密协议</a>' +
        "</div>" +
        '<p class="footer-copy">© 2026 拾忆相馆 SHIYI STUDIO · 保留所有权利 · 工信部备案中</p>' +
      "</div>";
  };

  /* ---------- 悬浮客服 ---------- */
  var widgetHTML = function () {
    return '' +
      '<button class="fw-toggle" id="fwToggle" type="button" aria-expanded="false" aria-controls="fwPanel" aria-label="在线客服">' +
        '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
          '<path d="M4 5h16v11H8l-4 4V5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M8 9h8M8 12h5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
        "</svg>" +
        '<span class="fw-badge" aria-hidden="true">1</span>' +
      "</button>" +
      '<div class="fw-panel" id="fwPanel" hidden>' +
        '<div class="fw-head">' +
          "<div>" +
            '<p class="fw-title">在线咨询</p>' +
            '<p class="fw-status"><span class="fw-dot"></span>通常2小时内回复</p>' +
          "</div>" +
          '<button class="fw-close" id="fwClose" type="button" aria-label="关闭">×</button>' +
        "</div>" +
        '<div class="fw-body">' +
          '<img class="fw-qr" src="' + wechatQr + '" alt="客服微信二维码" width="120" height="120" loading="lazy" />' +
          '<p class="fw-name">客服微信</p>' +
          '<p class="fw-id">' + SITE.wechat + "</p>" +
          '<p class="fw-tip">扫码或长按识别，加我微信咨询</p>' +
          '<a class="fw-action" href="mailto:' + SITE.email + "?subject=" + SITE.emailSubject + '">邮件咨询 →</a>' +
        "</div>" +
      "</div>";
  };

  /* ---------- 注入 ---------- */
  var nav = document.querySelector("[data-nav]");
  if (nav) nav.innerHTML = navHTML();

  var footer = document.querySelector("[data-footer]");
  if (footer) footer.innerHTML = footerHTML();

  var widget = document.querySelector("[data-widget]");
  if (widget) widget.innerHTML = widgetHTML();
})();
