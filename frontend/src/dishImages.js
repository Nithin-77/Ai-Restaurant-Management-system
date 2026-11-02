// Shared dish image helpers.
//
// The backend stores an image URL on every menu item (either an
// uploaded file under /static/menu or a local path under /images/menu).
// These helpers resolve that value into something renderable and fall
// back to a matching stock photo when a dish has no image yet.

const API_BASE =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Cache-busting version for menu images.
// Increment this when images are replaced so browsers fetch the new versions.
const IMAGE_VERSION = "3";

// Local fallback image for dishes without an image.
export const FALLBACK_DISH_IMAGE = "/images/menu/fallback.svg";

// Images used when an admin saves a dish without picking a photo.
// All 80 menu items have unique local images organized by category.
export const DISH_IMAGE_LIBRARY = {
  // Veg (20 items)
  "Vegetable Dum Biryani": "/images/menu/veg/vegetable-dum-biryani.jpg",
  "Paneer Butter Masala": "/images/menu/veg/paneer-butter-masala.jpg",
  "Paneer Tikka Masala": "/images/menu/veg/paneer-tikka-masala.jpg",
  "Palak Paneer": "/images/menu/veg/palak-paneer.jpg",
  "Vegetable Korma": "/images/menu/veg/vegetable-korma.jpg",
  "Malai Kofta": "/images/menu/veg/malai-kofta.jpg",
  "Chana Masala": "/images/menu/veg/chana-masala.jpg",
  "Dal Makhani": "/images/menu/veg/dal-makhani.jpg",
  "Vegetable Fried Rice": "/images/menu/veg/vegetable-fried-rice.jpg",
  "Jeera Rice": "/images/menu/veg/jeera-rice.jpg",
  "Veg Pulao": "/images/menu/veg/veg-pulao.jpg",
  "Aloo Gobi": "/images/menu/veg/aloo-gobi.jpg",
  "Bhindi Masala": "/images/menu/veg/bhindi-masala.jpg",
  "Mushroom Masala": "/images/menu/veg/mushroom-masala.jpg",
  "Kadai Paneer": "/images/menu/veg/kadai-paneer.jpg",
  "Navratan Korma": "/images/menu/veg/navratan-korma.jpg",
  "Paneer Bhurji": "/images/menu/veg/paneer-bhurji.jpg",
  "Vegetable Jalfrezi": "/images/menu/veg/vegetable-jalfrezi.jpg",
  "Corn Palak": "/images/menu/veg/corn-palak.jpg",
  "Gobi Manchurian": "/images/menu/veg/gobi-manchurian.jpg",

  // Non-Veg (20 items)
  "Hyderabadi Chicken Dum Biryani": "/images/menu/non-veg/hyderabadi-chicken-dum-biryani.jpg",
  "Chicken Butter Masala": "/images/menu/non-veg/chicken-butter-masala.jpg",
  "Chicken Tikka Masala": "/images/menu/non-veg/chicken-tikka-masala.jpg",
  "Chicken Korma": "/images/menu/non-veg/chicken-korma.jpg",
  "Chicken Chettinad": "/images/menu/non-veg/chicken-chettinad.jpg",
  "Mutton Rogan Josh": "/images/menu/non-veg/mutton-rogan-josh.jpg",
  "Mutton Biryani": "/images/menu/non-veg/mutton-biryani.jpg",
  "Fish Curry": "/images/menu/non-veg/fish-curry.jpg",
  "Prawn Masala": "/images/menu/non-veg/prawn-masala.jpg",
  "Chicken 65": "/images/menu/non-veg/chicken-65.jpg",
  "Tandoori Chicken": "/images/menu/non-veg/tandoori-chicken.jpg",
  "Chicken Lollipop": "/images/menu/non-veg/chicken-lollipop.jpg",
  "Mutton Kheema": "/images/menu/non-veg/mutton-kheema.jpg",
  "Chicken Kolhapuri": "/images/menu/non-veg/chicken-kolhapuri.jpg",
  "Amritsari Fish": "/images/menu/non-veg/amritsari-fish.jpg",
  "Chicken Saagwala": "/images/menu/non-veg/chicken-saagwala.jpg",
  "Egg Curry": "/images/menu/non-veg/egg-curry.jpg",
  "Mutton Korma": "/images/menu/non-veg/mutton-korma.jpg",
  "Chicken Vindaloo": "/images/menu/non-veg/chicken-vindaloo.jpg",
  "Fish Tikka": "/images/menu/non-veg/fish-tikka.jpg",

  // Desserts (20 items)
  "Gulab Jamun": "/images/menu/desserts/gulab-jamun.jpg",
  "Rasmalai": "/images/menu/desserts/rasmalai.jpg",
  "Kesar Kulfi": "/images/menu/desserts/kesar-kulfi.jpg",
  "Gajar Ka Halwa": "/images/menu/desserts/gajar-ka-halwa.jpg",
  "Shahi Tukda": "/images/menu/desserts/shahi-tukda.jpg",
  "Kaju Katli": "/images/menu/desserts/kaju-katli.jpg",
  "Rasgulla": "/images/menu/desserts/rasgulla.jpg",
  "Mysore Pak": "/images/menu/desserts/mysore-pak.jpg",
  "Phirni": "/images/menu/desserts/phirni.jpg",
  "Jalebi": "/images/menu/desserts/jalebi.jpg",
  "Malpua": "/images/menu/desserts/malpua.jpg",
  "Kheer": "/images/menu/desserts/kheer.jpg",
  "Sandesh": "/images/menu/desserts/sandesh.jpg",
  "Cham Cham": "/images/menu/desserts/cham-cham.jpg",
  "Peda": "/images/menu/desserts/peda.jpg",
  "Modak": "/images/menu/desserts/modak.jpg",
  "Besan Ladoo": "/images/menu/desserts/besan-ladoo.jpg",
  "Coconut Barfi": "/images/menu/desserts/coconut-barfi.jpg",
  "Anjeer Halwa": "/images/menu/desserts/anjeer-halwa.jpg",
  "Chocolate Brownie": "/images/menu/desserts/chocolate-brownie.jpg",

  // Cool Drinks (20 items)
  "Mango Lassi": "/images/menu/drinks/mango-lassi.jpg",
  "Sweet Lassi": "/images/menu/drinks/sweet-lassi.jpg",
  "Salted Lassi": "/images/menu/drinks/salted-lassi.jpg",
  "Masala Chaas": "/images/menu/drinks/masala-chaas.jpg",
  "Fresh Lime Soda": "/images/menu/drinks/fresh-lime-soda.jpg",
  "Watermelon Juice": "/images/menu/drinks/watermelon-juice.jpg",
  "Orange Juice": "/images/menu/drinks/orange-juice.jpg",
  "Pineapple Juice": "/images/menu/drinks/pineapple-juice.jpg",
  "Mix Fruit Juice": "/images/menu/drinks/mix-fruit-juice.jpg",
  "Cold Coffee": "/images/menu/drinks/cold-coffee.jpg",
  "Chocolate Milkshake": "/images/menu/drinks/chocolate-milkshake.jpg",
  "Strawberry Milkshake": "/images/menu/drinks/strawberry-milkshake.jpg",
  "Vanilla Milkshake": "/images/menu/drinks/vanilla-milkshake.jpg",
  "Oreo Milkshake": "/images/menu/drinks/oreo-milkshake.jpg",
  "Mango Milkshake": "/images/menu/drinks/mango-milkshake.jpg",
  "Virgin Mojito": "/images/menu/drinks/virgin-mojito.jpg",
  "Blue Lagoon": "/images/menu/drinks/blue-lagoon.jpg",
  "Cranberry Cooler": "/images/menu/drinks/cranberry-cooler.jpg",
  "Iced Tea": "/images/menu/drinks/iced-tea.jpg",
  "Rose Falooda": "/images/menu/drinks/rose-falooda.jpg",

  // Legacy items for backward compatibility (names not in the main 80)
  "Chicken Biryani": "/images/menu/non-veg/hyderabadi-chicken-dum-biryani.jpg",
  "Butter Chicken": "/images/menu/non-veg/chicken-butter-masala.jpg",
  "Veg Fried Rice": "/images/menu/veg/vegetable-fried-rice.jpg",
  "Masala Dosa": "/images/menu/veg/veg-pulao.jpg",
  "Idli Sambar": "/images/menu/veg/aloo-gobi.jpg",
  "Filter Coffee": "/images/menu/drinks/cold-coffee.jpg",
  "Veg Samosa": "/images/menu/veg/veg-pulao.jpg",
  "Choco Brownie": "/images/menu/desserts/chocolate-brownie.jpg",
  "Margherita Pizza": "/images/menu/veg/veg-pulao.jpg",
  "Pepperoni Pizza": "/images/menu/non-veg/chicken-tikka-masala.jpg",
  "Garlic Bread": "/images/menu/veg/veg-pulao.jpg",
  "Caesar Salad": "/images/menu/veg/bhindi-masala.jpg",
  "Tiramisu": "/images/menu/desserts/chocolate-brownie.jpg",
  "Cappuccino": "/images/menu/drinks/cold-coffee.jpg",
  "Milkshake": "/images/menu/drinks/vanilla-milkshake.jpg",
};

