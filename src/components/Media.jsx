import clsx from "clsx";
import { FiImage } from "react-icons/fi";

import { useLanguage } from "../utils/i18n";

const isImage = (src) => /\.(jpe?g|png|webp|avif|gif)$/i.test(src);

// On-brand stand-in shown until a real image or video is added
export const MediaPlaceholder = ({ label, className }) => {
  const { t } = useLanguage();

  return (
  <div
    className={clsx(
      "flex-center size-full flex-col gap-3 bg-gradient-to-br from-navy-700 via-navy-900 to-navy-950 text-lime-300/50",
      className
    )}
  >
    <FiImage className="text-4xl" />
    <p className="font-general text-[10px] uppercase tracking-widest">
      {label ?? t("media.placeholder")}
    </p>
  </div>
  );
};

// Shows an image or a looping video depending on the file type,
// or a placeholder when no src is given
const Media = ({ src, alt = "", className, placeholderLabel }) => {
  if (!src) {
    return <MediaPlaceholder label={placeholderLabel} className={className} />;
  }

  return isImage(src) ? (
    <img src={src} alt={alt} className={clsx("object-cover", className)} />
  ) : (
    <video
      src={src}
      loop
      muted
      autoPlay
      playsInline
      className={clsx("object-cover object-center", className)}
    />
  );
};

export default Media;
