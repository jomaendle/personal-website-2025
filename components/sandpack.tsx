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
  showLineNumbers = false,
  wrapContent = true,
  showTabs = true,
  showInlineErrors = true,
  closableTabs = true,
}: SandpackProps) => (
  <SandpackProvider template={template} theme={theme} files={files}>
    <SandpackLayout>
      <SandpackCodeEditor
        style={{
          height: "400px",
          overflowY: "auto",
        }}
        showTabs={showTabs}
        showLineNumbers={showLineNumbers}
        showInlineErrors={showInlineErrors}
        wrapContent={wrapContent}
        closableTabs={closableTabs}
      />
      <SandpackPreview
        style={{
          height: "400px",
          overflowY: "auto",
        }}
      />
    </SandpackLayout>
  </SandpackProvider>
);

Sandpack.displayName = "Sandpack";

export default Sandpack;
