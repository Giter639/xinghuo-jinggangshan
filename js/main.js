/* 星火井冈 · 交互脚本：导航 / 进度 / 滚动显现 */
(function () {
  "use strict";

  var nav = document.getElementById("nav");
  var bar = document.getElementById("progressBar");
  var toTop = document.getElementById("toTop");
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.nav-links a[href^="#"]')
  );
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  /* 导航状态、阅读进度、当前栏目高亮 */
  function onScroll() {
    var y = window.scrollY || 0;
    nav.classList.toggle("scrolled", y > 24);
    toTop.classList.toggle("show", y > 600);

    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";

    var current = sections[0];
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= 130) current = sections[i];
    }
    // 滚动到底部时高亮最后一项
    if (max > 0 && window.innerHeight + y >= doc.scrollHeight - 4) {
      current = sections[sections.length - 1];
    }
    links.forEach(function (a) {
      a.classList.toggle(
        "active",
        !!current && a.getAttribute("href") === "#" + current.id
      );
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* 移动端菜单 */
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  });
  menu.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      menu.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* 回到顶部 */
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* 滚动显现 */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ===== 红色影像：选集切换 + 懒加载播放 ===== */
  var playerBox = document.getElementById("playerBox");
  var poster = document.getElementById("playerPoster");
  var plItems = Array.prototype.slice.call(document.querySelectorAll(".pl-item"));

  function playVideo(item) {
    var bvid = item.getAttribute("data-bvid");
    var src =
      "https://player.bilibili.com/player.html?bvid=" + bvid +
      "&page=1&high_quality=1&danmaku=0&autoplay=1";
    poster.style.display = "none";
    var old = playerBox.querySelector("iframe");
    if (old) old.remove();
    var frame = document.createElement("iframe");
    frame.src = src;
    frame.setAttribute("allowfullscreen", "true");
    frame.setAttribute("scrolling", "no");
    frame.setAttribute("frameborder", "no");
    frame.setAttribute("title", "视频播放器");
    frame.allow = "fullscreen";
    playerBox.appendChild(frame);
    plItems.forEach(function (b) { b.classList.toggle("active", b === item); });
  }
  plItems.forEach(function (item) {
    item.addEventListener("click", function () { playVideo(item); });
  });
  if (poster) {
    poster.addEventListener("click", function () {
      playVideo(plItems[0]);
    });
    poster.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        playVideo(plItems[0]);
      }
    });
  }

  /* ===== 星火问答 ===== */
  var QUIZ = [
    {
      q: "1927年10月，毛泽东率领哪支部队向井冈山进军，创建了中国第一个农村革命根据地？",
      opts: ["南昌起义部队", "秋收起义部队", "广州起义部队", "平江起义部队"],
      a: 1,
      ex: "1927年9月湘赣边界秋收起义受挫后，毛泽东率部沿罗霄山脉中段向南转移，10月到达井冈山，开始创建根据地。"
    },
    {
      q: "《井冈山的斗争》一文，是毛泽东以什么身份写给谁的报告？",
      opts: ["红四军前委 → 中共中央", "湖南省委 → 共产国际", "红四军军委 → 湖南省委", "红军总前委 → 中华苏维埃共和国"],
      a: 0,
      ex: "1928年11月25日，毛泽东代表红四军前委写给中共中央的报告，即《井冈山的斗争》，后收入《毛泽东选集》第一卷。"
    },
    {
      q: "\u201c黄洋界上炮声隆，报道敌军宵遁\u201d出自哪首词作？",
      opts: ["《忆秦娥·娄山关》", "《菩萨蛮·黄鹤楼》", "《西江月·井冈山》", "《水调歌头·重上井冈山》"],
      a: 2,
      ex: "1928年8月黄洋界保卫战，红军凭险据守、以少胜多，毛泽东欣然写下《西江月·井冈山》。"
    },
    {
      q: "\u201c支部建在连上\u201d的重要意义是什么？",
      opts: ["把党支部设在团部机关", "把党的组织落到基层连队", "建立士兵委员会制度", "推行官兵平等薪饷制"],
      a: 1,
      ex: "\u201c支部建在连上\u201d把党的组织和党的工作落实到基层，是红军艰难奋战而不溃散的重要原因。"
    },
    {
      q: "井冈山精神28字中，与\u201c从中国国情出发、开辟农村包围城市道路\u201d直接对应的是？",
      opts: ["坚定执着追理想", "艰苦奋斗攻难关", "依靠群众求胜利", "实事求是闯新路"],
      a: 3,
      ex: "不照搬\u201c城市中心论\u201d，实事求是地分析中国国情，才闯出了农村包围城市、武装夺取政权的革命新路。"
    },
    {
      q: "在\u201c朱德的扁担\u201d的故事中，朱德在被藏起扁担后，在新扁担上写下了什么？",
      opts: ["\u201c革命到底\u201d", "\u201c朱德记\u201d", "\u201c红军万岁\u201d", "什么都没写"],
      a: 1,
      ex: "战士们心疼军长把扁担藏了起来，朱德另找来一根写上\u201c朱德记\u201d，又出现在挑粮的队伍中。"
    }
  ];

  var qCount = document.getElementById("qCount");
  var qDots = document.getElementById("qDots");
  var qTitle = document.getElementById("qTitle");
  var qOpts = document.getElementById("qOpts");
  var qExplain = document.getElementById("qExplain");
  var qExplainText = document.getElementById("qExplainText");
  var qNext = document.getElementById("qNext");
  var qBody = document.getElementById("qBody");
  var qResult = document.getElementById("qResult");
  var qScore = document.getElementById("qScore");
  var qLevel = document.getElementById("qLevel");
  var qLevelDesc = document.getElementById("qLevelDesc");
  var qRestart = document.getElementById("qRestart");

  if (qTitle) {
    var qIdx = 0, qRight = 0, qAnswered = false;
    var dotEls = [];

    function renderDots() {
      qDots.innerHTML = "";
      dotEls = QUIZ.map(function (_, i) {
        var d = document.createElement("i");
        qDots.appendChild(d);
        return d;
      });
      dotEls[qIdx].classList.add("cur");
    }
    function renderQuestion() {
      var item = QUIZ[qIdx];
      qCount.textContent = "第 " + (qIdx + 1) + " / " + QUIZ.length + " 题";
      qTitle.textContent = item.q;
      qOpts.innerHTML = "";
      qExplain.hidden = true;
      qNext.textContent = qIdx === QUIZ.length - 1 ? "查看结果" : "下一题";
      item.opts.forEach(function (text, i) {
        var btn = document.createElement("button");
        btn.className = "q-opt";
        btn.innerHTML = "<b>" + "ABCD"[i] + "</b><span>" + text + "</span>";
        btn.addEventListener("click", function () { answer(i, btn); });
        qOpts.appendChild(btn);
      });
    }
    function answer(i, btn) {
      if (qAnswered) return;
      qAnswered = true;
      var right = i === QUIZ[qIdx].a;
      if (right) qRight++;
      var buttons = qOpts.querySelectorAll(".q-opt");
      buttons.forEach(function (b) { b.disabled = true; });
      btn.classList.add(right ? "is-right" : "is-wrong");
      if (!right) buttons[QUIZ[qIdx].a].classList.add("is-right");
      dotEls[qIdx].classList.remove("cur");
      dotEls[qIdx].classList.add(right ? "ok" : "bad");
      qExplainText.textContent = QUIZ[qIdx].ex;
      qExplain.hidden = false;
    }
    function finish() {
      qBody.hidden = true;
      qResult.hidden = false;
      qScore.textContent = qRight;
      var lv, lv2;
      if (qRight === 6) { lv = "燎原之星"; lv2 = "全对！井冈山的这段历史，你已经了然于心。"; }
      else if (qRight >= 4) { lv = "星火渐燃"; lv2 = "基础扎实！再读一读核心文本，星光就在前方。"; }
      else if (qRight >= 2) { lv = "初燃微光"; lv2 = "已入门径——回望\u201c走进井冈山\u201d，收获会更多。"; }
      else { lv = "重新出发"; lv2 = "不妨从\u201c革命历程\u201d时间线开始，重温这段岁月。"; }
      qLevel.textContent = "「 " + lv + " 」";
      qLevelDesc.textContent = lv2;
    }
    function restart() {
      qIdx = 0; qRight = 0; qAnswered = false;
      qResult.hidden = true;
      qBody.hidden = false;
      renderDots();
      renderQuestion();
    }
    qNext.addEventListener("click", function () {
      if (!qAnswered) return;
      if (qIdx === QUIZ.length - 1) { finish(); return; }
      qIdx++;
      qAnswered = false;
      dotEls[qIdx].classList.add("cur");
      renderQuestion();
    });
    qRestart.addEventListener("click", restart);
    renderDots();
    renderQuestion();
  }

  /* ===== 点亮星火 ===== */
  var sparkBtn = document.getElementById("sparkBtn");
  if (sparkBtn) {
    sparkBtn.addEventListener("click", function () {
      var closing = document.querySelector(".closing");
      var rect = closing.getBoundingClientRect();
      for (var i = 0; i < 26; i++) {
        var s = document.createElement("span");
        s.className = "spark-star";
        s.textContent = "★";
        s.style.left = 4 + Math.random() * 92 + "%";
        s.style.setProperty("--rise", -(rect.height * (0.45 + Math.random() * 0.55)) + "px");
        s.style.setProperty("--dur", 1.8 + Math.random() * 1.6 + "s");
        s.style.setProperty("--spin", (Math.random() * 360 - 180) + "deg");
        s.style.animationDelay = Math.random() * 0.5 + "s";
        s.style.fontSize = 11 + Math.random() * 13 + "px";
        closing.appendChild(s);
        (function (el) {
          setTimeout(function () { el.remove(); }, 4200);
        })(s);
      }
    });
  }

  /* ===== 云游井冈山：场景切换 / 自动巡游 / 鼠标视差 ===== */
  var tourStage = document.getElementById("tourStage");
  if (tourStage) {
    var scenes = Array.prototype.slice.call(tourStage.querySelectorAll(".tour-scene"));
    var stops = Array.prototype.slice.call(document.querySelectorAll(".tour-stop"));
    var tBadge = document.getElementById("tourBadge");
    var tInfo = document.getElementById("tourInfo");
    var tAuto = document.getElementById("tourAuto");
    var tIdx = 0, tTimer = null, tAutoOn = false;
    var AUTO_MS = 8000;
    var ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
    var ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';

    function renderInfo(d) {
      tBadge.textContent = "云游 · 第" + d.num + "站";
      tInfo.innerHTML =
        '<p class="ti-kicker">' + d.kicker + "</p>" +
        '<h3 class="ti-name">' + d.name + "<em>" + d.sub + "</em></h3>" +
        '<p class="ti-line">「 ' + d.line + " 」" +
          (d.by ? "<small>" + d.by + "</small>" : "") + "</p>" +
        '<p class="ti-desc">' + d.desc + "</p>" +
        (d.credit ? '<p class="ti-credit">' + d.credit + "</p>" : "");
      tInfo.classList.remove("swap");
      void tInfo.offsetWidth; /* 重置入场动画 */
      tInfo.classList.add("swap");
    }

    function show(i, manual) {
      tIdx = (i + scenes.length) % scenes.length;
      scenes.forEach(function (s, j) { s.classList.toggle("active", j === tIdx); });
      stops.forEach(function (b, j) { b.classList.toggle("active", j === tIdx); });
      renderInfo(scenes[tIdx].dataset);
      if (manual) setAuto(false);
    }

    function stopTimer() {
      if (tTimer) { clearInterval(tTimer); tTimer = null; }
    }
    function setAuto(on) {
      tAutoOn = on;
      stopTimer();
      tAuto.innerHTML = on
        ? ICON_PAUSE + "<span>自动云游中</span>"
        : ICON_PLAY + "<span>已暂停</span>";
      tAuto.setAttribute("aria-pressed", on ? "true" : "false");
      tAuto.title = on ? "暂停自动云游" : "开启自动云游";
      if (on) {
        tTimer = setInterval(function () {
          /* 不在视口内时暂停推进 */
          var r = tourStage.getBoundingClientRect();
          if (r.bottom < 60 || r.top > window.innerHeight - 60) return;
          show(tIdx + 1, false);
        }, AUTO_MS);
      }
    }

    stops.forEach(function (b, j) {
      b.addEventListener("click", function () {
        if (j !== tIdx) show(j, true);
      });
    });
    document.getElementById("tourPrev").addEventListener("click", function () { show(tIdx - 1, true); });
    document.getElementById("tourNext").addEventListener("click", function () { show(tIdx + 1, true); });
    tAuto.addEventListener("click", function () { setAuto(!tAutoOn); });
    tourStage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); show(tIdx - 1, true); }
      if (e.key === "ArrowRight") { e.preventDefault(); show(tIdx + 1, true); }
    });

    /* 鼠标视差：三层景深随光标缓动 */
    if (!reduced) {
      var tLayers = Array.prototype.slice.call(tourStage.querySelectorAll(".tl"));
      var ptx = 0, pty = 0, pcx = 0, pcy = 0, pRaf = null;
      function pTick() {
        pcx += (ptx - pcx) * 0.07;
        pcy += (pty - pcy) * 0.07;
        tLayers.forEach(function (l) {
          var d = parseFloat(l.getAttribute("data-depth")) || 0;
          l.style.transform =
            "translate3d(" + (-pcx * d).toFixed(2) + "px," + (-pcy * d * 0.6).toFixed(2) + "px,0)";
        });
        if (Math.abs(pcx - ptx) > 0.001 || Math.abs(pcy - pty) > 0.001) {
          pRaf = requestAnimationFrame(pTick);
        } else { pRaf = null; }
      }
      function pPoke() { if (pRaf === null) pRaf = requestAnimationFrame(pTick); }
      tourStage.addEventListener("mousemove", function (e) {
        var r = tourStage.getBoundingClientRect();
        ptx = (e.clientX - r.left) / r.width - 0.5;
        pty = (e.clientY - r.top) / r.height - 0.5;
        pPoke();
      });
      tourStage.addEventListener("mouseleave", function () {
        ptx = 0; pty = 0; pPoke();
      });
    }

    show(0, false);
    setAuto(!reduced);
  }
})();
