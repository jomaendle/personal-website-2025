import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";

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

const Sandpack = ({
  files,
  template = "vanilla",
  theme = "dark",
  height = "380px",
  showLineNumbers = false,
  wrapContent = true,
  showTabs = true,
  showInlineErrors = true,
  closableTabs = true,
}: SandpackProps) => (
  <SandpackProvider
    template={template}
    className={`h-[${height}]`}
    theme={theme}
    files={files}
  >
    <SandpackLayout>
      <SandpackCodeEditor
        showTabs={showTabs}
        showLineNumbers={showLineNumbers}
        showInlineErrors={showInlineErrors}
        wrapContent={wrapContent}
        closableTabs={closableTabs}
      />
      <SandpackPreview />
    </SandpackLayout>
  </SandpackProvider>
);

Sandpack.displayName = "Sandpack";

export default Sandpack;
