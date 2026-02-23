# 🚀 Come pubblicare Calcetto Presidenziale su GitHub Pages

Segui questi passi **una volta sola**. Dopo, ogni aggiornamento si pubblica con un solo comando.

---

## PARTE 1 — Installa gli strumenti (solo la prima volta)

### 1. Installa Node.js
Vai su **https://nodejs.org** → scarica la versione **LTS** → installa.

Per verificare che funzioni, apri il **Terminale** (su Mac) o **PowerShell** (su Windows) e scrivi:
```
node --version
```
Deve comparire qualcosa tipo `v20.x.x`. ✅

---

### 2. Crea un account GitHub
Vai su **https://github.com** → Sign up → crea un account gratuito.

---

### 3. Crea il repository
1. Una volta loggato su GitHub, clicca il **+** in alto a destra → **New repository**
2. Nome repository: `calcetto-presidenziale` ← ⚠️ deve essere **esattamente questo** oppure aggiorna il file `vite.config.js`
3. Lascia tutto il resto di default
4. Clicca **Create repository**

---

## PARTE 2 — Prepara il progetto sul tuo PC

### 4. Copia i file del progetto
Scarica tutti i file che ti ha dato Claude e mettili in una cartella chiamata `calcetto-presidenziale` sul tuo desktop.

La struttura deve essere:
```
calcetto-presidenziale/
├── package.json
├── vite.config.js
├── index.html
├── public/
│   └── manifest.json
└── src/
    ├── main.jsx
    └── App.jsx
```

### 5. Apri il Terminale nella cartella
- **Mac**: trascina la cartella su Terminale, oppure tasto destro → "Nuovo Terminale nella cartella"
- **Windows**: apri la cartella in Esplora File → clic sulla barra dell'indirizzo → scrivi `powershell` → Invio

### 6. Installa le dipendenze
```bash
npm install
```
Aspetta che finisca (scarica le librerie, ~30 secondi).

### 7. Testa in locale (opzionale ma consigliato)
```bash
npm run dev
```
Apri **http://localhost:5173** nel browser — devi vedere l'app funzionante. Premi `Ctrl+C` per fermare.

---

## PARTE 3 — Pubblica su GitHub

### 8. Collega il progetto a GitHub
Sostituisci `TUO_USERNAME` con il tuo username GitHub:
```bash
git init
git add .
git commit -m "primo deploy calcetto"
git branch -M main
git remote add origin https://github.com/TUO_USERNAME/calcetto-presidenziale.git
git push -u origin main
```

### 9. Pubblica l'app!
```bash
npm run deploy
```
Questo comando:
- Costruisce l'app ottimizzata
- La pubblica automaticamente su GitHub Pages

Aspetta ~1 minuto, poi l'app sarà online su:
```
https://TUO_USERNAME.github.io/calcetto-presidenziale/
```

---

## PARTE 4 — Manda il link agli amici

Invia questo link via **WhatsApp** al gruppo:
```
https://TUO_USERNAME.github.io/calcetto-presidenziale/
```

### Come installare come app (sembra un'app vera!)

**Su iPhone (Safari):**
1. Apri il link in Safari
2. Tocca il tasto condividi (📤)
3. Scorri in basso → **"Aggiungi a schermata Home"**
4. Clicca Aggiungi → l'app appare come icona sul telefono ✅

**Su Android (Chrome):**
1. Apri il link in Chrome
2. Tocca i tre puntini (⋮) in alto a destra
3. **"Aggiungi a schermata Home"** oppure **"Installa app"**
4. Clicca Installa ✅

---

## Aggiornare l'app in futuro

Se Claude ti fa una nuova versione dell'app, sostituisci il file `src/App.jsx` e lancia:
```bash
npm run deploy
```
In ~1 minuto tutti gli amici hanno la versione aggiornata automaticamente.

---

## ❓ Problemi comuni

**"git non trovato"** → Installa Git da https://git-scm.com

**"La pagina è bianca"** → Controlla che in `vite.config.js` il nome dopo `base:` sia uguale al nome del tuo repository GitHub

**"404 Not Found"** → Aspetta 2-3 minuti dopo il deploy, GitHub Pages ha bisogno di un po' di tempo

**L'app non si carica su telefono** → Prova a svuotare la cache del browser (tieni premuto il tasto ricarica)
