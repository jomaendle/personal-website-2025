import { ComponentPreview } from "@/components/component-preview";
import { Button } from "@/components/ui/button";
import styles from "./Styles.module.css";

export const PopoverPlayground = () => {
  return (
    <ComponentPreview>
      <Button popoverTarget="popover-demo">Open Popover</Button>

      <div id="popover-demo" popover={"auto"} className={styles.popoverWrapper}>
        This works without any JavaScript!
      </div>
    </ComponentPreview>
  );
};
