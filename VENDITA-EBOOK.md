# Vendita degli ebook sul sito

Gli ebook si vendono direttamente dal sito con **Stripe Payment Links**. Non c'è nessun server: il sito resta statico su GitHub Pages.

## Come funziona

1. Il lettore clicca «Leggilo subito» (o «Tutti e tre · 9,99 €»).
2. Paga su una pagina Stripe (carta, Apple Pay, Google Pay, Satispay, Klarna…).
3. Stripe lo rimanda su `leggi.html?libri=…`, che mostra i libri comprati con il bottone «Leggi».
4. «Leggi» apre `reader.html`, un lettore PDF nel browser (senza pulsante di download).
5. La ricevuta gli arriva da Stripe via email.

## Prodotti e link (account Stripe davidemcb.github.io)

| Libro | Prezzo | Price ID | Link di pagamento |
|---|---|---|---|
| Da uomo a uomo | 5,16 € | `price_1UB2edDXcIKquC9j1vz5EK1A` | https://buy.stripe.com/5kQ28rg978eE9n4aUndnW02 |
| Senza veli | 4,99 € | `price_1UB2eeDXcIKquC9j1stGbYnq` | https://buy.stripe.com/6oU9ATaONamMfLsbYrdnW03 |
| Prenditi a carezze | 5,59 € | `price_1UB2efDXcIKquC9jVThJC0qk` | https://buy.stripe.com/4gM28r6yxdyY9n4d2vdnW04 |
| Tutti e tre | 9,99 € | `price_1UB2eiDXcIKquC9jmyH570NS` | https://buy.stripe.com/00wcN5g979iIczg5A3dnW05 |

I link stanno in `assets/config.js` (sezione `stripe`). Per cambiare un prezzo: Stripe → Catalogo prodotti → nuovo prezzo → nuovo link di pagamento → aggiorna `config.js`.

## File coinvolti

- `assets/config.js` — i quattro link di pagamento
- `assets/sito.js` — collega i bottoni `data-link="…Qui"` ai link
- `leggi.html` — pagina dopo il pagamento, elenco dei libri comprati
- `reader.html` — lettore PDF nel browser
- `pdfs/duau.pdf`, `pdfs/sv.pdf`, `pdfs/pac.pdf` — i libri

## Una cosa da controllare su Stripe

Stripe → Impostazioni → Email → attiva **«Pagamenti riusciti»**, così il cliente riceve la ricevuta con il link di conferma.

## Limite di questa versione

Il link `leggi.html?libri=…` non è protetto da login: chi lo riceve può leggere. Per una versione con account e biblioteca personale serve un backend (Firebase piano Blaze + Cloud Functions, oppure Cloudflare Workers). Il codice di quella versione è nella cronologia git (commit `3bc25d3`).
