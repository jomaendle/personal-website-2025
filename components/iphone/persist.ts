/**
 * What the phone remembers for the tab (sessionStorage), so the back button
 * from an article lands where the reader left: on the home screen, inside
 * the app they followed the link from.
 */
export const UNLOCKED_KEY = "iphone:unlocked";
export const APP_KEY = "iphone:app";
/** Lock-screen notifications already opened, so they stay cleared. */
export const SEEN_KEY = "iphone:seen";
/** The chosen wallpaper's key (localStorage: it is a setting, kept across
 * visits). Unset means the default. */
export const WALLPAPER_KEY = "iphone:wallpaper";

/** Runs before first paint (see app/ios/page.tsx). Marks the document so
 * the stylesheet can show the home screen straight away on a return visit,
 * instead of flashing the lock screen until hydration. A plain module, not
 * the client component: a server component importing a constant from a
 * "use client" file gets a client reference, not the string. */
export const PREPAINT_SCRIPT = `try{var d=document.documentElement.dataset;if(sessionStorage.getItem("${UNLOCKED_KEY}"))d.iphone="home";if(localStorage.getItem("${WALLPAPER_KEY}"))d.wallpaperPending="1"}catch(e){}`;

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
