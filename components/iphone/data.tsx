"use client";

import { createContext, useContext } from "react";
import type { NoteSummary } from "@/lib/iphone-notes";

interface IphoneData {
  /** Every published article as a note summary, newest first. */
  notes: NoteSummary[];
}

const IphoneDataContext = createContext<IphoneData>({ notes: [] });

/** Build-time data the server page hands the phone, for the apps (which are
 * lazy chunks with no props of their own beyond AppProps) to read. */
export const IphoneDataProvider = IphoneDataContext.Provider;

export function useIphoneData() {
  return useContext(IphoneDataContext);
}
