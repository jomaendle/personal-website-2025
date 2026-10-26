import { ARTICLE_TITLES } from "@/lib/state/iphone-copy";
import {
  ageText,
  clockText,
  isRecent,
  lockDateText,
  mediumDateText,
  weekdayText,
} from "@/lib/state/now-format";

/**
 * Runs as soon as the phone's HTML is parsed, before first paint: writes the
 * reader's time and date into what the server could only leave blank (or at
 * Apple's 9:41), so the clock, the lock-screen date, the Calendar icon and
 * the article notification are right from the first frame instead of
 * changing when the page hydrates. It leaves the minute it used on
 * `window.__iphoneMinute`, which the clocks hydrate from (use-clock.ts), so
 * React finds the text already right and doesn't write it again.
 *
 * Each `[data-now]` element says what goes in it. The formatting is the
 * page's own (lib/state/now-format.ts), inlined from source, so the two
 * can't disagree. A plain string, like PREPAINT_SCRIPT, so the page can
 * inline it.
 */
const inline = (fn: (...args: never[]) => unknown) => `(${fn.toString()})`;

export const NOW_SCRIPT = `try{(function(){
var M=Math.floor(Date.now()/6e4),n=new Date(M*6e4);
var clock=${inline(clockText)},date=${inline(lockDateText)},weekday=${inline(weekdayText)},age=${inline(ageText)},recent=${inline(isRecent)},medium=${inline(mediumDateText)};
var text={clock:clock(n),date:date(n),weekday:weekday(n).toUpperCase(),day:String(n.getDate())};
document.querySelectorAll("[data-now]").forEach(function(e){
var k=e.getAttribute("data-now"),s=e.getAttribute("data-since");
e.textContent=k==="age"?age(s,n):k==="medium"?medium(s):k==="article"?(recent(s,n)?${JSON.stringify(ARTICLE_TITLES.new)}:${JSON.stringify(ARTICLE_TITLES.latest)}):text[k];
if(e.tagName==="TIME")e.setAttribute("datetime",n.toISOString())});
window.__iphoneMinute=M
})()}catch(e){}`;
