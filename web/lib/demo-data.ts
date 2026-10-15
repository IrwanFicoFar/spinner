export type Prize = { id: string; name: string; icon: string };
export type Participant = { id: string; name: string; eligible: number };

export const prizes: Prize[] = [
  ["Sony WH-1000XM5", "🎧"], ["Voucher 500K", "🎟️"], ["Smartwatch", "⌚"], ["Coffee Date", "☕"],
  ["Mystery Box", "🎁"], ["Staycation", "🌴"], ["iPad Mini", "📱"], ["Nintendo Switch", "🎮"],
  ["Kamera Instan", "📷"], ["Speaker", "🔊"], ["Air Fryer", "🍳"], ["Tiket Konser", "🎫"],
].map(([name, icon], index) => ({ id: `p${index + 1}`, name, icon }));

export const participants: Participant[] = [
  "Amanda Putri", "Naufal Pratama", "Rania Kusuma", "Dimas Saputra", "Citra Lestari", "Bima Aditya",
  "Farhan Ramadhan", "Gita Maharani", "Hendra Wijaya", "Intan Permata", "Joko Santoso", "Kirana Ayu",
].map((name, index) => ({ id: `u${index + 1}`, name, eligible: 8 + (index % 5) }));

export const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
