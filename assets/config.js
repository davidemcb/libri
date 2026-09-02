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
    duauCartaceo: "https://www.amazon.it/dp/B0HHC3W8MX", // Da uomo a uomo — cartaceo (14,90 €)
    duauEbook:    "https://www.amazon.it/dp/B0HHC4PXBR", // Da uomo a uomo — ebook Kindle
    pacCartaceo:  "https://www.amazon.it/dp/B0HHC7238K", // Prenditi a carezze — cartaceo (5"×8")
    pacEbook:     "https://www.amazon.it/dp/B0GL769877", // Prenditi a carezze — ebook Kindle
    svCartaceo:   "",                                  // Senza veli — cartaceo non ancora pubblicato
    svEbook:      "https://www.amazon.it/dp/B0HHC8Y46W"  // Senza veli — ebook Kindle
  },

  /* ---------- 1b. EBOOK VENDUTI DAL SITO (Gumroad) ------------
     Link del prodotto Gumroad. Se compilato, il bottone «Ebook»
     apre la finestra di acquisto sopra la pagina; se vuoto, il
     bottone porta all'ebook su Amazon. Dopo il pagamento il lettore
     scarica PDF ed EPUB, e riceve l'email col link.
  ---------------------------------------------------------- */
  gumroad: {
    duauEbook: "https://wellfulnessn1.gumroad.com/l/da-uomo-a-uomo", // Da uomo a uomo — 5,99 €
    svEbook:   "https://wellfulnessn1.gumroad.com/l/senza-veli", // Senza veli — 4,99 €
    pacEbook:  ""    // Prenditi a carezze — resta vuoto finché è in KDP Select
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
  modulo: "https://eba0d493.sibforms.com/serve/MUIFAL2YZjwSQMAeB_ot9i7FXoeZ9HknpV7PlPV7R1hU8FnRd0gEMilqWJ3ho7y0KGerf3divJaTXaDgrgLQ6dmSIHGgbLNHCqApvL_qvVeODGLT2ngzpL40lY2W-wA88n6AobpNZHTr0iHV35-Cb_gziXKDNhI5O1zMZ2peWVPNiM83XYtUQptFJ00HDHB0GfLH6_PBCfPs7ZS3jA==",
  campoEmail: "EMAIL",

  // Campi nascosti che alcuni servizi richiedono (lasciali così per Brevo).
  campiExtra: {
    email_address_check: "",
    locale: "it",
    html_type: "simple"
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
  googleAds: "AW-969285863",
  pixelMeta: "1329668879245300",

  /* googleAdsConversione: l'etichetta dell'azione di conversione
     "Iscrizione percorso" creata in Google Ads → Obiettivi →
     Conversioni; finché è vuota non parte nulla.
     Formato: "AW-969285863/ETICHETTA" */
  googleAdsConversione: "",

  /* ---------- 4. CONTATTI ----------------------------------
     Compaiono in fondo alle pagine e nella privacy.
  ---------------------------------------------------------- */
  emailPubblica: "davidescuderi1981@gmail.com",
  instagram: "",            // es. "https://www.instagram.com/..."
  titolare: "Davide Scuderi" // titolare del trattamento, per la privacy
};
