/* =========================================================
   VEREN 《의념》 — 공통 동작
   (다크모드, 한/영 전환, 팝업 창, 스포일러 안내)
   ========================================================= */

function save(key, value){ try { localStorage.setItem(key, value); } catch(e){} }

/* ---------- 다크모드 버튼 ---------- */
document.querySelectorAll("[data-theme-toggle]").forEach(function(btn){
  btn.addEventListener("click", function(){
    var root = document.documentElement;
    var cur = root.getAttribute("data-theme") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    save("theme", next);
  });
});

/* ---------- 한국어 / 영어 버튼 ---------- */
document.querySelectorAll("[data-lang-toggle]").forEach(function(btn){
  btn.addEventListener("click", function(){
    var root = document.documentElement;
    var next = root.getAttribute("data-lang") === "en" ? "ko" : "en";
    root.setAttribute("data-lang", next);
    root.lang = next;
    save("lang", next);
  });
});

/* ---------- 팝업 창 ----------*/
var modal = document.getElementById("popup");
function closePopup(){ if (modal) modal.hidden = true; }
document.querySelectorAll("[data-open]").forEach(function(btn){
  btn.addEventListener("click", function(){
    var tpl = document.getElementById(btn.getAttribute("data-open"));
    if (!tpl || !modal) return;
    var body = modal.querySelector(".modal-body");
    body.innerHTML = "";
    body.appendChild(tpl.content.cloneNode(true));
    modal.hidden = false;
    modal.querySelector(".x").focus();
  });
});
if (modal){
  modal.querySelector(".x").addEventListener("click", closePopup);
  modal.addEventListener("click", function(e){ if (e.target === modal) closePopup(); });
}

/* ---------- 스포일러 안내 ----------
 안내 문구를 바꾸려면 아래 SPOILER_TEXT 를 고치기 */
var SPOILER_TEXT = {
  tag:   ["열람 안내", "NOTICE"],
  title: ["웹툰을 먼저 보시길 권합니다", "We recommend reading the webtoon first"],
  body:  ["이 페이지에는 웹툰 《의념》의 주요 내용이 포함되어 있습니다. 결말을 모르고 읽고 싶다면 웹툰을 먼저 보신 뒤 열람해 주세요.",
          "This page contains major story details from EUINYEOM. If you want to go in fresh, please read the webtoon first."],
  read:  ["웹툰 먼저 보기", "Read the webtoon"],
  open:  ["열람하기", "Continue"]
};
function koEn(pair){ return '<span class="ko">' + pair[0] + '</span><span class="en">' + pair[1] + '</span>'; }

var oldSpoiler = document.getElementById("spoiler");
if (oldSpoiler) oldSpoiler.remove();   // 예전 방식의 안내창은 지움

var isStaffPage = /staff\.html$/.test(location.pathname);
var spoiler = document.createElement("div");
spoiler.className = "modal";
spoiler.hidden = true;
spoiler.setAttribute("role", "dialog");
spoiler.setAttribute("aria-modal", "true");
spoiler.innerHTML =
  '<div class="modal-box">' +
    '<div class="modal-head"><span class="logo"><svg><use href="#ring"/></svg>VEREN</span><span class="mono">' + koEn(SPOILER_TEXT.tag) + '</span></div>' +
    '<div class="modal-body"><h3>' + koEn(SPOILER_TEXT.title) + '</h3><p>' + koEn(SPOILER_TEXT.body) + '</p></div>' +
    '<div class="modal-acts">' +
      '<a class="btn ghost" href="webtoon.html">' + koEn(SPOILER_TEXT.read) + '</a>' +
      '<button class="btn" type="button" data-spoiler-open>' + koEn(SPOILER_TEXT.open) + '</button>' +
    '</div>' +
  '</div>';
document.body.appendChild(spoiler);

function showSpoiler(){ spoiler.hidden = false; spoiler.querySelector("[data-spoiler-open]").focus(); }

spoiler.querySelector("[data-spoiler-open]").addEventListener("click", function(){
  if (isStaffPage){
    spoiler.hidden = true;
  } else {
    try { sessionStorage.setItem("spoilerPass", "1"); } catch(e){}
    location.href = "staff.html";
  }
});

if (isStaffPage){
  // 다른 페이지에서 '열람하기'를 누르고 들어온 경우엔 다시 묻지 않음
  var passed = false;
  try { passed = sessionStorage.getItem("spoilerPass") === "1"; sessionStorage.removeItem("spoilerPass"); } catch(e){}
  if (!passed){
    // QR·즐겨찾기로 바로 들어온 경우: 뒤의 내용이 보이지 않게 가리고 안내
    spoiler.style.background = "var(--bg)";
    showSpoiler();
  }
} else {
  // 다른 페이지: staff.html 로 가는 링크를 누르면 이동하기 전에 안내
  spoiler.addEventListener("click", function(e){ if (e.target === spoiler) spoiler.hidden = true; });
  document.querySelectorAll('a[href="staff.html"]').forEach(function(a){
    a.addEventListener("click", function(e){ e.preventDefault(); showSpoiler(); });
  });
}

document.addEventListener("keydown", function(e){
  if (e.key === "Escape"){ closePopup(); if (!isStaffPage) spoiler.hidden = true; }
});