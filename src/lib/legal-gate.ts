/**
 * legal-gate.ts — a jogi kapu (LegalGatekeeper) és a boot-szkript KÖZÖS konstansai.
 *
 * A kapu két helyről dolgozik ugyanazokkal a szabályokkal:
 *  1) a root layout inline fej-szkriptje (első festés ELŐTT fut) — ha a jogi
 *     elfogadás hiányzik, `data-legal-pending`-et tesz a <html>-re, a CSS pedig
 *     addig rejti a body-t (globals.css). Így NEM villan be a tartalom a modal
 *     megjelenése előtt.
 *  2) a LegalGatekeeper (kliens) — eldönti, kell-e a modal, és felold.
 * A kettőnek szinkronban kell maradnia → a kulcs + a kivétel-útvonalak itt élnek.
 */

/** localStorage-kulcs: a jogi feltételek eszköz-szintű elfogadása. */
export const LEGAL_ACCEPTED_KEY = "kinti_legal_accepted";

/**
 * A modálnak NEM szabad megjelennie azokon az oldalakon, amiket maga a modal
 * linkel be (különben az új tabban is letakarná/elrejtené az olvasnivalót).
 */
export const LEGAL_EXEMPT_PATHS = ["/aszf", "/adatvedelem", "/impresszum"] as const;

/**
 * Boot-gate fej-szkript. Ha a jogi elfogadás hiányzik (és nem kivétel-oldalon
 * vagyunk), elrejti a body-t, amíg a LegalGatekeeper fel nem oldja (a modal
 * DOM-ba kerülésekor vagy bejelentkezett usernél azonnal). Biztonsági időzítő
 * 4000 ms után mindenképp felold (ha a JS-hidratálás elmaradna).
 */
export function buildLegalGateScript(): string {
  const exempt = JSON.stringify(LEGAL_EXEMPT_PATHS);
  return (
    `(function(){try{var p=location.pathname;var ex=${exempt};` +
    `for(var i=0;i<ex.length;i++){if(p===ex[i]||p.indexOf(ex[i]+'/')===0)return;}` +
    `if(!localStorage.getItem('${LEGAL_ACCEPTED_KEY}')){var d=document.documentElement;` +
    `d.setAttribute('data-legal-pending','');` +
    `setTimeout(function(){d.removeAttribute('data-legal-pending');},4000);}}catch(e){}})();`
  );
}
