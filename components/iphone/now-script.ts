import { ARTICLE_TITLES } from "@/lib/state/iphone-copy";

/**
 * Runs as soon as the phone's HTML is parsed, before first paint: writes the
 * reader's time and date into what the server could only leave blank (or at
 * Apple's 9:41), so the clock, the lock-screen date, the Calendar icon and
 * the article notification are right from the first frame instead of
 * changing when the page hydrates. It leaves the minute it used on
 * `window.__iphoneMinute`, which the clocks hydrate from (use-clock.ts), so
 * React finds the text already right and doesn't write it again.
 *
 * Each `[data-now]` element says what goes in it, formatted exactly as
 * `formatClock`, `formatLockDate` and `formatWeekday` (use-clock.ts),
 * `notificationAge` and `lockNotifications` (iphone-copy.ts) do. A plain
 * string, like PREPAINT_SCRIPT, so the page can inline it.
 */
export const NOW_SCRIPT = `try{(function(){
var M=Math.floor(Date.now()/6e4),n=new Date(M*6e4),D=864e5;
function F(o){return new Intl.DateTimeFormat(void 0,o)}
function day(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()}
function age(s){var t=new Date(s);if(isNaN(t))return"";var m=Math.round((n-t)/6e4);
if(m<1)return"now";if(m<60)return m+"m ago";
if(m<1440&&n.getDate()===t.getDate())return Math.floor(m/60)+"h ago";
var d=Math.round((day(n)-day(t))/D);if(d===1)return"Yesterday";
if(d<7)return F({weekday:"long"}).format(t);
var o={day:"numeric",month:"short"};if(t.getFullYear()!==n.getFullYear())o.year="numeric";
return F(o).format(t)}
var text={
clock:F({hour:"numeric",minute:"2-digit"}).formatToParts(n).filter(function(p){return p.type!=="dayPeriod"}).map(function(p){return p.value}).join("").trim(),
date:F({weekday:"long",month:"long",day:"numeric"}).format(n),
weekday:F({weekday:"short"}).format(n).toUpperCase(),
day:String(n.getDate())};
document.querySelectorAll("[data-now]").forEach(function(e){
var k=e.getAttribute("data-now"),s=e.getAttribute("data-since");
e.textContent=k==="age"?age(s):k==="article"?(n-new Date(s)>14*D?${JSON.stringify(ARTICLE_TITLES.latest)}:${JSON.stringify(ARTICLE_TITLES.new)}):text[k];
if(e.tagName==="TIME")e.setAttribute("datetime",n.toISOString())});
window.__iphoneMinute=M
})()}catch(e){}`;
