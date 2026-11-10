import { useEffect, useRef, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaWhatsapp,
} from "react-icons/fa";

import AnimatedTitle from "../components/AnimatedTitle";
import Button from "../components/Button";
import Reviews, { StarRating } from "../components/Reviews";
import { useLanguage } from "../utils/i18n";
import { getProductRating } from "../utils/reviews";
import { whatsappLink } from "../utils/whatsapp";

// Product list; add photo paths to `images` (e.g. "/img/products/black-1.jpg"), the first one is the card cover.
// Names and descriptions live in utils/translations.js under products.items.<id>
const products = [
  { id: "black", price: "1.99", images: ["/img/products/black-1.jpg"] },
  { id: "blue", price: "1.99", images: ["/img/products/blue-1.jpg"] },
];

// Adds the translated name, description, pack size and price to a product
const useProductText = (product) => {
  const { t } = useLanguage();
  return {
    name: t(`products.items.${product.id}.name`),
    description: t(`products.items.${product.id}.description`),
    pack: t("products.pack"),
    price: t("products.price", { price: product.price }),
  };
};

const PriceTag = ({ price }) => (
  <span className="shrink-0 rounded-full bg-lime-300 px-4 py-1.5 font-general text-sm font-bold text-navy-700">
    {price}
  </span>
);

