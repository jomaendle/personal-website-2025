"use client";
import { ComponentPreview } from "@/components/component-preview";
import styles from "./Styles.module.css";

export function AppSwitcher() {
  return (
    <div>
      <ComponentPreview>
        <section className="overflow-hidden">
          <ul className={styles.carousel}>
            <li className="item">
              <figure>
                <img
                  src="https://assets.codepen.io/2585/1.jpg"
                  alt="A stylized illustration of a pink and blue origami-like figure on a peach-colored background with subtle shadows"
                />
              </figure>
            </li>
            <li className="item">
              <figure>
                <img
                  src="https://assets.codepen.io/2585/2.avif"
                  alt="A stylized illustration of a couple walking in the rain, holding an umbrella, against a city backdrop with warm tones and rain."
                />
              </figure>
            </li>
            <li className="item">
              <figure>
                <img
                  src="https://assets.codepen.io/2585/3.avif"
                  alt="A minimalist cartoonish rendering of a light green turtle on a peach-colored background."
                />
              </figure>
            </li>
            <li className="item">
              <figure>
                <img
                  src="https://assets.codepen.io/2585/4.avif"
                  alt="A detailed close-up of large, blue and white flowers with visible textures and soft lighting."
                />
              </figure>
            </li>
            <li className="item">
              <figure>
                <img
                  src="https://assets.codepen.io/2585/5.avif"
                  alt="A cartoonish illustration of a bright purple cup with orange handle and rim on a peach background."
                />
              </figure>
            </li>
            <li className="item">
              <figure>
                <img
                  src="https://assets.codepen.io/2585/6.avif"
                  alt="A stylized illustration of a beach scene at sunset, with people on the shore, palm trees, and a warm sky gradient."
                />
              </figure>
            </li>
            <li className="item">
              <figure>
                <img
                  src="https://assets.codepen.io/2585/7.avif"
                  alt="A stylized illustration of two people sitting on swings suspended from a tree at a beach during sunset."
                />
              </figure>
            </li>
            <li className="item">
              <figure>
                <img
                  src="https://assets.codepen.io/2585/8.avif"
                  alt="A cartoonish figure of a security guard in uniform, wearing dark glasses, standing with a small suitcase on a turquoise background."
                />
              </figure>
            </li>
            <li className="item">
              <figure>
                <img
                  src="https://assets.codepen.io/2585/9.avif"
                  alt="A minimalist depiction of a white abstract object, possibly a bowl, on a red background with soft lighting."
                />
              </figure>
            </li>
          </ul>
        </section>
      </ComponentPreview>
    </div>
  );
}
