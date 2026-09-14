// ABBA draft: turn % 4 → [A,B,B,A]
export const abbaOwner = (t) => [0, 1, 1, 0][t % 4];

// Status labels e colori
export const SL = {
  scheduled: "Programmata",
  draft: "Draft 🏀",
  ready: "Pronta ✅",
  voting: "Votazioni 📊",
  completed: "Completata 🏆",
};

export const SC = {
  scheduled: "#7a9e5a",
  draft: "#ffd54f",
  ready: "#4fc3f7",
  voting: "#ff8a65",
  completed: "#b5f23d",
};

// Formatta data ISO in formato italiano breve
export const fmt = (iso) =>
  new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
