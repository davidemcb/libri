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
  ---------------------------------------------------------- */
  document.querySelectorAll("[data-link]").forEach(function(a){
    var chiave = a.getAttribute("data-link");
    var qui = (C.stripe || {})[chiave];       // ebook venduti qui (Stripe): stessa scheda
    var url = (C.amazon || {})[chiave];       // Amazon: nuova scheda
    if(qui){
      a.setAttribute("href", qui);
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

  // contatti in fondo alle pagine
  document.querySelectorAll("[data-contatto=email]").forEach(function(el){
    if(C.emailPubblica){
      el.innerHTML = '<a href="mailto:' + C.emailPubblica + '">' + C.emailPubblica + '</a>';
    }
  });

  /* ---------- 2. MODULI EMAIL ------------------------------
     Il modulo manda i dati al servizio email (Brevo/MailerLite)
     e porta alla pagina di ringraziamento. Se l'indirizzo non
     è ancora configurato lo dice, invece di fingere.
  ---------------------------------------------------------- */
  document.querySelectorAll("form[data-modulo]").forEach(function(f){
    var esito   = f.parentNode.querySelector(".esito");
    var errore  = f.parentNode.querySelector(".errore");
    var origine = f.getAttribute("data-modulo");   // percorso | capitolo | avviso

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
})();
