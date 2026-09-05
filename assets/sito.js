/* ============================================================
   Comportamenti del sito. Tre cose, niente librerie.
   1. i link di vendita presi da config.js
   2. i moduli email (iscrizione al percorso)
   3. la fascetta dei cookie, che compare solo se c'è un pixel
   ============================================================ */
(function(){
  "use strict";
  var C = window.SITO || {};

  /* ---------- 1. LINK DI VENDITA ---------------------------
     <a data-link="duauEbook">…</a> prende l'indirizzo da
     config.js. Se manca, il bottone diventa «In arrivo».

     Per le chiavi che finiscono in "Ebook", se in config.js
     C.gumroad[chiave] è compilato, il bottone vende direttamente
     dal sito (finestra Gumroad sopra la pagina) invece di
     mandare ad Amazon. Se è vuoto, non cambia niente: si
     comporta come prima (Amazon in nuova scheda, o «In arrivo»).
  ---------------------------------------------------------- */
  var gumroadUsato = false;
  document.querySelectorAll("[data-link]").forEach(function(a){
    var chiave  = a.getAttribute("data-link");
    var gumroad = chiave.slice(-5) === "Ebook" ? (C.gumroad || {})[chiave] : "";
    var url     = (C.amazon || {})[chiave];       // Amazon: nuova scheda

    if(gumroad){
      gumroadUsato = true;
      a.setAttribute("href", gumroad);
      a.classList.add("gumroad-button");
      a.removeAttribute("target");
      a.removeAttribute("rel");
      a.removeAttribute("aria-disabled");
      a.style.opacity = "";
      a.style.pointerEvents = "";
      if(a.dataset.testoGumroad) a.textContent = a.dataset.testoGumroad;
    } else if(url){
      a.setAttribute("href", url);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    } else {
      a.removeAttribute("href");
      a.setAttribute("aria-disabled", "true");
      a.style.opacity = ".55";
      a.style.pointerEvents = "none";
      if(a.dataset.attesa !== "no") a.textContent = a.dataset.attesa || "In arrivo";
    }
  });

  // lo script dell'overlay Gumroad si carica solo se serve davvero:
  // finché tutti i link gumroad sono vuoti, il sito non lo tocca.
  if(gumroadUsato){
    var scriptGumroad = document.createElement("script");
    scriptGumroad.src = "https://gumroad.com/js/gumroad.js";
    document.head.appendChild(scriptGumroad);
  }

  // contatti in fondo alle pagine
  document.querySelectorAll("[data-contatto=email]").forEach(function(el){
    if(C.emailPubblica){
      el.innerHTML = '<a href="mailto:' + C.emailPubblica + '">' + C.emailPubblica + '</a>';
    }
  });

  /* ---------- 1c. RIGA "ANCHE SU AMAZON" ------------------
     <a data-link-amazon="duauEbook">…</a> è una riga piccola sotto
     il bottone Gumroad: porta comunque all'edizione Kindle, che
     con Gumroad attivo il bottone principale non raggiunge più.
     Non tocca la logica di data-link qui sopra.
  ---------------------------------------------------------- */
  document.querySelectorAll("[data-link-amazon]").forEach(function(a){
    var chiave = a.getAttribute("data-link-amazon");
    var url    = (C.amazon || {})[chiave];
    if(url){
      a.setAttribute("href", url);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    } else {
      a.style.display = "none";
    }
  });

  /* ---------- 1d. UTM: catturati all'arrivo, portati al modulo ---
     Letti da location.search al primo caricamento della pagina e
     salvati in sessionStorage, così restano anche se la persona
     gira fra le pagine del sito prima di lasciare la mail.
  ---------------------------------------------------------- */
  (function(){
    var parametri = new URLSearchParams(location.search);
    ["utm_source", "utm_campaign", "utm_content"].forEach(function(chiave){
      var valore = parametri.get(chiave);
      if(valore){
        try { sessionStorage.setItem(chiave, valore); } catch(e){}
      }
    });
  })();

  function leggiUTM(chiave){
    try { return sessionStorage.getItem(chiave) || ""; } catch(e){ return ""; }
  }

  /* ---------- 2. MODULI EMAIL ------------------------------
     Il modulo manda i dati al servizio email (Brevo/MailerLite)
     e porta alla pagina di ringraziamento. Se l'indirizzo non
     è ancora configurato lo dice, invece di fingere.
  ---------------------------------------------------------- */
  var MAPPA_UTM = { UTM_SOURCE:"utm_source", UTM_CAMPAIGN:"utm_campaign", UTM_CONTENUTO:"utm_content" };

  /* ---------- 2a. EVENTI DI CONVERSIONE --------------------
     Dopo un'iscrizione riuscita, se il consenso ai cookie di
     misurazione è già stato dato (quindi Meta/Google sono già
     accesi), avvisa i due: Lead per Meta, conversion per Google
     Ads (solo se in config.js è compilata l'etichetta). Non
     tocca il redirect: fbq/gtag mettono l'evento in coda e
     tornano subito, il redirect segue il suo tempo (500 ms) già
     previsto da vaiAlGrazie, quindi il ritardo aggiunto è ~0 ms.
  ---------------------------------------------------------- */
  function segnalaConversione(origine){
    var consenso = null;
    try { consenso = localStorage.getItem("consenso-misurazione"); } catch(e){}
    if(consenso !== "si") return;
    if(window.fbq){
      window.fbq("track", "Lead", { content_name: origine || "sito" });
    }
    if(window.gtag && C.googleAdsConversione){
      window.gtag("event", "conversion", { send_to: C.googleAdsConversione });
    }
  }

  document.querySelectorAll("form[data-modulo]").forEach(function(f){
    var esito   = f.parentNode.querySelector(".esito");
    var errore  = f.parentNode.querySelector(".errore");
    var origine = f.getAttribute("data-modulo");   // percorso | capitolo-* | estratto-carezze | avviso-senza-veli

    // riempie subito i campi nascosti UTM_*, così anche il ripiego
    // f.submit() (se la fetch a Brevo fallisce) li porta con sé
    Object.keys(MAPPA_UTM).forEach(function(nomeCampo){
      var campoUtm = f.querySelector('input[name=' + nomeCampo + ']');
      if(campoUtm) campoUtm.value = leggiUTM(MAPPA_UTM[nomeCampo]);
    });

    function dico(msg){
      if(!errore) return;
      errore.textContent = msg;
      errore.classList.add("visibile");
    }

    f.addEventListener("submit", function(e){
      e.preventDefault();
      if(errore) errore.classList.remove("visibile");

      var campo = f.querySelector("input[type=email]");
      var ok    = f.querySelector("input[type=checkbox]");
      if(!campo.value || campo.validity.valid === false){
        dico("Controlla l'indirizzo: manca qualcosa."); return;
      }
      if(ok && !ok.checked){
        dico("Serve la spunta: senza il tuo consenso non posso scriverti."); return;
      }
      if(!C.modulo){
        dico("Il modulo non è ancora collegato al servizio email. "
           + "Apri SITO/assets/config.js e compila il campo «modulo».");
        return;
      }

      var dati = new FormData();
      dati.append(C.campoEmail || "EMAIL", campo.value);
      Object.keys(C.campiExtra || {}).forEach(function(k){
        dati.append(k, C.campiExtra[k]);
      });
      dati.append("ORIGINE", origine || "sito");     // da quale pagina è arrivato
      Object.keys(MAPPA_UTM).forEach(function(nomeCampo){
        dati.append(nomeCampo, leggiUTM(MAPPA_UTM[nomeCampo]));   // vuoto se non c'è
      });

      var bottone = f.querySelector("button");
      if(bottone){ bottone.disabled = true; bottone.textContent = "Un attimo…"; }

      fetch(C.modulo, { method:"POST", body:dati, mode:"no-cors" })
        .then(function(){ vaiAlGrazie(); })
        .catch(function(){
          // se la richiesta non parte, si lascia fare al browser
          f.setAttribute("action", C.modulo);
          f.setAttribute("method", "POST");
          f.submit();
        });
    });

    function vaiAlGrazie(){
      if(esito) esito.classList.add("visibile");
      segnalaConversione(origine);
      var base = location.pathname.replace(/[^\/]*$/, "");
      setTimeout(function(){
        location.href = base + "grazie.html?da=" + encodeURIComponent(origine || "sito");
      }, 500);
    }
  });

  /* ---------- 3. COOKIE E PIXEL ----------------------------
     Nessun cookie di terze parti prima dell'assenso. Se in
     config.js non c'è nessun pixel, la fascetta non compare
     e il sito non traccia niente: è lo stato di partenza.
  ---------------------------------------------------------- */
  var CHIAVE = "consenso-misurazione";

  function accendiGoogle(){
    if(!C.googleAds) return;
    // Consent Mode: il tag parte già con il consenso concesso,
    // perché questa funzione viene chiamata solo dopo l'assenso.
    var s1 = document.createElement("script");
    s1.async = true;
    s1.src = "https://www.googletagmanager.com/gtag/js?id=" + C.googleAds;
    document.head.appendChild(s1);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("consent", "default", {
      ad_storage: "granted", ad_user_data: "granted",
      ad_personalization: "granted", analytics_storage: "granted"
    });
    gtag("js", new Date());
    gtag("config", C.googleAds);
  }

  function accendiPixel(){
    if(!C.pixelMeta) return;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq("init", C.pixelMeta);
    window.fbq("track", "PageView");
  }

  var avviso = document.getElementById("avviso-cookie");
  var scelta = null;
  try { scelta = localStorage.getItem(CHIAVE); } catch(e){}

  function accendiTutto(){ accendiPixel(); accendiGoogle(); }

  if(C.pixelMeta || C.googleAds){
    if(scelta === "si"){
      accendiTutto();
    } else if(scelta !== "no" && avviso){
      avviso.classList.add("visibile");
      avviso.querySelector("[data-cookie=si]").addEventListener("click", function(){
        try { localStorage.setItem(CHIAVE, "si"); } catch(e){}
        avviso.classList.remove("visibile");
        accendiTutto();
      });
      avviso.querySelector("[data-cookie=no]").addEventListener("click", function(){
        try { localStorage.setItem(CHIAVE, "no"); } catch(e){}
        avviso.classList.remove("visibile");
      });
    }
  }

  /* Ripensarci: il link «rivedi le tue scelte» nell'informativa.
     Cancella la scelta e rimostra la fascetta; se in questa pagina
     la fascetta non c'è, porta alla home, dove c'è. */
  document.addEventListener("click", function(e){
    var l = e.target.closest ? e.target.closest("[data-cookie=rivedi]") : null;
    if(!l) return;
    e.preventDefault();
    try { localStorage.removeItem(CHIAVE); } catch(err){}
    if(avviso && (C.pixelMeta || C.googleAds)){
      avviso.classList.add("visibile");
      avviso.scrollIntoView({behavior:"smooth",block:"nearest"});
    } else {
      location.href = "index.html";
    }
  });

  /* ---------- 4. LA FRASE DEL GIORNO -----------------------
     Ruota sul giorno dell'anno: uguale per tutti, cambia da sé.
  ---------------------------------------------------------- */
  var contenitore = document.getElementById("frase-oggi");
  if(contenitore){
    var frasi = [
      ["Essere necessario non è la stessa cosa che essere amato.", "Da uomo a uomo · capitolo 5"],
      ["Il corpo non smette di sentire solo perché tu hai smesso di ascoltarlo.", "Da uomo a uomo · capitolo 2"],
      ["Chi sei, quando non devi più funzionare?", "Da uomo a uomo · capitolo 1"],
      ["Il vuoto chiede di essere riempito. Lo spazio può essere abitato.", "Da uomo a uomo · capitolo 8"],
      ["Un limite non dice chi sei. Dice soltanto dove sei.", "Da uomo a uomo · capitolo 13"],
      ["Non c'è niente da aggiustare. Solo un posto da riaprire. E quel posto sei tu.", "Da uomo a uomo · capitolo 2"],
      ["Il tuo corpo non è nato per essere guardato. È nato per essere abitato.", "Senza veli"],
      ["Non è che regge tutto. È che non ha mai avuto il permesso di mollare.", "Senza veli"],
      ["Non è il corpo il problema. È la distanza.", "Prenditi a carezze"],
      ["Il corpo non va capito. Va abitato.", "Prenditi a carezze"]
    ];
    var oggi   = new Date();
    var inizio = new Date(oggi.getFullYear(), 0, 0);
    var giorno = Math.floor((oggi - inizio) / 86400000);
    var scelta2 = frasi[giorno % frasi.length];
    contenitore.textContent = "«" + scelta2[0] + "»";
    var fonte = document.getElementById("frase-fonte");
    if(fonte) fonte.textContent = scelta2[1];
  }

  // anno nel piè di pagina
  document.querySelectorAll("[data-anno]").forEach(function(el){
    el.textContent = new Date().getFullYear();
  });

  /* ---------- 4b. GRAZIE.HTML: LA VARIANTE GIUSTA -----------
     Quattro blocchi nascosti in HTML (#grazie-percorso, #grazie-capitolo,
     #grazie-avviso, #grazie-pagine). Sceglie quello giusto dal parametro ?da=:
     - "avviso-senza-veli"                        → grazie-avviso
     - "capitolo", "capitolo-*", "estratto-carezze" → grazie-capitolo
     - "pagine"                                    → grazie-pagine
     - qualsiasi altro valore, o nessun parametro   → grazie-percorso
       (è il caso più frequente, ed è il testo che c'era prima delle varianti)
  ---------------------------------------------------------- */
  (function(){
    var percorsoEl = document.getElementById("grazie-percorso");
    var capitoloEl = document.getElementById("grazie-capitolo");
    var avvisoEl   = document.getElementById("grazie-avviso");
    var pagineEl   = document.getElementById("grazie-pagine");
    if(!percorsoEl && !capitoloEl && !avvisoEl && !pagineEl) return;   // non è grazie.html

    var da = new URLSearchParams(location.search).get("da") || "";
    var mostra;
    if(da === "avviso-senza-veli") mostra = avvisoEl;
    else if(da === "capitolo" || da.indexOf("capitolo-") === 0 || da === "estratto-carezze") mostra = capitoloEl;
    else if(da === "pagine") mostra = pagineEl;
    else mostra = percorsoEl;   // manca il parametro, o non è riconosciuto

    [percorsoEl, capitoloEl, avvisoEl, pagineEl].forEach(function(el){
      if(!el) return;
      if(el === mostra) el.removeAttribute("hidden");
      else el.setAttribute("hidden", "");
    });

    /* ---------- 4c. IL PDF GIUSTO, NON SEMPRE IL TRADIMENTO ------
       Dentro la variante "capitolo" c'è un link diretto al PDF, per
       chi non vuole aspettare l'email. Deve seguire l'ORIGINE, non
       essere sempre lo stesso file: un mancato incrocio qui offre
       il capitolo sbagliato a chi ne ha chiesto un altro. ---- */
    var PDF_DIRETTI = {
      "capitolo-tradimento": ["capitoli/da-uomo-a-uomo-capitolo-tradimento.pdf", "il PDF del capitolo sul tradimento"],
      "capitolo-separarsi":  ["capitoli/da-uomo-a-uomo-capitolo-separarsi.pdf",  "il PDF del capitolo su Separarsi"],
      "capitolo-figli":      ["capitoli/da-uomo-a-uomo-capitolo-figli.pdf",      "il PDF del capitolo sui figli"],
      "capitolo-solitudine": ["capitoli/da-uomo-a-uomo-capitolo-solitudine.pdf", "il PDF del capitolo sulla solitudine"],
      "capitolo-padre":      ["capitoli/da-uomo-a-uomo-capitolo-padre.pdf",      "il PDF del capitolo sulla famiglia d'origine"],
      "capitolo-senza-veli": ["capitoli/senza-veli-capitolo-la-donna-che-regge-tutto.pdf", "il PDF del capitolo"],
      "estratto-carezze":    ["capitoli/prenditi-a-carezze-estratto.pdf", "il PDF dell'estratto"]
    };
    var pdfRiga  = document.getElementById("grazie-pdf-diretto");
    var pdfLink  = document.getElementById("grazie-pdf-link");
    if(pdfRiga && pdfLink){
      var pdf = PDF_DIRETTI[da];
      if(pdf){
        pdfLink.setAttribute("href", pdf[0]);
        pdfLink.textContent = "scarica subito " + pdf[1];
        pdfRiga.removeAttribute("hidden");
      } else {
        pdfRiga.setAttribute("hidden", "");
      }
    }
  })();

  /* ---------- 5. CONDIVIDERE UNA PAGINA --------------------
     <div data-share data-share-title data-share-url data-share-desc>
     resta vuoto nell'HTML: i bottoni li costruisce qui sotto,
     con i marchi veri disegnati (nessuna libreria, nessun font
     di icone da scaricare).
  ---------------------------------------------------------- */
  var SEGNI = {
    whatsapp: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z",
    facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    instagram: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
    twitter: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zm-1.291 19.49h2.039L6.486 3.24H4.298z",
    email: "M1.5 4.5h21a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5h-21A1.5 1.5 0 010 18V6a1.5 1.5 0 011.5-1.5zm.9 2.4L12 13.05 21.6 6.9V6.6H2.4zM21.6 9.6l-9.06 5.79a1.02 1.02 0 01-1.08 0L2.4 9.6v7.8h19.2z",
    copia: "M8.4 1.2h11.4A2.4 2.4 0 0122.2 3.6v13.2h-2.4V3.6H8.4zM4.2 6h10.2a2.4 2.4 0 012.4 2.4v12A2.4 2.4 0 0114.4 22.8H4.2a2.4 2.4 0 01-2.4-2.4v-12A2.4 2.4 0 014.2 6zm0 2.4v12h10.2v-12z",
    fatto: "M9.55 17.65 4.4 12.5l1.4-1.4 3.75 3.75 8.65-8.65 1.4 1.4z"
  };

  function segno(nome){
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
         + '<path d="' + SEGNI[nome] + '"></path></svg>';
  }

  var CANALI = [
    { id:"whatsapp",  nome:"WhatsApp" },
    { id:"facebook",  nome:"Facebook" },
    { id:"instagram", nome:"Instagram" },
    { id:"twitter",   nome:"X" },
    { id:"email",     nome:"Email" },
    { id:"copia",     nome:"Copia il link" }
  ];

  document.querySelectorAll("[data-share]").forEach(function(scatola){
    var ogDesc = document.querySelector('meta[property="og:description"]');
    var titolo = scatola.getAttribute("data-share-title") || document.title;
    var url    = scatola.getAttribute("data-share-url")   || location.href;
    var testo  = scatola.getAttribute("data-share-desc")  || (ogDesc ? ogDesc.content : "");

    var indirizzi = {
      whatsapp: "https://wa.me/?text=" + encodeURIComponent(titolo + "\n" + url),
      facebook: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url),
      twitter:  "https://twitter.com/intent/tweet?text=" + encodeURIComponent(titolo) + "&url=" + encodeURIComponent(url),
      email:    "mailto:?subject=" + encodeURIComponent(titolo) + "&body=" + encodeURIComponent(testo + "\n\n" + url),
      // Instagram non accetta un link da fuori: si apre e basta, il
      // link lo mettiamo negli appunti (vedi più sotto).
      instagram: "https://www.instagram.com/"
    };

    // negli appunti, con un cenno sul bottone che l'ha chiesto
    function copiaNegliAppunti(bottone){
      function cenno(){
        bottone.innerHTML = segno("fatto");
        bottone.classList.add("fatto");
        setTimeout(function(){
          bottone.innerHTML = segno(bottone.dataset.segno);
          bottone.classList.remove("fatto");
        }, 1800);
      }
      // se gli appunti sono negati (permesso, browser vecchio) si ripiega
      // sul campo nascosto: in un modo o nell'altro il link arriva.
      function allaVecchia(){
        var campo = document.createElement("textarea");
        campo.value = url;
        campo.setAttribute("readonly", "");
        campo.style.position = "fixed";
        campo.style.opacity = "0";
        document.body.appendChild(campo);
        campo.focus();
        campo.select();
        campo.setSelectionRange(0, campo.value.length);
        try { if(document.execCommand("copy")){ cenno(); } } catch(e){}
        document.body.removeChild(campo);
      }
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(cenno, allaVecchia);
      } else {
        allaVecchia();
      }
    }

    CANALI.forEach(function(canale){
      var indirizzo = indirizzi[canale.id];
      var b = document.createElement(indirizzo ? "a" : "button");
      b.className = "condividi";
      b.dataset.segno = canale.id === "copia" ? "copia" : canale.id;
      b.innerHTML = segno(b.dataset.segno);
      b.setAttribute("aria-label", canale.nome);
      b.setAttribute("title", canale.nome);

      if(indirizzo){
        b.href = indirizzo;
        if(canale.id !== "email"){ b.target = "_blank"; b.rel = "noopener"; }
        if(canale.id === "instagram"){
          // Instagram si apre come un link normale (una finestra aperta a
          // mano finiva bloccata dal browser) e intanto il link va negli
          // appunti, già pronto da incollare nella storia. L'ordine conta:
          // appena la scheda nuova prende il fuoco il browser rifiuta di
          // scrivere negli appunti, quindi si copia prima di partire.
          b.setAttribute("title", "Copia il link e apri Instagram");
          b.setAttribute("aria-label", "Copia il link e apri Instagram");
          b.addEventListener("click", function(){ copiaNegliAppunti(b); });
        }
      } else {
        b.type = "button";
        b.addEventListener("click", function(){
          // sul telefono il foglio di condivisione del sistema fa di meglio
          if(navigator.share){
            navigator.share({ title:titolo, text:testo, url:url }).catch(function(){});
          } else {
            copiaNegliAppunti(b);
          }
        });
      }

      scatola.appendChild(b);
    });
  });

  /* ---------- 6. L'INDICE CHE SI SCEGLIE -------------------
     Sulla pagina di «Da uomo a uomo» i diciassette luoghi sono
     bottoni: si tocca quello che riguarda la persona e sotto
     compare la risposta. Cinque capitoli si aprono per intero
     (data-pdf sulla riga), gli altri rimandano al libro.
     Nessuna pagina nuova, nessun modulo di mezzo: chi arriva
     cercando «tradimento» o «separazione» entra da lì e legge.
  ---------------------------------------------------------- */
  (function(){
    var pannello = document.getElementById("scelta");
    var righe    = document.querySelectorAll(".luoghi .luogo");
    if(!pannello || !righe.length) return;

    var titolo  = document.getElementById("scelta-titolo");
    var sotto   = document.getElementById("scelta-sotto");
    var gratis  = document.getElementById("scelta-gratis");
    var libro   = document.getElementById("scelta-libro");
    var pagine  = document.getElementById("scelta-pagine");
    var pdf     = document.getElementById("scelta-pdf");

    righe.forEach(function(riga){
      riga.addEventListener("click", function(){
        var scelto = riga.getAttribute("aria-expanded") === "true";

        righe.forEach(function(altra){ altra.setAttribute("aria-expanded", "false"); });

        if(scelto){                       // secondo tocco sulla stessa riga: chiude
          pannello.hidden = true;
          return;
        }
        riga.setAttribute("aria-expanded", "true");

        titolo.textContent = riga.dataset.tit;
        var sottotitolo = riga.dataset.sot || "";
        sotto.textContent = sottotitolo;
        sotto.hidden = !sottotitolo;

        var file = riga.dataset.pdf;
        gratis.hidden = !file;
        libro.hidden  = !!file;
        if(file){
          pdf.href = file;
          pagine.textContent = riga.dataset.pagine || "";
        }

        pannello.hidden = false;
        pannello.scrollIntoView({ behavior:"smooth", block:"nearest" });

        // quale luogo tocca la gente è la cosa più utile da sapere di
        // questa pagina: l'evento parte solo col consenso già dato.
        var consenso = null;
        try { consenso = localStorage.getItem("consenso-misurazione"); } catch(e){}
        if(consenso === "si" && window.gtag){
          window.gtag("event", "select_content", {
            content_type: "capitolo",
            item_id: "duau-" + riga.dataset.cap
          });
        }
      });
    });
  })();
})();
