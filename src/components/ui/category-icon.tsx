import type { SVGProps } from "react";

// Base SVG path constants to keep code clean and DRY
const PATHS_FODRASZ = [
  "M9 6a3 3 0 1 1-6 0a3 3 0 0 1 6 0",
  "M9 18a3 3 0 1 1-6 0a3 3 0 0 1 6 0",
  "M8.12 8.12L12 12",
  "M20 4L8.12 15.88",
  "M14.8 14.8L20 20",
];
const PATHS_AUTOSZER = [
  "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
];
const PATHS_ORVOS = ["M22 12h-4l-3 9L9 3l-3 9H2"];
const PATHS_UGYVED = [
  "M4 8h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z",
  "M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
];
const PATHS_PEK = [
  "M12 21V9",
  "M12 9c-2 0-3-2-3-4c2 0 3 2 3 4z",
  "M12 9c2 0 3-2 3-4c-2 0-3 2-3 4z",
  "M12 15c-2 0-3-2-3-4c2 0 3 2 3 4z",
  "M12 15c2 0 3-2 3-4c-2 0-3 2-3 4z",
];
const PATHS_ETTEREM = [
  "M6 3v18",
  "M4 3v4a2 2 0 0 0 4 0V3",
  "M18 21V3c2 1 3 3 3 6s-1 4-3 5",
];
const PATHS_VILLANY = ["M13 2L3 14h9l-1 8l10-12h-9l1-8z"];
const PATHS_FORDITO = ["M4 5h16v10H9l-4 4V15H4z", "M8 9h8", "M8 12h5"];
const PATHS_TAKARITO = [
  "M7 9h8v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z",
  "M9 9V6h4v3",
  "M10 6V4h2v2",
  "M17 5h.01",
  "M19 7h.01",
  "M17 9h.01",
];
const PATHS_IT = ["M16 6l6 6l-6 6", "M8 6l-6 6l6 6"];
const PATHS_TANAR = [
  "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z",
  "M4 19a2 2 0 0 0 2 2h13",
];
const PATHS_KONYVELES = [
  "M12 20V10",
  "M18 20V4",
  "M6 20v-4",
];
const PATHS_EPITOIPAR = [
  "M18.37 2.29a2.12 2.12 0 0 0-3 0l-3 3a2.12 2.12 0 0 0 0 3l.71.71L3 19a2.12 2.12 0 1 0 3 3l9.9-9.9.71.71a2.12 2.12 0 0 0 3 0l3-3a2.12 2.12 0 0 0 0-3z",
];
const PATHS_SZEPSEG = [
  "M12 12m-3 0a3 3 0 1 0 6 0A3 3 0 1 0 9 12",
  "M12 2a15 15 0 0 0-3 7.5A15 15 0 0 0 12 17a15 15 0 0 0 3-7.5A15 15 0 0 0 12 2z",
  "M2 12a15 15 0 0 0 7.5 3A15 15 0 0 0 17 12a15 15 0 0 0-7.5-3A15 15 0 0 0 2 12z",
];
const PATHS_MASSZAZS = [
  "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
];
const PATHS_FUTAS = [
  "M14 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h8",
  "M14 6h4l4 4v6a2 2 0 0 1-2 2h-2",
  "M6 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  "M18 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
];
const PATHS_BABYSITTER = [
  "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10z",
  "M8 14s1.5 2 4 2 4-2 4-2",
  "M9 9h.01",
  "M15 9h.01",
];
const PATHS_KERTESZ = [
  "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.2 0 8.5C17 15.5 13.8 19 11 20Z",
  "M9 10a5 5 0 0 0-5 5",
  "M12 22v-3",
];
const PATHS_LAKATOS = [
  "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l1.5 1.5M15.5 7.5L19 4",
];
const PATHS_GAZVEZ = [
  "M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z",
];
const PATHS_MARKETING = [
  "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z",
  "M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
];
const PATHS_TISZTITO = [
  "M12 2a3 3 0 0 0-3 3c0 .828.337 1.58.879 2.121L2 14.242V20h20v-5.758L14.121 7.121A3 3 0 0 0 12 2z",
];
const PATHS_ALLAT = [
  "M12 14c-1.66 0-3-1.34-3-3s1.34-3 3-3s3 1.34 3 3s-1.34 3-3 3z",
  "M12 4c.55 0 1-.45 1-1s-.45-1-1-1s-1 .45-1 1s.45 1 1 1z",
  "M6 8c.55 0 1-.45 1-1s-.45-1-1-1s-1 .45-1 1s.45 1 1 1z",
  "M18 8c.55 0 1-.45 1-1s-.45-1-1-1s-1 .45-1 1s.45 1 1 1z",
  "M12 22a5 5 0 0 0 5-5c0-2-3-5-5-5s-5 3-5 5a5 5 0 0 0 5 5z",
];
// Kutya (Lucide „dog") — állatorvos / kutyás szolgáltatások. Felismerhető
// kutyafej lógó fülekkel, a formátlan mancs-blob helyett.
const PATHS_KUTYA = [
  "M11.25 16.25h1.5L12 17z",
  "M16 14v.5",
  "M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306",
  "M8 14v.5",
  "M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.5.782 3.5 2.172",
  "M15.5 8.5c.384 1.05 1.083 2.028 2.344 2.5 1.931.722 3.576-.297 3.656-1 .113-.994-1.177-6.53-4-7-1.923-.321-3.5.782-3.5 2.172",
];
const PATHS_INGATLAN = [
  "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  "M9 22V12h6v10",
];
const PATHS_BIZTOSITAS = [
  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
];
const PATHS_ZENESZ = [
  "M9 18V5l12-2v13",
  "M6 18a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  "M18 16a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
];
const PATHS_EDZO = [
  "M6.5 6.5h11",
  "M6.5 17.5h11",
  "M3 10h18",
  "M3 14h18",
  "M3 6.5h3.5v11H3z",
  "M17.5 6.5h3.5v11h-3.5z",
];
const PATHS_ASZTALOS = [
  "M20 20L4 4",
  "M6 4l2 2H6",
  "M10 8l2 2H10",
  "M14 12l2 2h-2",
  "M18 16l2 2h-2",
];
const PATHS_CUKRASZ = [
  "M12 2v4",
  "M18 8H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z",
  "M4 14h16",
];
const PATHS_ANIMATOR = [
  "M12 2a6 6 0 0 0-6 6c0 5.25 6 11 6 11s6-5.75 6-11a6 6 0 0 0-6-6z",
  "M12 19v3",
];
const PATHS_FOGORVOS = [
  // Fog: két korona-csúcs fent, két lefelé szűkülő gyökér.
  "M12 3c-2 0-2.5 1-4.5 1S5 3.5 5 6.5c0 2 .7 3.5 1.2 5.5.4 1.6.6 3.5 1.3 5 .3.7.6 1.5 1.2 1.5.7 0 .8-1 1-2 .3-1.5.5-3.5 1.3-3.5s1 2 1.3 3.5c.2 1 .3 2 1 2 .6 0 .9-.8 1.2-1.5.7-1.5.9-3.4 1.3-5 .5-2 1.2-3.5 1.2-5.5C19 3.5 17 4 15.5 4S14 3 12 3Z",
];
// Kenyér (kovász-boule): kupola tetejű cipó lapos aljjal + bevagdosás-vonalak —
// felismerhető "kenyér" sziluett, nem az elvont búzakéve (ami kicsiben pötty).
const PATHS_KENYER = [
  "M4 12a8 5 0 0 1 16 0v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z",
  "M9 9.5l1 2",
  "M12 8.5l1.2 2.5",
  "M15 9.5l1 2",
];
// Bevásárlókocsi (Lucide shopping-cart mintájára, kör-kerekek path-arc-ként,
// hogy a komponens <path>-only renderelője is megjelenítse).
const PATHS_BEVASARLOKOCSI = [
  "M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12",
  "M9 21a1 1 0 1 1-2 0a1 1 0 0 1 2 0",
  "M20 21a1 1 0 1 1-2 0a1 1 0 0 1 2 0",
];
// Takarítás: felmosóvödör (trapéz test + fogantyú) + ferde felmosónyél —
// felismerhető "takarítás" sziluett kártya-méretben is.
const PATHS_FELMOSOVODOR = [
  "M5 9h14l-1.3 10.2a2 2 0 0 1-2 1.8H8.3a2 2 0 0 1-2-1.8z",
  "M4 9h16",
  "M8 9V7.5a4 4 0 0 1 8 0V9",
  "M18 2L10 14",
  "M8.7 14q1.8 1 0 3",
];