// Keywords used to guess a photo for an unknown dish name.
const KEYWORD_IMAGES = [
  ["biryani", "/images/menu/veg/vegetable-dum-biryani.jpg"],
  ["pizza", "/images/menu/veg/veg-pulao.jpg"],
  ["burger", "/images/menu/non-veg/chicken-tikka-masala.jpg"],
  ["pasta", "/images/menu/veg/vegetable-jalfrezi.jpg"],
  ["salad", "/images/menu/veg/bhindi-masala.jpg"],
  ["soup", "/images/menu/veg/dal-makhani.jpg"],
  ["dessert", "/images/menu/desserts/gulab-jamun.jpg"],
  ["cake", "/images/menu/desserts/chocolate-brownie.jpg"],
  ["coffee", "/images/menu/drinks/cold-coffee.jpg"],
  ["tea", "/images/menu/drinks/iced-tea.jpg"],
  ["juice", "/images/menu/drinks/mango-lassi.jpg"],
  ["rice", "/images/menu/veg/jeera-rice.jpg"],
  ["chicken", "/images/menu/non-veg/chicken-butter-masala.jpg"],
  ["fish", "/images/menu/non-veg/fish-curry.jpg"],
  ["dosa", "/images/menu/veg/veg-pulao.jpg"],
  ["lassi", "/images/menu/drinks/mango-lassi.jpg"],
  ["milkshake", "/images/menu/drinks/vanilla-milkshake.jpg"],
  ["mocktail", "/images/menu/drinks/virgin-mojito.jpg"],
  ["falooda", "/images/menu/drinks/rose-falooda.jpg"],
];

