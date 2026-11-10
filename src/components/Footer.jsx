import { FaInstagram } from "react-icons/fa";
import { SiGmail } from "react-icons/si";

import { useLanguage } from "../utils/i18n";

// Each link gets its brand colours: Gmail red on white, Instagram's gradient
const socialLinks = [
  {
    key: "email",
    href: "mailto:rinstravelbh@gmail.com",
    icon: <SiGmail />,
    className: "bg-white text-[#EA4335]",
  },
  {
    key: "instagram",
    href: "https://www.instagram.com/rins.travel/",
    icon: <FaInstagram />,
    className:
      "bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#4F5BD5] text-white",
  },
];

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-screen bg-lime-300 py-4 text-navy-700">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <p className="text-center text-sm font-light md:text-start">
          {t("footer.rights")}
        </p>

        <div className="flex justify-center gap-3 md:justify-start">
          {socialLinks.map((link) => (
            <a
              key={link.key}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              aria-label={t(`footer.${link.key}`)}
              className={`flex-center size-10 rounded-full text-xl shadow-md shadow-navy-700/20 transition-transform duration-300 hover:scale-110 ${link.className}`}
            >
              {link.icon}
            </a>
          ))}
        </div>

        <a
          href="#privacy-policy"
          className="text-center text-sm font-light hover:underline md:text-end"
        >
          {t("footer.privacy")}
        </a>
      </div>
    </footer>
  );
};

export default Footer;