/**
 * Kategória-ikonok — egy helyen a térkép-pinekhez (HTML-string) ÉS a
 * React-felülethez (CategoryIcon komponens).
 * Támogatja mind a 200 bővített kategóriát száraz, nagy teljesítményű referenciákkal.
 */
export const CATEGORY_ICON_PATHS: Record<string, string[]> = {
  fodrasz: PATHS_FODRASZ,
  autoszer: PATHS_AUTOSZER,
  autokereskedes: PATHS_AUTOSZER,
  karszakerto: PATHS_AUTOSZER,
  orvos: PATHS_ORVOS,
  ugyved: PATHS_UGYVED,
  pek: PATHS_KENYER,
  etterem: PATHS_ETTEREM,
  // Magyar közösség / egyesület (a szaknévsor-szervezetek zöme) — „emberek/közösség"
  // ikon (Lucide users). Enélkül 150+ szervezet-pin generikus pöttyként jelent meg.
  "magyar-kozosseg": [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    "M22 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  villany: PATHS_VILLANY,
  fordito: PATHS_FORDITO,
  takarito: PATHS_FELMOSOVODOR,
  elelmiszer: PATHS_BEVASARLOKOCSI,
  it: PATHS_IT,
  tanar: PATHS_TANAR,
  konyveles: PATHS_KONYVELES,
  epitoipar: PATHS_EPITOIPAR,
  szepseg: PATHS_SZEPSEG,
  masszazs: PATHS_MASSZAZS,
  futas: PATHS_FUTAS,
  babysitter: PATHS_BABYSITTER,
  kertesz: PATHS_KERTESZ,
  lakatos: PATHS_LAKATOS,
  gazvez: PATHS_GAZVEZ,
  marketing: PATHS_MARKETING,
  tisztito: PATHS_TISZTITO,
  allat: PATHS_ALLAT,
  ingatlan: PATHS_INGATLAN,
  biztositas: PATHS_BIZTOSITAS,
  
  // Első bővítés
  pszichologus: PATHS_MASSZAZS,
  zenesz: PATHS_ZENESZ,
  edzo: PATHS_EDZO,
  asztalos: PATHS_ASZTALOS,
  cukrasz: PATHS_CUKRASZ,
  kenyer_pekseg: PATHS_CUKRASZ,
  autoberles: PATHS_FUTAS,
  szallas: PATHS_INGATLAN,
  rendezveny: PATHS_ANIMATOR,
  klima: PATHS_GAZVEZ,
  nyomda: PATHS_MARKETING,
  tanacsadas: PATHS_UGYVED,
  webshop: PATHS_PEK,
  takaritas_ipari: PATHS_TAKARITO,
  biztonsag: PATHS_LAKATOS,
  lakberendezes: PATHS_INGATLAN,
  terkovezes: PATHS_EPITOIPAR,
  animator: PATHS_ANIMATOR,
  fogorvos: PATHS_FOGORVOS,

  // Második bővítés (száz kategóriáig)
  festo: PATHS_EPITOIPAR,
  burkolo: PATHS_EPITOIPAR,
  tetofedo: PATHS_EPITOIPAR,
  szemelyi_asszisztens: PATHS_TANAR,
  adotanacsado: PATHS_KONYVELES,
  ugyfelszolgalat: PATHS_FORDITO,
  jogtanacsado: PATHS_UGYVED,
  gyogytornasz: PATHS_MASSZAZS,
  logopedus: PATHS_TANAR,
  szemesz: PATHS_ORVOS,
  allatorvos: PATHS_KUTYA,
  kutyafodrasz: PATHS_KUTYA,
  idegenvezeto: PATHS_TANAR,
  fotos: PATHS_MARKETING,
  grafikus: PATHS_MARKETING,
  webfejleszto: PATHS_IT,
  alkusz: PATHS_BIZTOSITAS,
  hitel: PATHS_KONYVELES,
  ertekbecslo: PATHS_INGATLAN,
  koltoztetes: PATHS_FUTAS,
  futar: PATHS_FUTAS,
  autokozmetika: PATHS_AUTOSZER,
  gumiszerviz: PATHS_AUTOSZER,
  karosszeria: PATHS_AUTOSZER,
  motor: PATHS_AUTOSZER,
  kerekpar: PATHS_AUTOSZER,
  kavez: PATHS_ETTEREM,
  borbar: PATHS_ETTEREM,
  catering: PATHS_ETTEREM,
  husszek: PATHS_ETTEREM,
  zoldseges: PATHS_PEK,
  bio: PATHS_KERTESZ,
  akupunktura: PATHS_MASSZAZS,
  pedikur: PATHS_SZEPSEG,
  manikur: PATHS_SZEPSEG,
  smink: PATHS_SZEPSEG,
  tetovalas: PATHS_FODRASZ,
  joga: PATHS_EDZO,
  tanc: PATHS_EDZO,
  szemelyi_edzo: PATHS_EDZO,
  uszas: PATHS_EDZO,
  sieles: PATHS_EDZO,
  taxis: PATHS_FUTAS,
  busszal: PATHS_FUTAS,
  hazaszerkeszto: PATHS_TAKARITO,
  kemenysepro: PATHS_TAKARITO,
  karpitos: PATHS_ASZTALOS,
  uveges: PATHS_EPITOIPAR,
  varrono: PATHS_TISZTITO,
  ekszer: PATHS_LAKATOS,
  antik: PATHS_ASZTALOS,
  virag: PATHS_KERTESZ,
  temetkezes: PATHS_UGYVED,
  forditasszak: PATHS_FORDITO,
  nyelviskola: PATHS_TANAR,
  animator_gyerek: PATHS_ANIMATOR,

  // Harmadik bővítés (200 kategóriáig - Keresett Svájcban)
  nogyogyasz: PATHS_ORVOS,
  gyermekorvos: PATHS_ORVOS,
  borgyogyasz: PATHS_ORVOS,
  ortopedus: PATHS_ORVOS,
  pszichiater: PATHS_ORVOS,
  urologus: PATHS_ORVOS,
  belgyogyasz: PATHS_ORVOS,
  kardiologus: PATHS_ORVOS,
  sebesz: PATHS_ORVOS,
  "fül-orr-gége": PATHS_ORVOS,
  termeszetgyogyasz: PATHS_MASSZAZS,
  homeopata: PATHS_MASSZAZS,
  csontkovacs: PATHS_MASSZAZS,
  dietetikus: PATHS_MASSZAZS,
  szemelyi_vedelem: PATHS_BIZTOSITAS,
  magannyomozo: PATHS_BIZTOSITAS,
  zarszerviz: PATHS_LAKATOS,
  kéménytechnika: PATHS_GAZVEZ,
  napkollektor: PATHS_VILLANY,
  villamvedelem: PATHS_VILLANY,
  kaputechnika: PATHS_AUTOSZER,
  biztonsagi_or: PATHS_BIZTOSITAS,
  rendszergazda: PATHS_IT,
  halozatepito: PATHS_IT,
  szoftverfejleszto: PATHS_IT,
  cybersecurity: PATHS_IT,
  seo_szakerto: PATHS_FORDITO,
  copywriter: PATHS_FORDITO,
  kozossegi_media: PATHS_MARKETING,
  videovago: PATHS_MARKETING,
  hangmernök: PATHS_MARKETING,
  virtuális_asszisztens: PATHS_FORDITO,
  adatvedelmi_tisztviselo: PATHS_UGYVED,
  ugyvezeto: PATHS_UGYVED,
  szocialis_munkas: PATHS_BABYSITTER,
  idosek_otthona: PATHS_BABYSITTER,
  hospice: PATHS_BABYSITTER,
  gyogyszeresz: PATHS_ORVOS,
  logisztikus: PATHS_FUTAS,
  vamugyintezo: PATHS_FUTAS,
  hajomedence: PATHS_EPITOIPAR,
  szaunaepites: PATHS_EPITOIPAR,
  kandalloepites: PATHS_EPITOIPAR,
  allvanyozo: PATHS_EPITOIPAR,
  daruvezeto: PATHS_EPITOIPAR,
  homlokzatszigetelo: PATHS_EPITOIPAR,
  badoogos: PATHS_EPITOIPAR,
  nyilaszaros: PATHS_EPITOIPAR,
  arnyekolastechnika: PATHS_EPITOIPAR,
  szigetelo: PATHS_EPITOIPAR,
  kőműves: PATHS_EPITOIPAR,
  bontoipar: PATHS_EPITOIPAR,
  kerttervezo: PATHS_KERTESZ,
  fakivago: PATHS_KERTESZ,
  ontozorendszer: PATHS_KERTESZ,
  eskuvoi_fotografus: PATHS_MARKETING,
  eskuvoi_fodrasz: PATHS_FODRASZ,
  ceremoniamester: PATHS_ANIMATOR,
  dekorator: PATHS_ANIMATOR,
  eskuvoi_torta: PATHS_CUKRASZ,
  zenekar: PATHS_ANIMATOR,
  autoalkatresz: PATHS_AUTOSZER,
  autovillamossag: PATHS_AUTOSZER,
  autofenyezo: PATHS_AUTOSZER,
  gepijarmu_oktato: PATHS_AUTOSZER,
  motoros_oktato: PATHS_AUTOSZER,
  hajos_iskola: PATHS_AUTOSZER,
  repulo_oktatas: PATHS_AUTOSZER,
  idegennyelv_tanar: PATHS_TANAR,
  maganora: PATHS_TANAR,
  korrepetitor: PATHS_TANAR,
  fejleszto_pedagogus: PATHS_TANAR,
  ovodapedagogus: PATHS_TANAR,
  kutya_kikepzo: PATHS_KUTYA,
  allatszallito: PATHS_ALLAT,
  allatpanzio: PATHS_ALLAT,
  lovas_oktato: PATHS_ALLAT,
  looveges: PATHS_ALLAT,
  jatekkeszito: PATHS_EPITOIPAR,
  fazekas: PATHS_EPITOIPAR,
  festoművesz: PATHS_MARKETING,
  szobrasz: PATHS_EPITOIPAR,
  galeria: PATHS_INGATLAN,
  szinhaz: PATHS_ANIMATOR,
  modellszak: PATHS_ANIMATOR,
  szolarium: PATHS_SZEPSEG,
  szaunaszeansz: PATHS_SZEPSEG,
  reflexologus: PATHS_MASSZAZS,
  kristalygyogyasz: PATHS_MASSZAZS,
  aromaterapia: PATHS_MASSZAZS,
  csaladallitas: PATHS_MASSZAZS,
  mediator: PATHS_UGYVED,
  pályaorientáció: PATHS_TANAR,
  life_coach: PATHS_MASSZAZS,
  ergoterapeuta: PATHS_MASSZAZS,
  ortopediai_muszeresz: PATHS_EPITOIPAR,
  cipesz: PATHS_EPITOIPAR,
  késélező: PATHS_EPITOIPAR,
  szonyegház: PATHS_TAKARITO,
  takaritas_ablak: PATHS_TAKARITO,

  // --- Korábban ikon nélküli (fallback) kategóriák → releváns meglévő ikon ---
  // Egészségügy
  epileptologus: PATHS_ORVOS,
  fül_orr_gege: PATHS_ORVOS,
  laboratorium: PATHS_ORVOS,
  sportorvos: PATHS_ORVOS,
  sportorvos2: PATHS_ORVOS,
  pszichoterapia: PATHS_MASSZAZS,
  rehabilitacios: PATHS_MASSZAZS,
  // Jog / pénzügy / üzlet
  banki_ugyintezo: PATHS_KONYVELES,
  beruhazasi_tanacsado: PATHS_KONYVELES,
  penzugyi_tanacsado: PATHS_KONYVELES,
  penzmosasellenes: PATHS_KONYVELES,
  szamviteli_ellenor: PATHS_KONYVELES,
  nonprofitmenedzser: PATHS_KONYVELES,
  projektmenedzser: PATHS_KONYVELES,
  kozjegyzo: PATHS_UGYVED,
  iparjogvedelmi: PATHS_UGYVED,
  talalmanyi_szakerto: PATHS_UGYVED,
  vagyonvedelem: PATHS_BIZTOSITAS,
  munkaero_kozvetito: PATHS_KONYVELES,
  vallalkozoi_coach: PATHS_EDZO,
  // Marketing / média / IT
  online_marketing: PATHS_MARKETING,
  piackutatas: PATHS_MARKETING,
  drone_pilot: PATHS_IT,
  pilotas_drone2: PATHS_IT,
  oktatastechnologus: PATHS_TANAR,
  szocialis_pedagogus: PATHS_TANAR,
  // Fordítás / zene
  nemet_tolmacs: PATHS_FORDITO,
  hangszerkeszito: PATHS_ZENESZ,
  zenetermelo: PATHS_ZENESZ,
  // Építőipar / mérnök / felújítás
  epitesz: PATHS_EPITOIPAR,
  ev_mernok: PATHS_EPITOIPAR,
  szerkezeti_mernok: PATHS_EPITOIPAR,
  kozlekedesi_mernok: PATHS_EPITOIPAR,
  parkettazas: PATHS_EPITOIPAR,
  lakasfelujitas: PATHS_EPITOIPAR,
  fuggesztett_menyezet: PATHS_EPITOIPAR,
  kemenytechnika: PATHS_EPITOIPAR,
  looveges2: PATHS_EPITOIPAR,
  epuletgepeszet: PATHS_GAZVEZ,
  szuretes: PATHS_GAZVEZ,
  hegeszto: PATHS_LAKATOS,
  keselelo: PATHS_LAKATOS,
  // Energia / villany
  fotovoltaika: PATHS_VILLANY,
  solar_technikus: PATHS_VILLANY,
  // Egyéb
  ingatlan_fejleszto: PATHS_INGATLAN,
  hotel_menedzser: PATHS_ETTEREM,
  szallitmanyozo: PATHS_AUTOSZER,
  mezogazdasag: PATHS_KERTESZ,
  szemelyi_stilista: PATHS_SZEPSEG,
  takaritas_irodai: PATHS_TAKARITO,
};

// — Magyar-közösség ALTÍPUS ikonok ——————————————————————————————————————
// A ~150 „magyar-kozosseg" szervezet mind EGY kategória-ID-n osztozik, de a
// category_label változatos (Egyház, Cserkészet, Iskola, Néptánc, Konzulátus…).
// Ezért az altípust a label kulcsszavaiból vezetjük le → változatos pin/ikon,
// nem mindenhol ugyanaz a „két ember" ikon.
const PATHS_CHURCH = [
  "m18 7 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l4-2",
  "M14 22v-4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4",
  "M18 22V5l-6-3-6 3v17",
  "M12 7v5",
  "M10 9h4",
];
const PATHS_TENT = ["M3.5 21 14 3", "M20.5 21 10 3", "M15.5 21 12 15l-3.5 6", "M2 21h20"];

/** A magyar-kozosseg szervezet altípus-ikonja a category_label alapján (null → marad a „közösség" ikon). */
function communitySubPaths(label: string | null | undefined): string[] | null {
  if (!label) return null;
  const l = label.toLowerCase();
  if (/egyház|gyülekezet|reform|evangé|katoli|plébán|hitközség|lelkig/.test(l)) return PATHS_CHURCH;
  if (/cserkész/.test(l)) return PATHS_TENT;
  if (/iskola|óvoda|oktatás|pedagó|tanoda|tanár|képzés/.test(l)) return PATHS_TANAR;
  if (/néptánc|tánc|zene|kórus|népdal|citera/.test(l)) return PATHS_ZENESZ;
  if (/kultúr|művész|színház|galéria|könyvtár/.test(l)) return PATHS_ANIMATOR;
  if (/konzul|követség|nagykövet|képviselet/.test(l)) return PATHS_INGATLAN;
  if (/kutató|tudomány/.test(l)) return PATHS_TANAR;
  return null; // egyesület / társaság / baráti kör / ernyőszervezet → „közösség" (emberek) ikon
}

/** A megjelenítendő ikon-path-ek: magyar-kozosseg esetén a label-altípus dönt. */
function resolveIconPaths(categoryId: string | null, categoryLabel?: string | null): string[] | undefined {
  if (categoryId === "magyar-kozosseg") {
    return communitySubPaths(categoryLabel) ?? CATEGORY_ICON_PATHS["magyar-kozosseg"];
  }
  return categoryId ? CATEGORY_ICON_PATHS[categoryId] : undefined;
}

/** Térkép-pin HTML-stringje (Leaflet divIcon). */
export function categoryIconSvgString(categoryId: string | null, categoryLabel?: string | null): string {
  const paths = resolveIconPaths(categoryId, categoryLabel);
  if (!paths) {
    return `<svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><circle cx="12" cy="12" r="5"/></svg>`;
  }
  const inner = paths.map((d) => `<path d="${d}"/>`).join("");
  return `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

export interface CategoryIconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  categoryId: string | null;
  /** Magyar-közösség szervezeteknél az altípus-ikont a label adja (Egyház, Cserkészet…). */
  categoryLabel?: string | null;
  size?: number;
}

/** React kategória-ikon (felület: pillek, kártyák). */
export function CategoryIcon({ categoryId, categoryLabel, size = 16, ...props }: CategoryIconProps) {
  const paths = resolveIconPaths(categoryId, categoryLabel);
  if (!paths) {
    // Általános „szakma/üzlet" fallback (aktatáska) — nem üres pötty.
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
