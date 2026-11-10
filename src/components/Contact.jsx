import AnimatedTitle from "./AnimatedTitle";
import Button from "./Button";
import { useLanguage } from "../utils/i18n";

// Full product photo as a tilted card that straightens on hover
const ProductPhoto = ({ src, alt, className }) => (
  <img
    src={src}
    alt={alt}
    className={`aspect-[3/4] w-full rounded-3xl object-cover shadow-2xl shadow-black/50 ring-2 ring-lime-300/40 transition-transform duration-500 hover:rotate-0 hover:scale-105 ${className ?? ""}`}
  />
);

const Contact = () => {
  const { t } = useLanguage();
  const leftPhoto = { src: "/img/contact-black.jpg", alt: t("contact.leftAlt") };
  const rightPhoto = { src: "/img/contact-blue.jpg", alt: t("contact.rightAlt") };

  return (
    <div id="contact" className="my-20 min-h-96 w-screen  px-10">
      <div className="relative rounded-lg bg-navy-950 py-24 text-navy-50 sm:overflow-hidden">
        {/* Product photo beside the title on wide screens */}
        <div className="absolute left-10 top-1/2 hidden w-52 -translate-y-1/2 xl:block 2xl:left-16 2xl:w-72">
          <ProductPhoto {...leftPhoto} className="-rotate-3" />
        </div>

        <div className="absolute right-10 top-1/2 hidden w-52 -translate-y-1/2 xl:block 2xl:right-16 2xl:w-72">
          <ProductPhoto {...rightPhoto} className="rotate-3" />
        </div>

        <div className="flex flex-col items-center text-center">
          {/* Product photos above the title on smaller screens */}
          <div className="mb-12 flex gap-5 sm:gap-8 xl:hidden">
            <div className="w-32 sm:w-48">
              <ProductPhoto {...leftPhoto} className="-rotate-3" />
            </div>
            <div className="w-32 sm:w-48">
              <ProductPhoto {...rightPhoto} className="rotate-3" />
            </div>
          </div>

          <p className="mb-10 font-general text-[10px] uppercase">
            {t("contact.eyebrow")}
          </p>

          <AnimatedTitle
            title={t("contact.title")}
            containerClass="w-full !text-[2.25rem] sm:!text-[3rem] md:!text-[3.75rem]"
          />

          <Button title={t("contact.button")} containerClass="mt-10 cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

export default Contact;
