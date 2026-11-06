/* JoMain: suara untuk soalan dan setiap jawapan.
   - Butang 🔊 di sebelah soalan (tidak lagi menutup gambar)
   - Butang 🔈 kecil pada setiap pilihan jawapan
   - Soalan dibaca secara automatik bila soalan baharu muncul (ikut butang bunyi permainan) */
(function(){
  if(!("speechSynthesis" in window)) return;
  var EN=(document.documentElement.lang||"").toLowerCase().indexOf("en")===0;
  function voiceFor(){
    var vs=speechSynthesis.getVoices()||[], f=function(re){ for(var i=0;i<vs.length;i++) if(re.test(vs[i].lang)) return vs[i]; return null; };
    return EN ? f(/^en/i) : (f(/^ms/i)||f(/^id/i));
  }
  speechSynthesis.getVoices();
  if(speechSynthesis.addEventListener) speechSynthesis.addEventListener("voiceschanged",function(){});
  var FR={"1/2":"satu perdua","1/4":"satu perempat","3/4":"tiga perempat","1/3":"satu pertiga"};
  function spoken(t){
    t=String(t==null?"":t).trim(); if(!t) return "";
    if(/[\u0600-\u06FF\u0750-\u077F]/.test(t)){
      try{ if([...t].length===1 && typeof NAME!=="undefined" && NAME[t]) return NAME[t]; }catch(e){}
      try{ if(typeof W!=="undefined"){ for(var i=0;i<W.length;i++) if(W[i][1]===t) return W[i][0]; } }catch(e){}
      return "";
    }
    if(FR[t]) return FR[t];
    var m=t.match(/^RM\s?(\d+(?:\.\d+)?)$/); if(m) return m[1]+" ringgit";
    m=t.match(/^pukul (\d+)\.30$/); if(m) return "pukul "+m[1]+" setengah";
    return t.replace(/___/g, EN?"blank":"kosong").replace(/\s+/g," ");
  }
  function say(text){
    var s=spoken(text); if(!s) return;
    try{
      speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(s), v=voiceFor();
      if(v){ u.voice=v; u.lang=v.lang; } else u.lang=EN?"en-US":"ms-MY";
      u.rate=0.85; speechSynthesis.speak(u);
    }catch(e){}
  }
  window.jmSay=say;
  function soundOn(){ try{ return typeof sound==="undefined" || !!sound; }catch(e){ return true; } }
  function curQ(){ try{ return (typeof S!=="undefined" && S && S.rounds) ? S.rounds[S.i] : null; }catch(e){ return null; } }
  function questionText(){
    var app=document.getElementById("app"); if(!app) return "";
    var parts=[], add=function(t){ t=String(t||"").trim().replace(/[.?!]+$/,""); if(t) parts.push(t); };
    var st=app.querySelector(".picture .story"), cl=app.querySelector(".picture .clue"), bl=app.querySelector(".picture .bigletter"), bw=app.querySelector(".picture .bigword"), ask=app.querySelector(".ask .jm-q");
    if(st) add(st.textContent); if(cl) add(cl.textContent); if(bl) add(spoken(bl.textContent)||bl.textContent); if(bw) add(bw.textContent);
    if(ask) parts.push(ask.textContent.trim());
    return parts.join(". ");
  }
  var css=document.createElement("style");
  css.textContent='.speak-btn{display:none!important}'+
   '.ask{display:flex;align-items:center;gap:10px}'+
   '.jm-say-q{flex:none;width:44px;height:44px;border-radius:50%;border:2px solid var(--ink);background:var(--tile);color:var(--tile-ink);font-size:20px;line-height:1;display:grid;place-items:center;cursor:pointer;box-shadow:0 3px 0 var(--ink)}'+
   '.opt{position:relative;padding-left:48px!important}'+
   '.jm-say-o{position:absolute;left:8px;top:50%;transform:translateY(-50%);width:32px;height:32px;border-radius:50%;background:var(--slot);border:1.5px solid var(--ink-soft);font-size:15px;line-height:1;display:grid;place-items:center;cursor:pointer;letter-spacing:0}'+
   '.opt.ok .jm-say-o,.opt.no .jm-say-o{opacity:.6}';
  document.head.appendChild(css);
  var lastQ=null;
  function enhance(){
    var app=document.getElementById("app"); if(!app) return;
    var ask=app.querySelector(".ask");
    if(ask && !ask.querySelector(".jm-say-q")){
      var txt=ask.innerHTML; ask.innerHTML='<span class="jm-say-q" role="button" tabindex="0" aria-label="'+(EN?"Listen to the question":"Dengar soalan")+'">🔊</span><span class="jm-q">'+txt+'</span>';
    }
    app.querySelectorAll(".opt").forEach(function(o){
      if(o.querySelector(".jm-say-o")) return;
      var sp=document.createElement("span"); sp.className="jm-say-o"; sp.setAttribute("role","button"); sp.setAttribute("aria-label",EN?"Listen":"Dengar"); sp.textContent="🔈";
      o.insertBefore(sp,o.firstChild);
    });
    var q=curQ();
    if(q && q!==lastQ && ask){ lastQ=q; if(soundOn()) setTimeout(function(){ say(questionText()); },250); }
  }
  // Ketik butang suara: baca, tetapi jangan pilih jawapan
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest(".jm-say-q,.jm-say-o"); if(!b) return;
    e.stopPropagation(); e.preventDefault();
    if(b.classList.contains("jm-say-q")) say(questionText());
    else { var o=b.closest(".opt"); if(o) say(o.getAttribute("data-v")); }
  },true);
  function start(){
    var app=document.getElementById("app"); if(!app) return;
    new MutationObserver(enhance).observe(app,{childList:true,subtree:true}); enhance();
    // Suara jawapan selepas betul dan bunyi jubin (permainan sedia ada) guna suara yang sama
    if(typeof window.speak==="function"){ window.speak=function(t){ if(soundOn()) say(t); }; }
    // Arked: baca soalan tambah setiap kali soalan baharu muncul
    var eq=document.getElementById("eq");
    var watchEq=function(){ var el=document.getElementById("eq"); if(!el||el.__jm) return; el.__jm=1;
      new MutationObserver(function(){ var m=el.textContent.match(/(\d+)\s*\+\s*(\d+)/); if(m&&soundOn()) say(m[1]+(EN?" plus ":" tambah ")+m[2]); }).observe(el,{childList:true,characterData:true,subtree:true}); };
    new MutationObserver(watchEq).observe(app,{childList:true,subtree:true}); watchEq();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start); else start();
})();
