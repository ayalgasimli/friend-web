// src/data.js
export const initialNodes = [
  { id: "1", name: "Ayal", vibe: "The Architect", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayal" },
  { id: "2", name: "Sarah", vibe: "Chaos Energy", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
  { id: "3", name: "Mike", vibe: "Gym Rat", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" }
];
// ... keep the links the same

export const initialLinks = [
  { source: "1", target: "2", type: "best_friend", lore: "Met in CTIS 101" },
  { source: "2", target: "3", type: "lover", lore: "It's complicated" }
];