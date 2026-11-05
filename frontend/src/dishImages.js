// Shared dish image helpers.
//
// The backend stores an image URL on every menu item (either an
// uploaded file under /static/menu or a local path under /images/menu).
// These helpers resolve that value into something renderable and fall
// back to a matching stock photo when a dish has no image yet.

const API_BASE =
  import.meta.env.VITE_API_URL;

// Cache-busting version for menu images.
// Increment this when images are replaced so browsers fetch the new versions.
const IMAGE_VERSION = "5";

// Local fallback image for dishes without an image.
export const FALLBACK_DISH_IMAGE = "/images/menu/fallback.svg";

// Images for the 80 famous menu items (Paradise Restaurant Premium Menu).
// All 80 menu items have unique local images organized by category.
// Format: dishName -> "/images/menu/<category>/<slug>.webp"
export const DISH_IMAGE_LIBRARY = {
  // Vegetarian (20 items)
  "Paneer Butter Masala": "/images/menu/veg/paneer-butter-masala.webp",
  "Kadai Paneer": "/images/menu/veg/kadai-paneer.webp",
  "Shahi Paneer": "/images/menu/veg/shahi-paneer.webp",
  "Palak Paneer": "/images/menu/veg/palak-paneer.webp",
  "Paneer Tikka Masala": "/images/menu/veg/paneer-tikka-masala.webp",
  "Malai Kofta": "/images/menu/veg/malai-kofta.webp",
  "Dal Makhani": "/images/menu/veg/dal-makhani.webp",
  "Chana Masala": "/images/menu/veg/chana-masala.webp",
  "Aloo Gobi": "/images/menu/veg/aloo-gobi.webp",
  "Veg Kolhapuri": "/images/menu/veg/veg-kolhapuri.webp",
  "Vegetable Biryani": "/images/menu/veg/vegetable-biryani.webp",
  "Veg Pulao": "/images/menu/veg/veg-pulao.webp",
  "Gobi Manchurian": "/images/menu/veg/gobi-manchurian.webp",
  "Mushroom Masala": "/images/menu/veg/mushroom-masala.webp",
  "Navratan Korma": "/images/menu/veg/navratan-korma.webp",
  "Paneer Tikka": "/images/menu/veg/paneer-tikka.webp",
  "Hara Bhara Kebab": "/images/menu/veg/hara-bhara-kebab.webp",
  "Masala Dosa": "/images/menu/veg/masala-dosa.webp",
  "Veg Fried Rice": "/images/menu/veg/veg-fried-rice.webp",
  "Stuffed Cheese Naan": "/images/menu/veg/stuffed-cheese-naan.webp",

  // Non-Vegetarian (20 items)
  "Hyderabadi Chicken Dum Biryani": "/images/menu/non-veg/hyderabadi-chicken-dum-biryani.webp",
  "Chicken 65": "/images/menu/non-veg/chicken-65.webp",
  "Butter Chicken": "/images/menu/non-veg/butter-chicken.webp",
  "Chicken Tikka Masala": "/images/menu/non-veg/chicken-tikka-masala.webp",
  "Tandoori Chicken": "/images/menu/non-veg/tandoori-chicken.webp",
  "Chicken Chettinad": "/images/menu/non-veg/chicken-chettinad.webp",
  "Chicken Lollipop": "/images/menu/non-veg/chicken-lollipop.webp",
  "Chicken Korma": "/images/menu/non-veg/chicken-korma.webp",
  "Chicken Kolhapuri": "/images/menu/non-veg/chicken-kolhapuri.webp",
  "Chicken Shawarma": "/images/menu/non-veg/chicken-shawarma.webp",
  "Mutton Biryani": "/images/menu/non-veg/mutton-biryani.webp",
  "Mutton Rogan Josh": "/images/menu/non-veg/mutton-rogan-josh.webp",
  "Mutton Kheema": "/images/menu/non-veg/mutton-kheema.webp",
  "Mutton Korma": "/images/menu/non-veg/mutton-korma.webp",
  "Fish Curry": "/images/menu/non-veg/fish-curry.webp",
  "Amritsari Fish Fry": "/images/menu/non-veg/amritsari-fish-fry.webp",
  "Fish Tikka": "/images/menu/non-veg/fish-tikka.webp",
  "Prawn Masala": "/images/menu/non-veg/prawn-masala.webp",
  "Prawn Fry": "/images/menu/non-veg/prawn-fry.webp",
  "Egg Curry": "/images/menu/non-veg/egg-curry.webp",

  // Desserts (20 items)
  "Gulab Jamun": "/images/menu/desserts/gulab-jamun.webp",
  "Rasmalai": "/images/menu/desserts/rasmalai.webp",
  "Gajar Ka Halwa": "/images/menu/desserts/gajar-ka-halwa.webp",
  "Kaju Katli": "/images/menu/desserts/kaju-katli.webp",
  "Jalebi": "/images/menu/desserts/jalebi.webp",
  "Rabri": "/images/menu/desserts/rabri.webp",
  "Kulfi": "/images/menu/desserts/kulfi.webp",
  "Falooda": "/images/menu/desserts/falooda.webp",
  "Moong Dal Halwa": "/images/menu/desserts/moong-dal-halwa.webp",
  "Double Ka Meetha": "/images/menu/desserts/double-ka-meetha.webp",
  "Shahi Tukda": "/images/menu/desserts/shahi-tukda.webp",
  "Rasgulla": "/images/menu/desserts/rasgulla.webp",
  "Carrot Cake": "/images/menu/desserts/carrot-cake.webp",
  "Chocolate Brownie": "/images/menu/desserts/chocolate-brownie.webp",
  "Chocolate Lava Cake": "/images/menu/desserts/chocolate-lava-cake.webp",
  "Cheesecake": "/images/menu/desserts/cheesecake.webp",
  "Ice Cream Sundae": "/images/menu/desserts/ice-cream-sundae.webp",
  "Fruit Custard": "/images/menu/desserts/fruit-custard.webp",
  "Kheer": "/images/menu/desserts/kheer.webp",
  "Pista Kulfi": "/images/menu/desserts/pista-kulfi.webp",

  // Cool Drinks (20 items)
  "Fresh Lime Soda": "/images/menu/cool-drinks/fresh-lime-soda.webp",
  "Mango Milkshake": "/images/menu/cool-drinks/mango-milkshake.webp",
  "Chocolate Milkshake": "/images/menu/cool-drinks/chocolate-milkshake.webp",
  "Oreo Milkshake": "/images/menu/cool-drinks/oreo-milkshake.webp",
  "Strawberry Milkshake": "/images/menu/cool-drinks/strawberry-milkshake.webp",
  "Vanilla Milkshake": "/images/menu/cool-drinks/vanilla-milkshake.webp",
  "Cold Coffee": "/images/menu/cool-drinks/cold-coffee.webp",
  "Iced Tea": "/images/menu/cool-drinks/iced-tea.webp",
  "Lemon Iced Tea": "/images/menu/cool-drinks/lemon-iced-tea.webp",
  "Watermelon Juice": "/images/menu/cool-drinks/watermelon-juice.webp",
  "Orange Juice": "/images/menu/cool-drinks/orange-juice.webp",
  "Pineapple Juice": "/images/menu/cool-drinks/pineapple-juice.webp",
  "Sweet Lassi": "/images/menu/cool-drinks/sweet-lassi.webp",
  "Mango Lassi": "/images/menu/cool-drinks/mango-lassi.webp",
  "Rose Milk": "/images/menu/cool-drinks/rose-milk.webp",
  "Badam Milk": "/images/menu/cool-drinks/badam-milk.webp",
  "Buttermilk": "/images/menu/cool-drinks/buttermilk.webp",
  "Mojito (non-alcoholic)": "/images/menu/cool-drinks/mojito.webp",
  "Blue Lagoon (non-alcoholic)": "/images/menu/cool-drinks/blue-lagoon.webp",
  "Tender Coconut Water": "/images/menu/cool-drinks/tender-coconut-water.webp",

  // Legacy items for backward compatibility
  // Only include mappings that don't conflict with the 80 main items above
  "Vegetable Dum Biryani": "/images/menu/veg/veg-biryani.webp",
  "Vegetable Fried Rice": "/images/menu/veg/veg-fried-rice.webp",
  "Vegetable Korma": "/images/menu/veg/veg-kolhapuri.webp",
  "Jeera Rice": "/images/menu/veg/jeera-rice.webp",
  "Bhindi Masala": "/images/menu/veg/bhindi-masala.webp",
  "Vegetable Jalfrezi": "/images/menu/veg/veg-jalfrezi.webp",
  "Corn Palak": "/images/menu/veg/corn-palak.webp",
  "Paneer Bhurji": "/images/menu/veg/paneer-bhurji.webp",
  "Chicken Butter Masala": "/images/menu/non-veg/butter-chicken.webp",
  "Amritsari Fish": "/images/menu/non-veg/amritsari-fish-fry.webp",
  "Chicken Saagwala": "/images/menu/non-veg/chicken-saagwala.webp",
  "Chicken Vindaloo": "/images/menu/non-veg/chicken-vindaloo.webp",
  "Kesar Kulfi": "/images/menu/desserts/kulfi.webp",
  "Besan Ladoo": "/images/menu/desserts/besan-ladoo.webp",
  "Coconut Barfi": "/images/menu/desserts/coconut-barfi.webp",
  "Anjeer Halwa": "/images/menu/desserts/anjeer-halwa.webp",
  "Modak": "/images/menu/desserts/modak.webp",
  "Peda": "/images/menu/desserts/peda.webp",
  "Cham Cham": "/images/menu/desserts/cham-cham.webp",
  "Sandesh": "/images/menu/desserts/sandesh.webp",
  "Blue Lagoon": "/images/menu/cool-drinks/blue-lagoon.webp",
  "Mix Fruit Juice": "/images/menu/cool-drinks/mixed-fruit-juice.webp",
  "Iced Tea": "/images/menu/cool-drinks/iced-tea.webp",
  "Vanilla Milkshake": "/images/menu/cool-drinks/vanilla-milkshake.webp",
  "Cranberry Cooler": "/images/menu/cool-drinks/cranberry-cooler.webp",
};