// Turns an uploaded file path such as "/static/menu/ab12.png" into
// an absolute URL the browser can load.
export const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return "";
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Local paths under /images/menu/ are served from the frontend public dir
  if (imageUrl.startsWith("/images/")) {
    const separator = imageUrl.includes("?") ? "&" : "?";
    return `${imageUrl}${separator}v=${IMAGE_VERSION}`;
  }

  if (imageUrl.startsWith("/static/")) {
    return API_BASE.replace(/\/$/, "") + imageUrl;
  }

  return imageUrl;
};

// Accepts a menu item or a bare dish name and returns a usable URL.
export const getDishImage = (source) => {
  const name =
    typeof source === "string"
      ? source
      : source?.name ?? source?.menu_item ?? "";

  const stored = typeof source === "string" ? "" : source?.image_url;

  const resolved = resolveImageUrl(stored);

  if (resolved) {
    return resolved;
  }

  if (DISH_IMAGE_LIBRARY[name]) {
    return DISH_IMAGE_LIBRARY[name];
  }

  const lower = name.toLowerCase();

  const keywordMatch = KEYWORD_IMAGES.find(([keyword]) =>
    lower.includes(keyword)
  );

  if (keywordMatch) {
    return keywordMatch[1];
  }

  return FALLBACK_DISH_IMAGE;
};

// A menu item may declare is_vegetarian; older rows do not, so fall
// back to reading the dish name.
export const isVegItem = (item) => {
  if (typeof item?.is_vegetarian === "boolean") {
    return item.is_vegetarian;
  }

  const nonVegKeywords = [
    "chicken",
    "mutton",
    "fish",
    "meat",
    "prawn",
    "egg",
    "beef",
    "pork",
    "wings",
    "steak",
  ];

  const lower =
    ((item?.name ?? "") + " " + (item?.category ?? "")).toLowerCase();

  return !nonVegKeywords.some((keyword) => lower.includes(keyword));
};

export const spiceLabel = (level) => {
  const value = Number(level) || 0;

  if (value >= 3) return "Extra Hot";
  if (value === 2) return "Spicy";
  if (value === 1) return "Mild";
  return "Not Spicy";
};