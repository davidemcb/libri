/* ============================================================
   CONFIGURAZIONE DEL SITO — l'unico file da toccare
   ------------------------------------------------------------
   Qui dentro ci sono le tre cose che cambiano nel tempo:
   i link di vendita, il modulo email, il pixel della pubblicità.
   Tutte le pagine leggono da qui: modifichi una riga, cambia
   ovunque. Non serve toccare l'HTML.

   Un campo lasciato vuoto ("") non rompe niente: il bottone
   corrispondente diventa «In arrivo» e non è cliccabile.
   ============================================================ */

window.SITO = {

  /* ---------- 1. DOVE SI COMPRA ----------------------------
     Incolla l'indirizzo Amazon della scheda, per intero.
     Formato: https://www.amazon.it/dp/CODICE-ASIN
  ---------------------------------------------------------- */
  amazon: {
    duauCartaceo: "",                                  // Da uomo a uomo — cartaceo (dopo la pubblicazione su KDP)
    duauEbook:    "",                                  // Da uomo a uomo — ebook Kindle
    pacCartaceo:  "https://www.amazon.it/dp/B0GL6LS5ZP", // Prenditi a carezze — cartaceo (edizione 6x9, in sostituzione)
    pacEbook:     "https://www.amazon.it/dp/B0GL769877", // Prenditi a carezze — ebook Kindle
    svCartaceo:   "",                                  // Senza veli — non ancora pubblicato
    svEbook:      ""
  },

  /* ---------- 2. IL MODULO EMAIL ---------------------------
     Indirizzo a cui il modulo manda le iscrizioni. Lo dà il
     servizio email quando crei il modulo (Brevo o MailerLite).

     Brevo:      Moduli > il tuo modulo > Condividi > "action"
                 del codice HTML. Campo email: EMAIL
     MailerLite: Forms > Embedded form > l'attributo action.
                 Campo email: fields[email]

     Finché è vuoto il modulo avvisa che non è collegato:
     è voluto, così te ne accorgi subito.
  ---------------------------------------------------------- */
  modulo: "",
  campoEmail: "EMAIL",

  // Campi nascosti che alcuni servizi richiedono (lasciali così per Brevo).
  campiExtra: {
    email_address_check: "",
    locale: "it"
  },

  /* ---------- 3. PUBBLICITÀ E MISURAZIONE ------------------
     Compila solo quello che usi. Se entrambi restano vuoti il
     sito non installa nessun cookie di terze parti e la
     fascetta dei cookie non compare proprio: è la condizione
     più pulita finché non parte una campagna.
     Quando compili un ID, il tag parte SOLO dopo l'assenso.

     googleAds: l'ID del tag di Google Ads, formato "AW-123456789".
     Lo trovi in Google Ads > Strumenti > Gestione tag / Conversioni.
     pixelMeta: l'ID del pixel Meta (solo il numero).
  ---------------------------------------------------------- */
  googleAds: "",
  pixelMeta: "",

  /* ---------- 4. CONTATTI ----------------------------------
     Compaiono in fondo alle pagine e nella privacy.
  ---------------------------------------------------------- */
  emailPubblica: "infokinesiologia@gmail.com",
  instagram: "",            // es. "https://www.instagram.com/..."
  titolare: "Davide Scuderi" // titolare del trattamento, per la privacy
};
