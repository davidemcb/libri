/* Davide Scuderi — la logica dell'app. Nessun tracciamento, nessun account:
   legge contenuti.json (generato da MARKETING/APP/build_app.py) e i link
   di vendita da ../assets/config.js, come tutto il sito. */
(function(){
  "use strict";

  var C = window.SITO || {amazon:{}, gumroad:{}};
  var BASE_SITO = new URL("../", location.href).href;           // …/libri/
  var URL_APP = location.origin + location.pathname;             // …/libri/app/
  var WHATSAPP = "393481514382";
  var EMAIL = C.emailPubblica || "davidescuderi1981@gmail.com";

  var LIBRI = {
    duau: {titolo:"Da uomo a uomo", cover:"../img/duau.jpg", pagina:"da-uomo-a-uomo.html",
           sotto:"Per gli uomini che dicono «tutto a posto» e intanto reggono.",
           cartaceo:C.amazon.duauCartaceo, prezzoCartaceo:"14,90 €",
           ebook:C.gumroad.duauEbook || C.amazon.duauEbook, prezzoEbook:"5,99 €", ebookDalSito:!!C.gumroad.duauEbook},
    sv:   {titolo:"Senza veli", cover:"../img/senzaveli.jpg", pagina:"senza-veli.html",
           sotto:"Per la donna che regge tutto.",
           cartaceo:C.amazon.svCartaceo, prezzoCartaceo:"",
           ebook:C.gumroad.svEbook || C.amazon.svEbook, prezzoEbook:"4,99 €", ebookDalSito:!!C.gumroad.svEbook},
    vds:  {titolo:"Vestirsi di sé", cover:"../img/vestirsi.jpg", coverL:700, coverA:1052,
           // gli altri tre hanno una pagina propria sul sito, questo no:
           // si passa la home all'altezza dei libri.
           pagina:"#libri",
           sotto:"Il primo libro: l'auto-massaggio consapevole, con gli esercizi per tutto il corpo.",
           cartaceo:C.amazon.vdsCartaceo, prezzoCartaceo:"11,40 €",
           ebook:C.amazon.vdsEbook, prezzoEbook:"4,99 €", ebookDalSito:false},
    pac:  {titolo:"Prenditi a carezze", cover:"../img/prenditi.jpg", pagina:"prenditi-a-carezze.html",
           sotto:"Una pratica semplice, nessun metodo da imparare.",
           cartaceo:C.amazon.pacCartaceo, prezzoCartaceo:"",
           ebook:C.gumroad.pacEbook || C.amazon.pacEbook, prezzoEbook:"", ebookDalSito:!!C.gumroad.pacEbook}
  };
  LIBRI.alce = {titolo:"L'Alce", cover:"", sotto:"Un viaggio dentro la perdita di una certezza.", cartaceo:"", ebook:"", prezzoCartaceo:"", prezzoEbook:"", ebookDalSito:false, inLavorazione:true};
  LIBRI.exnemico = {titolo:"L'ex non è un nemico", cover:"", sotto:"Quando la separazione finisce, ma la guerra continua.", cartaceo:"", ebook:"", prezzoCartaceo:"", prezzoEbook:"", ebookDalSito:false, inLavorazione:true};
  LIBRI.rocco = {titolo:"Non sei Rocco", cover:"", sotto:"La prestazione sessuale: quando il letto diventa un esame.", cartaceo:"", ebook:"", prezzoCartaceo:"", prezzoEbook:"", ebookDalSito:false, inLavorazione:true};
  LIBRI.banana = {titolo:"La banana guarda in giù", cover:"", sotto:"Quando non si alza, e la testa ci va a vivere.", cartaceo:"", ebook:"", prezzoCartaceo:"", prezzoEbook:"", ebookDalSito:false, inLavorazione:true};
  function libroCantiere(chiave){ for (var i = 0; i < (dati.cantiere || []).length; i++) if (dati.cantiere[i].chiave === chiave) return dati.cantiere[i]; return null; }
  function urlAvvisami(titolo){ return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent("Ciao Davide, avvisami quando esce «" + titolo + "»."); }
  var TEMI_DIMMI = ["Sessualità","Lavoro","Amore","Malattia","I figli","L'ex","Solitudine","Il padre","Il corpo"];

  var vista = document.getElementById("vista");
  var dati = null;

  /* ---------- utilità ---------- */
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function versi(righe){ return esc(righe.join("\n")); }
  function oggi(){
    var m = /[?&]data=(\d{4}-\d{2}-\d{2})/.exec(location.search);   // ?data=AAAA-MM-GG per provare un altro giorno
    var d = m ? new Date(m[1] + "T12:00:00") : new Date();
    return d;
  }
  function iso(d){ return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); }
  function dataItaliana(s){
    var d = new Date(s + "T12:00:00");
    return d.toLocaleDateString("it-IT", {day:"numeric", month:"long"});
  }
  function indiceGiorno(d){ return (d.getDay() + 6) % 7; }   // lunedì = 0
  function settimanaCorrente(){
    var t = iso(oggi()), s = dati.settimane, scelta = s[0];
    for (var i = 0; i < s.length; i++) if (s[i].inizio <= t) scelta = s[i];
    return scelta;
  }
  function trovaSettimana(inizio){
    for (var i = 0; i < dati.settimane.length; i++) if (dati.settimane[i].inizio === inizio) return dati.settimane[i];
    return null;
  }
  function libroDi(s){ return LIBRI[s.libro] || LIBRI.duau; }
  function capBreve(s){ var m = /^(\d+)/.exec(s.capitolo); return m ? "cap. " + m[1] : s.capitolo; }

  var SOGLIA = '<svg class="soglia" viewBox="0 0 44 38" aria-hidden="true" fill="none" stroke-width="2">' +
    '<line class="t1" x1="17" y1="4" x2="17" y2="30"></line><line class="t2" x1="27" y1="9" x2="27" y2="30"></line>' +
    '<line class="terreno" x1="4" y1="34" x2="40" y2="34" stroke-width="1"></line></svg>';

  function piede(){
    return '<section class="sez" style="margin-top:3rem"><p class="muted piccolo" style="text-align:center;line-height:1.9">' +
      '<em>Il corpo è il primo posto.</em><br>' +
      '<a href="' + esc(BASE_SITO) + '" target="_blank" rel="noopener">Il sito</a> · ' +
      '<a href="' + esc(BASE_SITO) + 'privacy.html" target="_blank" rel="noopener">Privacy</a> · ' +
      '<a href="#archivio">Le settimane passate</a> · <a href="#installa">Metti l\'app sul telefono</a></p></section>';
  }

  /* ---------- condivisione ---------- */
  function testoPost(s, n){
    var p = s.post[n], L = libroDi(s);
    var cap = p.capitolo || capBreve(s);
    return p.righe.join("\n") + "\n\n— Davide Scuderi, «" + L.titolo + "», " + cap;
  }
  function urlPost(s, n){ return URL_APP + "#post/" + s.inizio + "/" + n; }
  function urlSettimana(s){ return URL_APP + "#settimana/" + s.inizio; }

  function condividi(titolo, testo, url, etichetta){
    if (navigator.share) {
      navigator.share({title:titolo, text:testo, url:url}).catch(function(){});
      return;
    }
    var f = document.getElementById("foglio");
    // «Passala» per una pagina, «Passalo» per un libro: lo dice chi chiama.
    var lbl = f.querySelector(".lbl");
    if (lbl) lbl.textContent = etichetta || "Passala a qualcuno";
    var tutto = testo + "\n" + url;
    document.getElementById("cond-wa").href = "https://wa.me/?text=" + encodeURIComponent(tutto);
    document.getElementById("cond-tg").href = "https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(testo);
    document.getElementById("cond-esito").textContent = "";
    document.getElementById("cond-copia").onclick = function(){
      var esito = document.getElementById("cond-esito");
      function ok(){ esito.textContent = "Copiato. Incollalo dove vuoi."; }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(tutto).then(ok, function(){ vecchia(); });
      else vecchia();
      function vecchia(){
        var ta = document.createElement("textarea"); ta.value = tutto; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); ok(); } catch(e){ esito.textContent = "Non riesco a copiare: tieni premuto sul testo."; }
        document.body.removeChild(ta);
      }
    };
    f.hidden = false;
  }
  document.querySelectorAll("[data-chiudi]").forEach(function(el){ el.addEventListener("click", function(){ document.getElementById("foglio").hidden = true; }); });

  vista.addEventListener("click", function(ev){
    var b = ev.target.closest("[data-condividi]");
    if (!b) return;
    ev.preventDefault();
    var s = trovaSettimana(b.getAttribute("data-inizio")) || trovaPagina(b.getAttribute("data-id"));
    var tipo = b.getAttribute("data-condividi");
    if (tipo === "post") {
      var n = +b.getAttribute("data-n");
      condividi("Davide Scuderi", testoPost(s, n), urlPost(s, n));
    } else if (tipo === "pagina") {
      condividi(s.titolo + " — Davide Scuderi", "«" + s.riga + "»\n— Davide Scuderi, «" + libroDi(s).titolo + "», " + capBreve(s) + "\n\nLa pagina intera:", urlSettimana(s));
    } else if (tipo === "trovata") {
      var pg = trovaPagina(b.getAttribute("data-id"));
      if (pg) condividi("Davide Scuderi", pg.pagina.slice(0, 6).join("\n") + (pg.pagina.length > 6 ? "\n[…]" : "") + "\n\n— Davide Scuderi, «" + libroDi(pg).titolo + "»" + (libroDi(pg).inLavorazione ? " (in lavorazione)" : "") + ", " + capBreve(pg), URL_APP + "#pagina/" + pg.id);
    } else if (tipo === "libro") {
      var Lc = LIBRI[b.getAttribute("data-libro")];
      // il testo deve reggersi da solo: il foglio dell'app manda testo e link,
      // il titolo lo guarda solo il foglio di sistema del telefono.
      if (Lc) condividi(Lc.titolo + " — Davide Scuderi",
        "«" + Lc.titolo + "», di Davide Scuderi.\n" + Lc.sotto, BASE_SITO + (Lc.pagina || ""),
        "Passalo a qualcuno");
    } else if (tipo === "capitolo") {
      condividi("Un capitolo per te",
        "Ti mando un capitolo di un libro. Leggilo con calma, senza obbligo di arrivare in fondo.\n«" + libroDi(s).titolo + "», di Davide Scuderi, " + capBreve(s) + ".",
        BASE_SITO + "capitoli/" + s.capitolo_pdf);
    }
  });

  /* ---------- pezzi ---------- */
  function bottoniLibro(L, compatti){
    var out = "";
    if (L.ebook) out += '<a class="btn btn-pieno" href="' + esc(L.ebook) + '" target="_blank" rel="noopener">Ebook' + (L.prezzoEbook ? ", " + L.prezzoEbook : "") + (L.ebookDalSito ? " · subito" : " · Kindle") + '</a>';
    if (L.cartaceo) out += '<a class="btn btn-vuoto" href="' + esc(L.cartaceo) + '" target="_blank" rel="noopener">Cartaceo su Amazon' + (L.prezzoCartaceo ? ", " + L.prezzoCartaceo : "") + '</a>';
    else if (!compatti) out += '<span class="btn btn-vuoto muted" aria-disabled="true">Cartaceo in arrivo</span>';
    return '<div class="azioni">' + out + '</div>';
  }

  function cartaPost(s, n, opz){
    opz = opz || {};
    var p = s.post[n], L = libroDi(s);
    var cap = p.capitolo || capBreve(s);
    return '<div class="carta">' +
      (opz.etichetta ? '<p class="lbl">' + esc(opz.etichetta) + '</p>' : "") +
      '<p class="versi">' + versi(p.righe) + '</p>' +
      '<p class="firma">Davide Scuderi · «' + esc(L.titolo) + '», ' + esc(cap) + '</p>' +
      '<div class="azioni"><button class="btn btn-pieno" type="button" data-condividi="post" data-inizio="' + s.inizio + '" data-n="' + n + '">Passala a qualcuno</button>' +
      (opz.linkPagina ? '<a class="btn btn-vuoto" href="#settimana/' + s.inizio + '">La pagina della settimana</a>' : "") +
      '</div></div>';
  }

  function bloccoLavorazione(L){
    var c = libroCantiere(s_chiave(L)) || {};
    return '<section class="sez"><div class="testata"><p class="lbl">Il libro · in lavorazione</p><h2>' + esc(L.titolo) + '</h2><p class="sotto">' + esc(c.sotto || L.sotto) + '</p></div>' +
      '<div class="prosa"><p>Questo libro lo stiamo scrivendo adesso. La pagina che hai letto viene dal manoscritto, e può ancora cambiare. Se la vuoi intera, dimmelo: è il modo in cui decido quale libro finire per primo.</p>' +
      '<div class="azioni"><a class="btn btn-pieno" href="' + esc(urlAvvisami(L.titolo)) + '" target="_blank" rel="noopener">Avvisami quando esce</a>' +
      '<a class="btn btn-vuoto" href="mailto:' + esc(EMAIL) + '?subject=' + encodeURIComponent("Avvisami quando esce " + L.titolo) + '">Per email</a></div></div></section>';
  }
  function s_chiave(L){ for (var k in LIBRI) if (LIBRI[k] === L) return k; return ""; }
  // La copertina, con le sue proporzioni vere: se le dichiara sbagliate la
  // pagina fa un salto quando l'immagine arriva. Chi non le dichiara ha le
  // proporzioni delle prime tre (700x1120, come 600x960). Senza copertina
  // non si stampa un'immagine rotta: non si stampa niente.
  function immagineCover(L, classe){
    if (!L.cover) return "";
    return '<img' + (classe ? ' class="' + classe + '"' : '') + ' src="' + esc(L.cover) +
      '" alt="La copertina di ' + esc(L.titolo) + '" width="' + (L.coverL || 600) +
      '" height="' + (L.coverA || 960) + '" loading="lazy">';
  }
  function blocco3(s){   // la parte 3 della formula: compra o regala
    var L = libroDi(s);
    if (L.inLavorazione) return bloccoLavorazione(L);
    var h = '<section class="sez"><div class="testata"><p class="lbl">Il libro</p><h2>' + esc(L.titolo) + '</h2><p class="sotto">' + esc(L.sotto) + '</p></div>' +
      '<div class="regalo">' + immagineCover(L, "cover-piccola") + '<div>' +
      '<p class="lbl" style="margin-bottom:.6rem">Per te</p>' + bottoniLibro(L) + '</div></div>' +
      '<div class="prosa"><p class="lbl">Per qualcuno a cui non sai come dirlo</p>' +
      '<p>Si regala bene: molto bianco, righe corte, si apre a caso. Oppure mandagli solo questo capitolo, gratis, e lascia che sia lui a decidere.</p>' +
      '<div class="azioni">' +
      (L.cartaceo ? '<a class="btn btn-vuoto" href="' + esc(L.cartaceo) + '" target="_blank" rel="noopener">Regala il cartaceo</a>' : "") +
      (s.capitolo_pdf ? '<button class="btn btn-vuoto" type="button" data-condividi="capitolo" data-inizio="' + (s.inizio || "") + '" data-id="' + (s.id || "") + '">Mandagli il capitolo, gratis</button>' : "") +
      '</div></div></section>';
    return h;
  }

  /* ---------- viste ---------- */
  function vistaOggi(){
    var s = settimanaCorrente(), d = oggi(), n = indiceGiorno(d);
    var etich = d.toLocaleDateString("it-IT", {weekday:"long", day:"numeric", month:"long"});
    return '<section class="sez">' +
      '<div class="testata"><p class="lbl">' + esc(etich) + '</p><h1>' + esc(s.titolo) + '</h1><p class="sotto">La settimana, dal libro «' + esc(libroDi(s).titolo) + '», ' + esc(capBreve(s)) + '.</p></div>' +
      cartaPost(s, n, {etichetta:"La riga di oggi", linkPagina:true}) +
      '</section>' +
      '<section class="sez"><p class="prosa muted piccolo">Una riga al giorno, una pagina a settimana. Niente da fare, niente da imparare: se una riga ti somiglia, passala a chi ne ha bisogno.</p></section>' +
      invitoPratica(null) + piede();
  }

  function vistaSettimana(inizio){
    var s = inizio ? trovaSettimana(inizio) : settimanaCorrente();
    if (!s) return nonTrovato();
    var L = libroDi(s), d = oggi(), nOggi = (iso(d) >= s.inizio && settimanaCorrente() === s) ? indiceGiorno(d) : -1;
    var h = '<section class="sez"><div class="testata"><p class="lbl">Settimana dal ' + esc(dataItaliana(s.inizio)) + '</p><h1>' + esc(s.titolo) + '</h1>' +
      '<p class="sotto">Da «' + esc(L.titolo) + '», capitolo ' + esc(s.capitolo) + '.</p></div>' +
      '<div class="prosa">' + s.problema.map(function(p){ return "<p>" + esc(p) + "</p>"; }).join("") + '</div>' +
      SOGLIA +
      '<div class="pagina"><p class="lbl" style="margin-bottom:1rem">La pagina</p><p class="versi">' + versi(s.pagina) + '</p></div>' +
      '<p class="riga-via">' + esc(s.riga) + '</p>' +
      '<div class="azioni"><button class="btn btn-pieno" type="button" data-condividi="pagina" data-inizio="' + s.inizio + '">Passa la pagina a qualcuno</button></div>' +
      '</section>' +
      blocco3(s) +
      '<section class="sez"><div class="testata"><p class="lbl">Le sette righe della settimana</p></div><ul class="lista">' +
      s.post.map(function(p, i){
        return '<li><p class="lbl">' + esc(p.giorno) + (i === nOggi ? ' <span class="oggi-segno">· oggi</span>' : "") + '</p>' +
          '<p class="versi">' + versi(p.righe) + '</p>' +
          '<div class="azioni-mini"><button class="btn btn-linea" type="button" data-condividi="post" data-inizio="' + s.inizio + '" data-n="' + i + '">Passala a qualcuno</button></div></li>';
      }).join("") + '</ul></section>' + piede();
    return h;
  }

  function vistaPost(inizio, n){
    var s = trovaSettimana(inizio);
    n = +n;
    if (!s || !(n >= 0 && n < 7)) return nonTrovato();
    return '<section class="sez"><div class="testata"><p class="lbl">Davide Scuderi · ' + esc(s.titolo) + '</p></div>' +
      cartaPost(s, n, {etichetta:s.post[n].giorno, linkPagina:true}) +
      '<p class="prosa muted piccolo">Questa riga viene da un libro. La pagina intera, e da dove nasce, sono qui sopra. Ogni giorno ce n\'è una nuova.</p>' +
      '<div class="azioni"><a class="btn btn-vuoto" href="#oggi">La riga di oggi</a></div></section>' + piede();
  }

  function vistaArchivio(){
    var lista = dati.settimane.slice().reverse(), corr = settimanaCorrente();
    return '<section class="sez"><div class="testata"><p class="lbl">Archivio</p><h1>Le settimane</h1></div><ul class="lista">' +
      lista.map(function(s){
        return '<li><a class="blocco" href="#settimana/' + s.inizio + '"><p class="lbl">Dal ' + esc(dataItaliana(s.inizio)) + (s === corr ? ' <span class="oggi-segno">· in corso</span>' : "") + '</p>' +
          '<p class="titolo">' + esc(s.titolo) + '</p><p class="muted piccolo"><em>' + esc(s.riga) + '</em></p></a></li>';
      }).join("") + '</ul></section>' + piede();
  }

  function vistaLibri(){
    var ordine = ["duau", "sv", "pac", "vds"];
    return '<section class="sez"><div class="testata"><p class="lbl">I libri</p><h1>I libri, in un solo posto</h1><p class="sotto">Il corpo, e quello che ha imparato a reggere per essere amato.</p></div>' +
      ordine.map(function(k){ var L = LIBRI[k];
        return '<div class="libro' + (L.cover ? '' : ' senza-cover') + '">' + immagineCover(L, "") + '<div><h3>' + esc(L.titolo) + '</h3><p class="muted piccolo">' + esc(L.sotto) + '</p>' + bottoniLibro(L, true) +
          '<div class="azioni-mini"><button class="btn btn-linea" type="button" data-condividi="libro" data-libro="' + esc(k) + '">Passalo a qualcuno</button></div>' +
          '</div></div>';
      }).join("") +
      '<p class="muted piccolo prosa">L\'ebook comprato dal sito arriva subito, in PDF ed EPUB, con l\'email dell\'acquirente stampata. Il cartaceo lo stampa Amazon.</p></section>' +
      sezioneCantiere() + piede();
  }

  function vistaDimmi(){
    return '<section class="sez"><div class="testata"><p class="lbl">Dimmi tu</p><h1>Di cosa vuoi che parli qui</h1>' +
      '<p class="sotto">Questa è una versione di prova. Quello che scrivi arriva a me, e decide le prossime settimane.</p></div>' +
      '<form id="modulo-dimmi" class="sez"><div><p class="lbl" style="margin-bottom:.7rem">Gli argomenti che ti riguardano</p><div class="scelte">' +
      TEMI_DIMMI.map(function(t){ return '<label><input type="checkbox" name="tema" value="' + esc(t) + '">' + esc(t) + '</label>'; }).join("") + '</div></div>' +
      '<div><p class="lbl" style="margin-bottom:.7rem">Se vuoi, due righe</p><textarea name="testo" placeholder="Cosa ti è rimasto addosso di quello che hai letto. O cosa non trovi. E se l\'app ti ha dato problemi a installarla, scrivimelo qui: è la cosa che mi serve di più adesso."></textarea></div>' +
      '<div class="azioni"><button class="btn btn-pieno" type="submit" data-via="whatsapp">Mandalo su WhatsApp</button><button class="btn btn-vuoto" type="submit" data-via="email">Mandalo per email</button></div>' +
      '<p class="muted piccolo">Si apre WhatsApp o la posta col messaggio già scritto: lo leggi, lo cambi, lo mandi tu. Qui dentro non resta niente.</p></form></section>' + piede();
  }

  function sezioneCantiere(){
    var c = dati.cantiere || [];
    if (!c.length) return "";
    var lav = c.filter(function(x){ return x.stato === "lavorazione"; }), cant = c.filter(function(x){ return x.stato === "cantiere"; });
    var h = '<section class="sez"><div class="testata"><p class="lbl">I prossimi</p><h2>Quali vuoi leggere?</h2><p class="sotto">Libri sulle scene della vita di un uomo, non sui suoi problemi. Li scrivo uno alla volta: dimmi quali, e comincio da quelli.</p></div>';
    if (lav.length) h += '<div class="prosa">' + lav.map(function(x){ return '<div class="cantiere-libro"><p class="lbl">In lavorazione</p><p class="titolo">' + esc(x.titolo) + '</p><p class="muted piccolo">' + esc(x.sotto) + '</p><div class="azioni-mini"><a class="btn btn-linea" href="' + esc(urlAvvisami(x.titolo)) + '" target="_blank" rel="noopener">Avvisami quando esce</a></div></div>'; }).join("") + '</div>';
    h += '<form id="modulo-cantiere" class="sez"><div class="scelte scelte-lunghe">' +
      cant.map(function(x){ return '<label><input type="checkbox" name="libro" value="' + esc(x.titolo) + '">' + esc(x.titolo) + '</label>'; }).join("") + '</div>' +
      '<div class="azioni"><button class="btn btn-pieno" type="submit" data-via="whatsapp">Mandalo su WhatsApp</button><button class="btn btn-vuoto" type="submit" data-via="email">Per email</button></div>' +
      '<p class="muted piccolo">Si apre WhatsApp o la posta col messaggio già scritto: lo mandi tu. Qui non resta niente.</p></form></section>';
    return h;
  }
  vista.addEventListener("submit", function(ev){
    var f = ev.target.closest("#modulo-cantiere");
    if (!f) return;
    ev.preventDefault();
    var via = (ev.submitter && ev.submitter.getAttribute("data-via")) || "whatsapp";
    var libri = Array.prototype.map.call(f.querySelectorAll('input[name="libro"]:checked'), function(i){ return "«" + i.value + "»"; });
    if (!libri.length) return;
    var msg = "Ciao Davide, dei prossimi libri vorrei leggere " + libri.join(", ") + ".";
    if (via === "email") location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("I prossimi libri") + "&body=" + encodeURIComponent(msg);
    else window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
  });

  vista.addEventListener("submit", function(ev){
    var f = ev.target.closest("#modulo-dimmi");
    if (!f) return;
    ev.preventDefault();
    var via = (ev.submitter && ev.submitter.getAttribute("data-via")) || "whatsapp";
    var temi = Array.prototype.map.call(f.querySelectorAll('input[name="tema"]:checked'), function(i){ return i.value; });
    var testo = f.querySelector('textarea[name="testo"]').value.trim();
    var msg = "Ciao Davide, ti scrivo dalla tua app." +
      (temi.length ? "\nMi riguardano: " + temi.join(", ") + "." : "") +
      (testo ? "\n\n" + testo : "");
    if (via === "email") location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Dalla tua app") + "&body=" + encodeURIComponent(msg);
    else window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
  });

  function vistaInstalla(){
    var ua = navigator.userAgent, ios = /iPhone|iPad|iPod/.test(ua), android = /Android/.test(ua);
    var giaInstallata = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    var h = '<section class="sez"><div class="testata"><p class="lbl">Sul telefono</p><h1>Mettila tra le app</h1><p class="sotto">Un\'icona sulla schermata, si apre come un\'app, funziona anche senza rete.</p></div>';
    if (giaInstallata) h += '<p class="avviso">Ce l\'hai già: stai leggendo dall\'app installata.</p>';
    else {
      if (promptInstallazione) h += '<div class="azioni"><button class="btn btn-pieno" type="button" id="btn-installa-2">Installa adesso</button></div>';
      h += '<div class="prosa">' +
        (ios || !android ? '<p class="lbl">iPhone (Safari)</p><ol class="passi"><li>Tocca il pulsante <strong>Condividi</strong> in basso (il quadrato con la freccia).</li><li>Scorri e tocca <strong>Aggiungi alla schermata Home</strong>.</li><li>Tocca <strong>Aggiungi</strong>. L\'icona compare tra le app.</li></ol>' : "") +
        (android || !ios ? '<p class="lbl" style="margin-top:1rem">Android (Chrome)</p><ol class="passi"><li>Tocca i <strong>tre puntini</strong> in alto a destra.</li><li>Tocca <strong>Installa app</strong> oppure <strong>Aggiungi a schermata Home</strong>.</li><li>Conferma. L\'icona compare tra le app.</li></ol>' : "") +
        '<p class="muted piccolo">Se non trovi la voce, apri questo indirizzo in Safari (iPhone) o Chrome (Android), non dentro WhatsApp o Facebook: da lì non si può installare.</p></div>';
    }
    return h + '</section>' + piede();
  }

  function nonTrovato(){
    return '<section class="sez"><div class="testata"><h1>Questa pagina non c\'è.</h1></div><div class="azioni"><a class="btn btn-vuoto" href="#oggi">La riga di oggi</a></div></section>' + piede();
  }

  /* ---------- installazione ---------- */
  var promptInstallazione = null;
  var btnInstalla = document.getElementById("btn-installa");
  function installa(){
    if (!promptInstallazione) { location.hash = "#installa"; return; }
    promptInstallazione.prompt();
    promptInstallazione.userChoice.then(function(){ promptInstallazione = null; btnInstalla.hidden = true; });
  }
  window.addEventListener("beforeinstallprompt", function(e){ e.preventDefault(); promptInstallazione = e; btnInstalla.hidden = false; });
  window.addEventListener("appinstalled", function(){ promptInstallazione = null; btnInstalla.hidden = true; });
  btnInstalla.addEventListener("click", installa);
  vista.addEventListener("click", function(ev){ if (ev.target.id === "btn-installa-2") installa(); });
  (function(){
    var standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    if (!standalone && /iPhone|iPad|iPod/.test(navigator.userAgent)) btnInstalla.hidden = false;   // su iPhone il bottone spiega come si fa
  })();

  /* ---------- trova la pagina (quello che gira sotto) ----------
     Ogni pagina porta le situazioni che racconta e i segni del corpo che nomina.
     Punteggio: 3 se ha la situazione scelta (+1 se è la sua situazione principale),
     +1 per ogni segno del corpo in comune. Nessun modello, nessuna rete: solo questo. */
  function trovaPagina(id){
    for (var i = 0; i < (dati.pagine || []).length; i++) if (dati.pagine[i].id === id) return dati.pagine[i];
    return null;
  }
  function voceSituazione(k){ for (var i = 0; i < dati.situazioni.length; i++) if (dati.situazioni[i].chiave === k) return dati.situazioni[i].voce; return k; }
  function voceCorpo(k){ for (var i = 0; i < dati.corpo.length; i++) if (dati.corpo[i].chiave === k) return dati.corpo[i].voce; return k; }
  function trovaArea(k){ for (var i = 0; i < (dati.aree || []).length; i++) if (dati.aree[i].chiave === k) return dati.aree[i]; return null; }
  function pagineDi(situazione){
    return (dati.pagine || []).filter(function(pg){ return pg.situazioni.indexOf(situazione) >= 0; })
      .sort(function(a, b){
        var pa = (a.situazioni[0] === situazione ? 0 : 1) + (libroDi(a).inLavorazione ? 0.5 : 0);
        var pb = (b.situazioni[0] === situazione ? 0 : 1) + (libroDi(b).inLavorazione ? 0.5 : 0);
        return pa - pb;
      });
  }
  function scale(passi){   // le briciole: dove sei, e come si torna indietro
    return '<p class="perche scala">' + passi.map(function(p, i){
      return (i ? " › " : "") + (p.href ? '<a href="' + esc(p.href) + '">' + esc(p.voce) + '</a>' : esc(p.voce));
    }).join("") + '</p>';
  }

  function vistaTrova(a1, a2){
    if (!dati.pagine || !dati.pagine.length) return '<section class="sez"><div class="testata"><p class="lbl">Il bibliotecario</p><h1>Le pagine stanno arrivando.</h1></div></section>' + piede();

    // primo livello: le aree
    if (!a1) {
      return '<section class="sez"><div class="testata"><p class="lbl">Il bibliotecario</p><h1>Cosa ti sta succedendo?</h1>' +
        '<p class="sotto">Qui c\'è un bibliotecario che conosce a memoria i libri di Davide. Non dà risposte. Ti accompagna fino alla pagina in cui il tuo problema è già scritto, e lì si fa da parte: la risposta, se c\'è, è tua.</p></div>' +
        '<ul class="lista">' + dati.aree.map(function(ar){
          return '<li><a class="blocco" href="#trova/' + esc(ar.chiave) + '"><p class="titolo">' + esc(ar.voce) + '</p><p class="muted piccolo">' +
            esc(ar.situazioni.map(voceSituazione).slice(0, 3).join(" · ")) + (ar.situazioni.length > 3 ? " · …" : "") + '</p></a></li>';
        }).join("") + '</ul></section>' + piede();
    }

    var area = trovaArea(a1);
    if (!area) return nonTrovato();

    // secondo livello: le situazioni dell'area
    if (!a2) {
      return '<section class="sez">' + scale([{voce:"Il bibliotecario", href:"#trova"}, {voce:area.voce}]) +
        '<div class="testata"><p class="lbl">' + esc(area.voce) + '</p><h1>Più preciso.</h1><p class="sotto">Tocca la cosa che ti somiglia di più. Se nessuna è esatta, prendi quella vicina.</p></div>' +
        '<ul class="lista">' + area.situazioni.map(function(k){
          var n = pagineDi(k).length;
          return '<li><a class="blocco" href="#trova/' + esc(area.chiave) + '/' + esc(k) + '"><p class="titolo">' + esc(voceSituazione(k)) + '</p>' +
            '<p class="muted piccolo">' + n + (n === 1 ? " pagina" : " pagine") + '</p></a></li>';
        }).join("") + '</ul>' +
        '<div class="azioni"><a class="btn btn-linea" href="#trova">Un altro argomento</a></div></section>' + piede();
    }

    var pagine = pagineDi(a2);
    if (!pagine.length) {
      return '<section class="sez">' + scale([{voce:"Il bibliotecario", href:"#trova"}, {voce:area.voce, href:"#trova/" + area.chiave}, {voce:voceSituazione(a2)}]) +
        '<div class="testata"><h1>Per questo non ho una pagina.</h1><p class="sotto">Non voglio darti una frase per riempire il vuoto. Se vuoi, c\'è la pagina della settimana; e il WhatsApp di Davide legge tutto.</p></div>' +
        '<div class="azioni"><a class="btn btn-vuoto" href="#settimana">La pagina della settimana</a><a class="btn btn-vuoto" href="https://wa.me/' + WHATSAPP + '" target="_blank" rel="noopener">Scrivi a Davide</a></div></section>' + piede();
    }

    // una sola pagina: si apre
    if (pagine.length === 1) return vistaPagina(pagine[0].id, area.chiave, a2);

    // terzo livello: il momento preciso, con le parole dei libri
    return '<section class="sez">' + scale([{voce:"Il bibliotecario", href:"#trova"}, {voce:area.voce, href:"#trova/" + area.chiave}, {voce:voceSituazione(a2)}]) +
      '<div class="testata"><p class="lbl">' + esc(voceSituazione(a2)) + '</p><h1>Qual è la tua?</h1><p class="sotto">Ogni riga è una pagina diversa. Scegli quella che ti somiglia adesso.</p></div>' +
      '<ul class="lista">' + pagine.map(function(pg){
        var L = libroDi(pg);
        return '<li><a class="blocco" href="#pagina/' + esc(pg.id) + '?da=' + esc(area.chiave) + '.' + esc(a2) + '"><p class="titolo">' + esc(pg.voce) + '</p>' +
          '<p class="muted piccolo">«' + esc(L.titolo) + '»' + (L.inLavorazione ? ", in lavorazione" : "") + ' · ' + esc(capBreve(pg)) + '</p></a></li>';
      }).join("") + '</ul>' +
      '<div class="azioni"><a class="btn btn-linea" href="#trova/' + esc(area.chiave) + '">Un\'altra cosa</a></div></section>' + piede();
  }

  function paginaTrovata(pg, perche){
    var L = libroDi(pg);
    return '<section class="sez"><div class="testata"><p class="lbl">La pagina per te</p><h1>' + esc(pg.voce) + '</h1>' +
      '<p class="sotto">Da «' + esc(L.titolo) + '»' + (L.inLavorazione ? ', libro in lavorazione' : '') + ', capitolo ' + esc(pg.capitolo) + '.</p></div>' +
      '<div class="pagina"><p class="versi">' + versi(pg.pagina) + '</p></div>' +
      '<div class="domanda-libro"><p class="lbl" style="margin-bottom:.7rem">La domanda del libro</p><p class="versi">' + versi(pg.domanda) + '</p></div>' +
      (perche ? '<p class="perche">' + esc(perche) + ' Nessuna intelligenza artificiale: le pagine portano scritto di cosa parlano, e io le confronto con quello che hai toccato.</p>' : "") +
      '<div class="azioni"><button class="btn btn-pieno" type="button" data-condividi="trovata" data-id="' + esc(pg.id) + '">Passala a qualcuno</button></div>' +
      '</section>' + blocco3(pg);
  }

  function blocchiPratica(pr){   // il copione è una lista di righe; la riga vuota è la pausa lunga
    if (pr.blocchi) return pr.blocchi;
    var out = [], cur = [];
    (pr.copione || []).forEach(function(r){ if (r.trim()) cur.push(r); else if (cur.length) { out.push(cur); cur = []; } });
    if (cur.length) out.push(cur);
    return out;
  }
  function trovaPratica(chiave){
    for (var i = 0; i < (dati.pratiche || []).length; i++) if (dati.pratiche[i].corpo === chiave) return dati.pratiche[i];
    return null;
  }
  /* la pratica si sceglie dal segno del corpo che la persona ha toccato; se non ne ha toccati,
     dal primo segno che la pagina nomina; se non c'è niente, non si propone niente */
  function praticaPer(segniToccati, pg){   // prima il segno toccato, poi quelli che la pagina nomina
    var liste = [segniToccati || [], (pg && pg.corpo) || []];
    for (var l = 0; l < liste.length; l++) for (var i = 0; i < liste[l].length; i++) { var pr = trovaPratica(liste[l][i]); if (pr) return pr; }
    return null;
  }
  function invitoPratica(pr){
    if (!dati.pratiche || !dati.pratiche.length) return "";
    return '<section class="sez invito"><p class="lbl">Se vuoi, un minuto col corpo</p>' +
      (pr ? '<p>Una pratica di un minuto: una mano sul punto del corpo che hai toccato, e niente altro da fare. La voce di Davide ti accompagna.</p><div class="azioni"><a class="btn btn-vuoto" href="#pratica/' + esc(pr.corpo) + '">' + esc(pr.titolo) + '</a></div>'
          : '<p>Sedici pratiche di un minuto: una mano sul punto del corpo che senti tirare, e niente altro da fare. Con la voce di Davide.</p><div class="azioni"><a class="btn btn-vuoto" href="#pratica">Scegli il punto del corpo</a></div>') +
      '</section>';
  }
  function vistaPratica(chiave){
    if (!dati.pratiche || !dati.pratiche.length) return nonTrovato();
    if (!chiave) {   // la lista: prima l'ascolto intero, poi i punti
      var intero = dati.pratiche.filter(function(x){ return x.corpo === "tutto"; });
      var punti = dati.pratiche.filter(function(x){ return x.corpo !== "tutto"; });
      function riga(x){
        return '<li><a class="blocco" href="#pratica/' + esc(x.corpo) + '"><p class="titolo">' + esc(voceCorpo(x.corpo)) + '</p>' +
          '<p class="muted piccolo">' + esc(x.titolo) + (x.audio ? " · con la voce di Davide" : "") + '</p></a></li>';
      }
      return '<section class="sez"><div class="testata"><p class="lbl">Un minuto col corpo</p><h1>Da dove cominci?</h1>' +
        '<p class="sotto">Una mano dove senti, e un minuto. Non è una cura: è quello che il libro chiede di fare.</p></div>' +
        (intero.length ? '<ul class="lista">' + intero.map(riga).join("") + '</ul><p class="lbl" style="margin-top:1.6rem">Oppure un punto solo</p>' : "") +
        '<ul class="lista">' + punti.map(riga).join("") + '</ul></section>' + piede();
    }
    var pr = trovaPratica(chiave);
    if (!pr) return nonTrovato();
    var testo = pr.copione.map(function(r){ return r.trim() ? '<span>' + esc(r) + '</span>' : '<span class="pausa"></span>'; }).join("\n");
    return '<section class="sez"><div class="testata"><p class="lbl">Un minuto col corpo · ' + esc(voceCorpo(pr.corpo)) + '</p><h1>' + esc(pr.titolo) + '</h1>' +
      '<p class="sotto">' + (pr.audio ? 'Con la voce di Davide, circa ' + (pr.durata ? Math.round(pr.durata / 15) * 15 : 80) + ' secondi. Oppure leggilo tu, piano.' : 'Leggilo piano, una riga alla volta. La voce di Davide arriva più avanti.') + '</p></div>' +
      (pr.audio ? '<audio controls preload="none" src="audio/' + esc(pr.audio) + '" style="width:100%"></audio>' : "") +
      '<div class="copione">' + testo + '</div>' +
      '<p class="muted piccolo">Non è una cura e non promette niente: è un minuto di ascolto. Un dolore vero si porta dal medico.</p></section>' +
      '<section class="sez somiglia" data-pratica="1"><p class="lbl">È stata utile?</p>' +
      '<div class="azioni"><button class="btn btn-vuoto" type="button" data-somiglia="si">Sì</button><button class="btn btn-vuoto" type="button" data-somiglia="no">No</button></div>' +
      '<p class="muted piccolo" data-esito></p></section>' +
      '<section class="sez"><div class="azioni"><a class="btn btn-linea" href="#pratica">Un altro punto del corpo</a></div></section>' + piede();
  }

  function vistaPagina(id, area, situazione){
    var pg = trovaPagina(id);
    if (!pg) return nonTrovato();
    var da = (location.hash.split("?da=")[1] || "").split("&")[0];
    if (!area && da) { area = da.split(".")[0]; situazione = da.split(".")[1]; }
    var ar = trovaArea(area);
    var briciole = ar ? scale([{voce:"Il bibliotecario", href:"#trova"}, {voce:ar.voce, href:"#trova/" + ar.chiave},
      {voce:voceSituazione(situazione), href:"#trova/" + ar.chiave + "/" + situazione}]) : "";
    var altre = situazione ? pagineDi(situazione).filter(function(x){ return x.id !== pg.id; }) : [];
    return briciole + paginaTrovata(pg, "") +
      invitoPratica(praticaPer([], pg)) +
      '<section class="sez somiglia" data-altra="' + (altre.length ? altre[0].id : "") + '"><p class="lbl">Era la tua pagina?</p>' +
      '<div class="azioni"><button class="btn btn-vuoto" type="button" data-somiglia="si">Sì</button><button class="btn btn-vuoto" type="button" data-somiglia="no">No</button></div>' +
      '<p class="muted piccolo" data-esito></p></section>' +
      '<section class="sez"><div class="azioni"><a class="btn btn-linea" href="' + (ar ? "#trova/" + ar.chiave + (situazione ? "/" + situazione : "") : "#trova") + '">Un\'altra pagina</a></div></section>' + piede();
  }

  vista.addEventListener("click", function(ev){
    var b = ev.target.closest("[data-somiglia]");
    if (!b) return;
    var sez = b.closest(".somiglia"), esito = sez.querySelector("[data-esito]"), altra = sez.getAttribute("data-altra");
    sez.querySelectorAll("[data-somiglia]").forEach(function(x){ x.disabled = true; x.style.opacity = ".5"; });
    var si = b.getAttribute("data-somiglia") === "si";
    if (sez.getAttribute("data-pratica")) {
      esito.innerHTML = si ? "Bene. La trovi sempre qui, quando serve."
        : 'Va bene lo stesso: non tutte funzionano per tutti. <a href="#pratica">Provane un\'altra</a>, o <a href="#dimmi">dimmi cosa non ha funzionato</a>.';
    } else if (si) esito.textContent = "Allora è tua. Se ti va, passala a qualcuno a cui somiglia.";
    else if (altra) esito.innerHTML = 'Allora non era quella. <a href="#pagina/' + esc(altra) + '">Prova l\'altra pagina</a>, oppure <a href="#trova">ricomincia</a>.';
    else esito.innerHTML = 'Allora non era quella. <a href="#trova">Ricomincia</a>, oppure <a href="#dimmi">dimmi cosa cercavi</a>.';
  });

  /* ---------- rotte ---------- */
  function mostra(){
    if (!dati) return;
    var h = (location.hash || "#oggi").slice(1).split("/");
    var sez = h[0] || "oggi", html;
    switch (sez) {
      case "oggi": html = vistaOggi(); break;
      case "settimana": html = vistaSettimana(h[1]); break;
      case "post": html = vistaPost(h[1], h[2]); break;
      case "archivio": html = vistaArchivio(); break;
      case "trova": html = vistaTrova(h[1], h[2]); break;
      case "pagina": html = vistaPagina((h[1] || "").split("?")[0]); break;
      case "pratica": html = vistaPratica(h[1]); break;
      case "pratica": html = vistaPratica(h[1]); break;
      case "libri": html = vistaLibri(); break;
      case "dimmi": html = vistaDimmi(); break;
      case "installa": html = vistaInstalla(); break;
      default: html = nonTrovato();
    }
    vista.innerHTML = html;
    document.querySelectorAll(".barra a").forEach(function(a){
      var mia = a.getAttribute("data-sez");
      var attiva = mia === sez || (mia === "settimana" && (sez === "post" || sez === "archivio")) || (mia === "trova" && (sez === "pagina" || sez === "pratica"));
      if (attiva) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", mostra);

  fetch("contenuti.json", {cache:"no-cache"}).then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function(d){
      if (!d.settimane || !d.settimane.length) throw new Error("vuoto");
      dati = d; mostra();
    })
    .catch(function(){
      vista.innerHTML = '<section class="sez"><div class="testata"><h1>Non riesco a leggere le pagine.</h1><p class="sotto">Controlla la rete e riprova tra un momento.</p></div><div class="azioni"><button class="btn btn-vuoto" type="button" onclick="location.reload()">Riprova</button></div></section>';
    });

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(function(){});
})();
