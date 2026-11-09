/* =========================================================
   책 넘기기 동작 (글콘티 0화 《반지》 전용)
   - 컴퓨터: 책 왼쪽/오른쪽 누르기, 키보드 ← →
   - 휴대폰: 손가락으로 밀기, 아래 ‹ › 버튼
   보통은 이 파일을 고칠 필요가 없습니다.
   ========================================================= */
(function(){
  var book = document.querySelector(".book");
  if (!book) return;
  var vp = book.querySelector(".book-viewport");
  var flow = book.querySelector(".book-flow");
  var count = document.querySelector(".book-count");
  var bar = document.querySelector(".book-progress span");
  var btnPrev = document.querySelector("[data-book-prev]");
  var btnNext = document.querySelector("[data-book-next]");
  var KEY = "ring-progress";

  var perView = 1, pageW = 0, gap = 0, total = 1, index = 0;

  function layout(keepFraction){
    var frac = keepFraction != null ? keepFraction : (total > 1 ? index / total : 0);
    var desktop = window.innerWidth >= 900;
    perView = desktop ? 2 : 1;
    gap = desktop ? 80 : 32;
    var padX = desktop ? 40 : 18, padY = desktop ? 40 : 22;

    var headerBottom = document.querySelector(".site-header").getBoundingClientRect().bottom;
    var top = document.querySelector(".book-top").offsetHeight + 12;
    var ctrl = document.querySelector(".book-ctrl").offsetHeight + 12 + 12;
    var tabs = desktop ? 0 : (document.querySelector(".nav-tabs").offsetHeight || 0);
    var avail = book.clientWidth;

    pageW = desktop ? Math.min(430, Math.floor((avail - padX * 2 - gap) / 2)) : Math.floor(avail - padX * 2);
    var h = window.innerHeight - headerBottom - top - ctrl - tabs - padY * 2 - 28;
    if (desktop) h = Math.min(h, Math.round(pageW * 1.5));
    h = Math.max(280, Math.floor(h));

    var flowW = perView * pageW + (perView - 1) * gap;
    vp.style.setProperty("--pad-x", padX + "px");
    vp.style.setProperty("--pad-y", padY + "px");
    vp.style.width = flowW + "px";
    flow.style.setProperty("--page-w", pageW + "px");
    flow.style.setProperty("--page-h", h + "px");
    flow.style.setProperty("--gap", gap + "px");
    flow.style.setProperty("--flow-w", flowW + "px");
    book.classList.toggle("spread", desktop);

    // 전체 페이지 수 계산
    flow.style.transition = "none";
    flow.style.transform = "translateX(0)";
    total = Math.max(1, Math.round((flow.scrollWidth + gap) / (pageW + gap)));
    if (perView === 2 && total % 2) total += 1;

    index = Math.round(frac * total);
    index -= index % perView;
    go(index, true);
    requestAnimationFrame(function(){ flow.style.transition = ""; });
  }

  function go(i, silent){
    var last = total - perView;
    index = Math.max(0, Math.min(i, Math.max(0, last)));
    index -= index % perView;
    flow.style.transform = "translateX(" + (-index * (pageW + gap)) + "px)";
    var shown = perView === 2
      ? (index + 1) + "–" + Math.min(index + 2, total)
      : String(index + 1);
    count.textContent = shown + " / " + total;
    bar.style.width = (Math.min(index + perView, total) / total * 100) + "%";
    btnPrev.disabled = index <= 0;
    btnNext.disabled = index >= last;
    if (!silent) { try { localStorage.setItem(KEY, String(index / total)); } catch(e){} }
  }
  function next(){ go(index + perView); }
  function prev(){ go(index - perView); }

  btnPrev.addEventListener("click", prev);
  btnNext.addEventListener("click", next);
  book.querySelector(".book-hit.prev").addEventListener("click", prev);
  book.querySelector(".book-hit.next").addEventListener("click", next);

  document.addEventListener("keydown", function(e){
    if (document.querySelector(".modal:not([hidden])")) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); next(); }
    if (e.key === "ArrowLeft"  || e.key === "PageUp")   { e.preventDefault(); prev(); }
  });

  // 손가락으로 밀기
  var sx = 0, sy = 0;
  vp.addEventListener("touchstart", function(e){ sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, {passive:true});
  vp.addEventListener("touchend", function(e){
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); }
  });

  // 크기가 바뀌면 읽던 위치를 유지하며 다시 나누기
  var t;
  window.addEventListener("resize", function(){ clearTimeout(t); t = setTimeout(function(){ layout(); }, 150); });
  document.querySelectorAll("[data-lang-toggle]").forEach(function(b){ b.addEventListener("click", function(){ layout(); }); });

  // 처음 열 때: 마지막으로 읽던 위치에서 시작
  var saved = 0;
  try { saved = parseFloat(localStorage.getItem(KEY)) || 0; } catch(e){}
  function start(){ layout(saved); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else window.addEventListener("load", start);
  start();
})();
