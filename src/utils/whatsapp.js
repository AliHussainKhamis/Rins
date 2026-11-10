// Rins WhatsApp number in international format (Bahrain +973), digits only
export const WHATSAPP_NUMBER = "97332262707";

// Builds a wa.me link that opens a chat with the message already typed
export const whatsappLink = (message = "") =>
  `https://wa.me/${WHATSAPP_NUMBER}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;