const KEYWORD_IMAGES = [
  ["biryani", "/images/menu/veg/veg-biryani.webp"],
  ["pizza", "/images/menu/veg/veg-pizza.webp"],
  ["burger", "/images/menu/non-veg/chicken-burger.webp"],
  ["pasta", "/images/menu/veg/veg-noodles.webp"],
  ["salad", "/images/menu/veg/veg-pulao.webp"],
  ["soup", "/images/menu/veg/dal-makhani.webp"],
  ["dessert", "/images/menu/desserts/chocolate-brownie.webp"],
  ["cake", "/images/menu/desserts/chocolate-cake.webp"],
  ["coffee", "/images/menu/drinks/cold-coffee.webp"],
  ["tea", "/images/menu/drinks/iced-lemon-tea.webp"],
  ["juice", "/images/menu/drinks/mango-juice.webp"],
  ["rice", "/images/menu/veg/veg-pulao.webp"],
  ["chicken", "/images/menu/non-veg/chicken-curry.webp"],
  ["fish", "/images/menu/non-veg/fish-curry.webp"],
  ["dosa", "/images/menu/veg/masala-dosa.webp"],
  ["lassi", "/images/menu/drinks/mango-lassi.webp"],
  ["milkshake", "/images/menu/drinks/vanilla-milkshake.webp"],
  ["mocktail", "/images/menu/drinks/mojito.webp"],
  ["falooda", "/images/menu/drinks/falooda.webp"],
];

export const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return "";
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/images/")) {
    const separator = imageUrl.includes("?") ? "&" : "?";
    return `${imageUrl}${separator}v=${IMAGE_VERSION}`;
  }

  if (imageUrl.startsWith("/static/")) {
    return API_BASE.replace(/\/$/, "") + imageUrl;
  }

  return imageUrl;
};

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