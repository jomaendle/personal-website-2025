"use client";

import dynamic from "next/dynamic";
import { SandpackSkeleton } from "@/components/ui/skeleton";

interface SandpackProps {
  files: Record<string, { code: string }>;
  template?: "vanilla" | "react" | "vue" | "angular" | "svelte" | "solid";
  theme?: "light" | "dark" | "auto";
  height?: string;
  showLineNumbers?: boolean;
  wrapContent?: boolean;
  showTabs?: boolean;
  showInlineErrors?: boolean;
  closableTabs?: boolean;
}

const DynamicSandpack = dynamic(() => import("./sandpack"), {
  loading: () => <SandpackSkeleton />,
  ssr: false,
});

const SandpackLazy = (props: SandpackProps) => {
  return <DynamicSandpack {...props} />;
};

SandpackLazy.displayName = "SandpackLazy";

export default SandpackLazy;