// Swipeable photo viewer shown when a product card is clicked
const ProductGallery = ({ product, onClose }) => {
  const { t } = useLanguage();
  const { name, pack, price } = useProductText(product);
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const slides = product.images.length ? product.images : [null];

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const goTo = (i) => {
    const track = trackRef.current;
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  };

  const handleScroll = () => {
    const track = trackRef.current;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <div
      onClick={onClose}
      data-lenis-prevent
      className="flex-center fixed inset-0 z-[60] bg-navy-950/90 p-5 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-navy-900"
      >
        <button
          onClick={onClose}
          aria-label={t("products.close")}
          className="flex-center absolute right-4 top-4 z-10 size-10 rounded-full bg-navy-950/70 text-white"
        >
          <FaTimes />
        </button>

        <div
          ref={trackRef}
          dir="ltr"
          onScroll={handleScroll}
          className="flex aspect-square snap-x snap-mandatory overflow-x-auto bg-lime-300 sm:aspect-[4/3]"
        >
          {slides.map((src, i) => (
            <div key={i} className="flex-center w-full shrink-0 snap-center">
              {src ? (
                <img
                  src={src}
                  alt={t("products.photoAlt", { name, number: i + 1 })}
                  className="size-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-navy-700">
                  <img src="/img/logo-rins.png" alt="" className="w-24" />
                  <p className="font-general text-xs uppercase">
                    {t("products.photosSoon")}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={() => goTo(Math.max(index - 1, 0))}
              aria-label={t("products.previous")}
              className="flex-center absolute left-4 top-1/2 size-10 -translate-y-1/2 rounded-full bg-navy-950/70 text-white"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={() => goTo(Math.min(index + 1, slides.length - 1))}
              aria-label={t("products.next")}
              className="flex-center absolute right-4 top-1/2 size-10 -translate-y-1/2 rounded-full bg-navy-950/70 text-white"
            >
              <FaChevronRight />
            </button>
          </>
        )}

        <div className="flex items-center justify-between gap-4 p-6">
          <div>
            <h3 className="font-zentry text-3xl uppercase text-lime-300">
              {name}
            </h3>
            <p className="font-general text-xs uppercase text-navy-100">
              {pack}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {slides.length > 1 && (
              <p className="font-general text-xs text-navy-100">
                {index + 1} / {slides.length}
              </p>
            )}
            <PriceTag price={price} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onOpen }) => {
  const { t } = useLanguage();
  const { name, description, pack, price } = useProductText(product);
  const rating = getProductRating(product.id);

  return (
  <div className="border-hsla flex flex-col overflow-hidden rounded-3xl bg-navy-900">
    <button
      onClick={onOpen}
      aria-label={t("products.viewPhotosLabel", { name })}
      className="flex-center group relative h-72 bg-lime-300"
    >
      {product.images.length ? (
        <img
          src={product.images[0]}
          alt={name}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <img src="/img/logo-rins.png" alt="" className="w-24" />
      )}
      <span className="absolute bottom-4 end-4 rounded-full bg-navy-950/70 px-4 py-2 font-general text-[10px] uppercase text-white">
        {t("products.viewPhotos")}
      </span>
    </button>

    <div className="flex flex-1 flex-col gap-4 p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-zentry text-4xl uppercase text-lime-300">
            {name}
          </h3>
          <p className="font-general text-xs uppercase text-navy-100">
            {pack}
          </p>
          {rating && (
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={rating.average} className="text-sm" />
              <span className="font-general text-xs text-navy-100">
                {rating.count === 1
                  ? t("reviews.countOne")
                  : t("reviews.count", { count: rating.count })}
              </span>
            </div>
          )}
        </div>
        <PriceTag price={price} />
      </div>
      <p className="flex-1 font-circular-web text-navy-100">
        {description}
      </p>

      <Button
        title={t("products.askButton")}
        leftIcon={<FaWhatsapp />}
        href={whatsappLink(t("products.askAbout", { name, pack }))}
        containerClass="flex-center gap-2"
      />
    </div>
  </div>
  );
};

const Products = () => {
  const { t } = useLanguage();
  const [question, setQuestion] = useState("");
  const [openProduct, setOpenProduct] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAsk = (e) => {
    e.preventDefault();
    const message = question.trim()
      ? t("products.greeting", { question: question.trim() })
      : t("products.defaultQuestion");
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-dvh w-screen pb-32 pt-40">
      <div className="flex flex-col items-center gap-5 px-5">
        <p className="font-general text-sm uppercase text-lime-300 md:text-[10px]">
          {t("products.eyebrow")}
        </p>

        <AnimatedTitle
          title={t("products.title")}
          containerClass="!text-white text-center"
        />

        <p className="max-w-lg text-center font-circular-web text-lg text-navy-100">
          {t("products.intro")}
        </p>
      </div>

      <div className="container mx-auto mt-20 grid max-w-5xl gap-7 px-5 sm:px-10 md:grid-cols-2">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpen={() => setOpenProduct(product)}
          />
        ))}
      </div>

      {openProduct && (
        <ProductGallery
          product={openProduct}
          onClose={() => setOpenProduct(null)}
        />
      )}

      <Reviews className="mt-8" />

      <form
        onSubmit={handleAsk}
        className="container mx-auto mt-24 px-5 sm:px-10"
      >
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-lime-300 px-7 py-14 text-center text-navy-700">
          <h2
            className="special-font font-zentry text-5xl font-black uppercase md:text-7xl"
            dangerouslySetInnerHTML={{ __html: t("products.askTitle") }}
          />
          <p className="max-w-md font-circular-web">
            {t("products.askText")}
          </p>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            placeholder={t("products.askPlaceholder")}
            className="w-full max-w-xl resize-none rounded-2xl border-2 border-navy-700/20 bg-white/70 p-4 font-circular-web text-navy-700 outline-none placeholder:text-navy-700/50 focus:border-navy-700"
          />

          <button
            type="submit"
            className="flex-center gap-2 rounded-full bg-navy-700 px-7 py-3 font-general text-xs uppercase text-lime-300 transition-colors hover:bg-navy-900"
          >
            <FaWhatsapp className="text-base" />
            {t("products.send")}
          </button>
        </div>
      </form>

      <a
        href={whatsappLink(t("products.defaultQuestion"))}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("products.chatLabel")}
        className="flex-center fixed bottom-6 end-6 z-50 size-14 rounded-full bg-lime-300 text-3xl text-navy-700 shadow-lg ring-4 ring-navy-700 transition-transform hover:scale-110"
      >
        <FaWhatsapp />
      </a>
    </div>
  );
};

export default Products;
