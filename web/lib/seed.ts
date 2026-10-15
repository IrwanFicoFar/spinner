import type { State, Product, Person } from './model';
const seedProducts = ():Product[] => [
    ['Sony WH-1000XM5', '🎧'], ['Voucher Belanja 500K', '🎟️'], ['Smartwatch', '⌚'], ['Coffee Date', '☕'], ['Mystery Box', '🎁'],
    ['Tumbler Eksklusif', '🥤'], ['Voucher Makan 250K', '🍜'], ['Weekend Staycation', '🌴'], ['iPad Mini', '📱'], ['Nintendo Switch', '🎮'],
    ['Kamera Instan', '📷'], ['Speaker Bluetooth', '🔊'], ['Earbuds Wireless', '🎧'], ['Power Bank Premium', '🔋'], ['Keyboard Mechanical', '⌨️'],
    ['Mouse Wireless', '🖱️'], ['Monitor 24 Inch', '🖥️'], ['Mini Projector', '📽️'], ['Smart Lamp', '💡'], ['Fitness Band', '⌚'],
    ['Voucher Belanja 1 Juta', '🛍️'], ['Voucher Belanja 250K', '🛍️'], ['Voucher Grocery 500K', '🛒'], ['Voucher Fashion 500K', '👕'], ['Voucher Elektronik 500K', '💳'],
    ['Voucher Bioskop', '🎬'], ['Voucher Streaming 1 Tahun', '📺'], ['Voucher Musik 1 Tahun', '🎵'], ['Voucher Buku 300K', '📚'], ['Voucher Transportasi 300K', '🚕'],
    ['Voucher Hotel 1 Juta', '🏨'], ['Voucher Penerbangan 1 Juta', '✈️'], ['Voucher Spa 500K', '💆'], ['Voucher Gym 3 Bulan', '🏋️'], ['Voucher Game 500K', '🎮'],
    ['Dinner for Two', '🍽️'], ['Brunch Akhir Pekan', '🥐'], ['Afternoon Tea', '🫖'], ['Paket BBQ Keluarga', '🍖'], ['Paket Sushi Premium', '🍣'],
    ['Pizza Party', '🍕'], ['Dessert Box', '🍰'], ['Coffee Beans Premium', '☕'], ['Teh Artisan Set', '🫖'], ['Snack Hamper', '🍿'],
    ['Air Fryer', '🍳'], ['Rice Cooker Digital', '🍚'], ['Blender Portable', '🥤'], ['Electric Kettle', '🫖'], ['Sandwich Maker', '🥪'],
    ['Diffuser Aromaterapi', '🪔'], ['Lilin Aromaterapi', '🕯️'], ['Bed Cover Premium', '🛏️'], ['Handuk Hotel Set', '🧖'], ['Tableware Set', '🍽️'],
    ['Tanaman Hias', '🪴'], ['Vacuum Cleaner Mini', '🧹'], ['Kotak Penyimpanan', '🧺'], ['Jam Meja Minimalis', '⏰'], ['Bantal Leher Premium', '🛏️'],
    ['Hoodie Eksklusif', '👕'], ['Kaos Limited Edition', '👕'], ['Tote Bag Premium', '👜'], ['Backpack Urban', '🎒'], ['Topi Eksklusif', '🧢'],
    ['Payung Otomatis', '☂️'], ['Notebook Premium', '📓'], ['Pulpen Eksklusif', '🖊️'], ['Desk Organizer', '🗂️'], ['Botol Minum Sport', '🧴'],
    ['Lunch Box Set', '🍱'], ['Travel Pouch', '🧳'], ['Koper Kabin', '🧳'], ['Sunglasses', '🕶️'], ['Jam Tangan Kasual', '⌚'],
    ['Sepatu Sneakers', '👟'], ['Jaket Windbreaker', '🧥'], ['Dompet Kulit', '👛'], ['Gift Card Premium', '💳'], ['Bouquet Bunga', '💐'],
    ['Tiket Konser', '🎫'], ['Tiket Theme Park', '🎡'], ['Tiket Waterpark', '🏊'], ['Escape Room Experience', '🔐'], ['Karaoke Night', '🎤'],
    ['Bowling Party', '🎳'], ['Kelas Memasak', '👩‍🍳'], ['Kelas Melukis', '🎨'], ['Kelas Fotografi', '📷'], ['Paket Glamping', '⛺'],
    ['City Tour', '🚌'], ['Sunset Cruise', '⛵'], ['Massage & Wellness', '💆'], ['Salon Makeover', '💇'], ['Personal Training', '🏃'],
    ['Sepeda Lipat', '🚲'], ['Skateboard', '🛹'], ['Yoga Mat Premium', '🧘'], ['Dumbbell Set', '🏋️'], ['Bola Olahraga', '⚽']
  ].map(([name, icon], index) => ({ id: `p${index + 1}`, name, stock: 1, icon }));
