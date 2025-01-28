import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";

const SandpackComponent = () => (
  <SandpackProvider template="react">
    <SandpackLayout>
      <SandpackCodeEditor
        showTabs
        showLineNumbers={false}
        showInlineErrors
        wrapContent
        closableTabs
      />
      <SandpackPreview />
    </SandpackLayout>
  </SandpackProvider>
);

SandpackComponent.displayName = "SandpackComponent";

export default SandpackComponent;
