import Sandpack from "@/components/sandpack";

export const CarouselCode = () => (
  <Sandpack
    height="420px"
    files={{
      "/index.js": {
        code: `import "./styles.css";

document.getElementById("app").innerHTML = \`
<section class="container">
  <ul class="scroller">
    <li class="item">Item 1</li>
    <li class="item">Item 2</li>
    <li class="item">Item 3</li>
    <li class="item">Item 4</li>
    <li class="item">Item 5</li>
  </ul>
</section>
\`;`,
      },
      "/styles.css": {
        code: `:root {
  background: #090909;
  color: white;
  font-family: 'Arial', sans-serif;
  padding: 2rem;
  color-scheme: dark;
}

.container {
  max-width: 100%;
  margin: 0 auto;
}

.scroller {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding: 1rem;
  list-style: none;
  
  /* Prevents scroll chaining to parent elements */
  overscroll-behavior-x: contain;
  
  /* Smooth scrolling behavior */
  scroll-behavior: smooth;
  
  /* Enable horizontal snap scrolling */
  scroll-snap-type: x mandatory;
  
  /* Add padding for better UX at container edges */
  scroll-padding-inline: 20px;
  
  /* Position marker group after the content */
  scroll-marker-group: after;
}

.item {
  flex: 0 0 250px;
  height: 150px;
  background: #1d1d1d;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  
  /* Defines where items should snap to */
  scroll-snap-align: start;
  border: 1px solid #333;
}

/* Style the container for markers */
.scroller::scroll-marker-group {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

/* Style individual markers */
.scroller .item::scroll-marker {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ccc;
}

/* Highlight the current item's marker */
.scroller .item::scroll-marker:target-current {
  background-color: white;
  transform: scale(1.2);
}

/* Styling scroll buttons */
.scroller::scroll-button(inline-start),
.scroller::scroll-button(inline-end) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scroller::scroll-button(inline-start)::before {
  content: "←";
}

.scroller::scroll-button(inline-end)::before {
  content: "→";
}`,
      },
    }}
  />
);