const seedParticipants = ():Person[] => [
    'Amanda Putri', 'Naufal Pratama', 'Rania Kusuma', 'Dimas Saputra', 'Citra Lestari', 'Bima Aditya', 'Farhan Ramadhan', 'Gita Maharani',
    'Hendra Wijaya', 'Intan Permata', 'Joko Santoso', 'Kirana Ayu', 'Luthfi Hakim', 'Maya Sari', 'Nadia Rahma', 'Oscar Gunawan',
    'Putri Amelia', 'Qori Azzahra', 'Rizky Maulana', 'Salsabila Nur', 'Taufik Hidayat', 'Ulfa Nabila', 'Vino Alfarizi', 'Wulan Anggraini',
    'Xavier Halim', 'Yasmin Zahra', 'Zaki Mubarak', 'Alya Safitri', 'Bagas Prakoso', 'Chelsea Anindya', 'Daffa Alamsyah', 'Eka Puspita',
    'Fajar Nugroho', 'Grace Natalia', 'Hafiz Firdaus', 'Indah Kartika', 'Kevin Susanto', 'Larasati Dewi', 'Miko Firmansyah', 'Nabila Salsabila',
    'Oki Setiawan', 'Prilly Maharani', 'Raka Mahendra', 'Shinta Melati', 'Tommy Kurniawan', 'Uli Rahmawati', 'Vania Aurelia', 'Wahyu Firmansyah',
    'Yuni Astuti', 'Zidan Akbar', 'Adelia Paramitha', 'Bayu Pranata', 'Clarissa Felicia', 'Denny Irawan', 'Elvina Monica', 'Fauzan Arifin',
    'Gina Oktavia', 'Harris Gunawan', 'Isyana Larasati', 'Jonathan Wijaya', 'Keyla Ramadhani', 'Leonard Hartono', 'Monica Salim', 'Nino Prasetyo',
    'Olivia Tan', 'Pandu Wicaksono', 'Queenara Putri', 'Reza Kurnia', 'Sabrina Aulia', 'Theo Mahardika', 'Umi Kalsum', 'Valerie Amanda',
    'William Alexander', 'Yola Febriani', 'Aditya Nugraha', 'Bella Maharani', 'Cahya Ramadhan', 'Dea Anjani', 'Erlangga Putra', 'Felicia Nathania'
  ].map((name, index) => {
    const number = index + 1;
    const rules: {mode: Person["mode"]; productIds:string[]} = ({
      2: { mode: 'exclude', productIds: ['p1'] },
      3: { mode: 'include', productIds: ['p2', 'p4', 'p7', 'p8'] },
      5: { mode: 'include', productIds: ['p1', 'p3', 'p5'] },
      6: { mode: 'exclude', productIds: ['p4', 'p8'] }
    } as Record<number,{mode:Person['mode'];productIds:string[]}>)[number] || { mode: 'exclude', productIds: [] };
    return { id: `u${number}`, name, ...rules };
  });
export function initialState():State{return {name:'Workspace saya',mode:'participant',control:'admin',advance:'manual',live:false,onboarded:false,selected:'',products:seedProducts(),participants:seedParticipants(),history:[],draw:null};}
