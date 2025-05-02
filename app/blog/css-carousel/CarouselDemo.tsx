import style from "./Styles.module.css";
import img1 from "../../../public/css-carousel/1.webp";
import img2 from "../../../public/css-carousel/2.webp";
import img3 from "../../../public/css-carousel/3.webp";
import img4 from "../../../public/css-carousel/4.webp";
import img5 from "../../../public/css-carousel/5.webp";
import img6 from "../../../public/css-carousel/6.webp";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const CarouselDemo = () => {
  const renderImages = () => {
    const images = [img1, img2, img3, img4, img5, img6];
    return images.map((image, index) => (
      <li key={index}>
        <Image
          src={image.src}
          alt=""
          width={image.width}
          height={image.height}
        />
      </li>
    ));
  };

  return (
    <div className="flex flex-col gap-12">
      <section className={style.container}>
        <ul className={style.scroller}>{renderImages()}</ul>
      </section>

      <section className={style.verticalContainer}>
        <ul className={style.verticalScroller}>{renderImages()}</ul>
      </section>

      <section className={style.container}>
        <h4 className="my-0 px-4 font-medium">With Default Buttons</h4>
        <p className="px-4 text-sm leading-5">
          This demo uses Anchor positioning to layout the scroll buttons.
        </p>
        <ul className={cn(style.scroller, style.base)}>{renderImages()}</ul>
      </section>
    </div>
  );
};
