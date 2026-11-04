/* JoMain: kod rujukan rakan. Contoh: jomainhq.github.io/?ref=CIKGUAINA
   Kod disimpan 30 hari pada peranti pelawat dan dimasukkan ke dalam mesej pesanan WhatsApp. */
(function(){
  var KEY="jm-ref", DAYS=30;
  try{
    var m=location.search.match(/[?&]ref=([A-Za-z0-9_-]{2,24})/);
    if(m) localStorage.setItem(KEY, JSON.stringify({c:m[1].toUpperCase(), t:Date.now()}));
  }catch(e){}
  window.jmRef=function(){
    try{ var v=JSON.parse(localStorage.getItem(KEY)||"null"); if(v&&Date.now()-v.t<DAYS*864e5) return v.c; }catch(e){}
    return "";
  };
})();
