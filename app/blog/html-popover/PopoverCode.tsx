import SandpackWithObserver from "@/components/sandpack-with-observer";

export const PopoverCode = () => (
  <SandpackWithObserver
    files={{
      "/index.js": {
        code: `import "./styles.css";

document.getElementById("app").innerHTML = \`
<button popovertarget="popover-demo">Open Popover</button>

<div id="popover-demo" popover class="popover-wrapper">
    This works without any JavaScript!
</div>
\`;`,
      },
      "/styles.css": {
        code: `:root {
  background: #090909;
  color: white;
  font-family: 'Arial', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%; 
}

button {
  padding: 0.5rem 1rem;
  background: white;
  color: black;
  border: none;
  border-radius: 0.25rem;
}

button:hover {
  cursor: pointer;
  background: #f0f0f0;
}
    
.popover-wrapper {
  position: relative;
  top: 25%;
  padding: 0.5rem 1rem;
  background: #1d1d1d;
  border-radius: 0.25rem;
  color: white;
  border: 1px solid #333;
  transform: translateY(-1rem);
  opacity: 0.3;
  transition: all 0.3s ease-out allow-discrete;
  
  &:popover-open {
    transform: translateY(0);
    opacity: 1;
  }
  
  @starting-style {
    &:popover-open {
      transform: translateY(-1rem);
      opacity: 0.3;
    }
  }
}`,
      },
    }}
  />
);
