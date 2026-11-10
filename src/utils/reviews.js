// Real customer reviews. Add one object per review, with the customer's permission:
// {
//   product: "blue",                     // "blue", "black", or null for RINS in general
//   rating: 5,                           // 1 to 5
//   name: { en: "Fatima", ar: "فاطمة" },
//   place: { en: "Manama", ar: "المنامة" },
//   quote: { en: "...", ar: "..." },     // Leave a language out to hide it on that version of the site
//   photo: "/img/reviews/fatima.jpg",    // Optional
// },
const reviews = [];

// Design previews for `npm run dev` only. They are never included in the live site:
// until `reviews` above has entries, the review sections simply don't appear there.
const makeSampleReviews = () =>
  ["blue", "black", null, "blue"].map((product, index) => ({
    product,
    rating: 5,
    isSample: true,
    name: { en: `Sample customer ${index + 1}`, ar: `عميل تجريبي ${index + 1}` },
    place: { en: "Sample location", ar: "موقع تجريبي" },
    quote: {
      en: "Sample text. Replace this with a real customer's own words in reviews.js.",
      ar: "نص تجريبي. استبدله بكلمات عميل حقيقي في ملف reviews.js.",
    },
  }));

export const siteReviews =
  import.meta.env.DEV && !reviews.length ? makeSampleReviews() : reviews;

// Average rating and review count for one product, or null if it has no reviews yet
export const getProductRating = (productId) => {
  const matching = siteReviews.filter(({ product }) => product === productId);
  if (!matching.length) return null;

  const total = matching.reduce((sum, { rating }) => sum + rating, 0);
  return { average: total / matching.length, count: matching.length };
};
