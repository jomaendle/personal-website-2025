/**
 * What the phone remembers for the tab (sessionStorage), so the back button
 * from an article lands where the reader left: on the home screen, inside
 * the app they followed the link from.
 */
export const UNLOCKED_KEY = "iphone:unlocked";
export const APP_KEY = "iphone:app";
/** Lock-screen notifications already opened, so they stay cleared. */
export const SEEN_KEY = "iphone:seen";

/** Runs before first paint (see app/iphone/page.tsx). Marks the document so
 * the stylesheet can show the home screen straight away on a return visit,
 * instead of flashing the lock screen until hydration. A plain module, not
 * the client component: a server component importing a constant from a
 * "use client" file gets a client reference, not the string. */
export const PREPAINT_SCRIPT = `try{if(sessionStorage.getItem("${UNLOCKED_KEY}"))document.documentElement.dataset.iphone="home"}catch(e){}`;

export const store = {
  get(key: string) {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string | null) {
    try {
      if (value === null) {
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, value);
      }
    } catch {
      // Private mode or blocked storage: the phone just starts locked.
    }
  },
};
