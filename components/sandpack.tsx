import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";

export default () => (
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
