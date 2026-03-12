/**
 * Donut Buff - Menu Configuration
 *
 * Add or remove donut items here. Each item needs:
 *   id        - unique slug (used for image filename: images/<id>.jpg)
 *   name      - display name
 *   type      - "Yeast" | "Cake"
 *   description - short blurb shown on the card
 *   price     - single donut price (number)
 *   dozen     - price per dozen (number)
 *   image     - path to photo (place real photos in images/)
 *   ingredients.topping - array of topping ingredients
 *   ingredients.dough   - array of dough ingredients
 *
 * Special items (isLetters: true) use different pricing fields:
 *   pricePerGroup - price for one group of letters (number)
 *   groupSize     - how many letters are in one group (number)
 *   pricePerExtra - price per individual extra letter (number)
 */

/**
 * Business configuration — controls date/time availability in the order form.
 *
 * hours:
 *   Each day maps to [openTime, closeTime] in 24-hour "HH:MM" format.
 *   Use ["00:00", "00:00"] to mark a day as fully closed.
 *
 * closedDates:
 *   An array of overrides that mark specific dates as closed regardless of
 *   the normal weekly hours. Each entry is either:
 *     - A day-name string:  "Sunday"  (closes every Sunday)
 *     - A date array:       ["March", "4", "2026"]  (closes one specific date)
 */
const BUSINESS_CONFIG = {
  hours: {
    monday:    ["08:00", "15:30"],
    tuesday:   ["08:00", "15:30"],
    wednesday: ["08:00", "15:30"],
    thursday:  ["08:00", "15:30"],
    friday:    ["08:00", "15:30"],
    saturday:  ["08:00", "12:00"],
    sunday:    ["00:00", "00:00"],
  },

  closedDates: [
    // ["March", "4", "2026"],  // one-off holiday example
    // "Sunday",                // redundant with hours above, but supported
  ],
};

const MENU_DATA = [
  // ── Yeast Donuts ─────────────────────────────────────────────────────────
  {
    id: "yeast-glazed",
    name: "Glazed",
    type: "Yeast",
    description:
      "Light and airy with a perfectly sweet vanilla glaze. The classic that started it all.",
    price: 2.0,
    dozen: 22.8,
    image: "images/yeast-glazed.jpg",
    ingredients: {
      topping: ["powdered sugar", "milk", "pure vanilla extract", "salt"],
      dough: [
        "unbleached wheat flour",
        "water",
        "grass-fed butter",
        "sugar",
        "eggs",
        "yeast",
        "pure vanilla extract",
        "salt",
      ],
    },
  },
  {
    id: "yeast-cinnamon-sugar",
    name: "Cinnamon Sugar",
    type: "Yeast",
    description:
      "Soft yeast donut rolled in a warm cinnamon and sugar coating — comfort in every bite.",
    price: 2.0,
    dozen: 22.8,
    image: "images/yeast-cinnamon-sugar.jpg",
    ingredients: {
      topping: ["cinnamon", "sugar"],
      dough: [
        "unbleached wheat flour",
        "water",
        "grass-fed butter",
        "sugar",
        "eggs",
        "yeast",
        "pure vanilla extract",
        "salt",
      ],
    },
  },
  {
    id: "yeast-maple",
    name: "Maple",
    type: "Yeast",
    description:
      "Fluffy yeast donut glazed with real pure maple syrup for a rich, natural sweetness.",
    price: 2.25,
    dozen: 25.8,
    image: "images/yeast-maple.jpg",
    ingredients: {
      topping: [
        "powdered sugar",
        "pure maple syrup",
        "milk",
        "maple extract",
        "salt",
      ],
      dough: [
        "unbleached wheat flour",
        "water",
        "grass-fed butter",
        "sugar",
        "eggs",
        "yeast",
        "pure vanilla extract",
        "salt",
      ],
    },
  },
  {
    id: "yeast-dark-chocolate-glazed",
    name: "Dark Chocolate Glazed",
    type: "Yeast",
    description:
      "Pillowy yeast donut dipped in a deep, velvety dark chocolate glaze.",
    price: 2.25,
    dozen: 25.8,
    image: "images/yeast-dark-chocolate-glazed.jpg",
    ingredients: {
      topping: [
        "powdered sugar",
        "cocoa powder",
        "butter",
        "pure vanilla extract",
        "water",
      ],
      dough: [
        "unbleached wheat flour",
        "water",
        "grass-fed butter",
        "sugar",
        "eggs",
        "yeast",
        "pure vanilla extract",
        "salt",
      ],
    },
  },
  {
    id: "yeast-sprinkles",
    name: "Sprinkles",
    type: "Yeast",
    description:
      "Our classic vanilla-glazed yeast donut topped with a rainbow of festive sprinkles.",
    price: 2.25,
    dozen: 25.8,
    image: "images/yeast-sprinkles.jpg",
    ingredients: {
      topping: [
        "sprinkles",
        "powdered sugar",
        "milk",
        "pure vanilla extract",
        "salt",
      ],
      dough: [
        "unbleached wheat flour",
        "water",
        "grass-fed butter",
        "sugar",
        "eggs",
        "yeast",
        "pure vanilla extract",
        "salt",
      ],
    },
  },
  {
    id: "yeast-apple-fritter",
    name: "Apple Fritter",
    type: "Yeast",
    description:
      "Generous chunks of real apple folded into a cinnamon-spiced dough, fried golden and drizzled with vanilla glaze.",
    price: 3.0,
    dozen: 34.8,
    image: "images/yeast-apple-fritter.jpg",
    ingredients: {
      topping: ["powdered sugar", "milk", "pure vanilla extract", "salt"],
      dough: [
        "unbleached wheat flour",
        "water",
        "grass-fed butter",
        "sugar",
        "apples",
        "eggs",
        "yeast",
        "pure vanilla extract",
        "cinnamon",
        "salt",
      ],
    },
  },

  // ── Cake Donuts ───────────────────────────────────────────────────────────
  {
    id: "cake-glazed",
    name: "Glazed",
    type: "Cake",
    description:
      "Dense and moist cake donut with a smooth vanilla glaze — a satisfying, sturdy classic.",
    price: 2.3,
    dozen: 26.4,
    image: "images/cake-glazed.jpg",
    ingredients: {
      topping: ["powdered sugar", "milk", "pure vanilla extract", "salt"],
      dough: [
        "unbleached cake flour",
        "sugar",
        "eggs",
        "buttermilk",
        "grass-fed butter",
        "baking powder",
        "pure vanilla extract",
        "nutmeg",
        "salt",
      ],
    },
  },
  {
    id: "cake-maple",
    name: "Maple",
    type: "Cake",
    description:
      "Rich cake donut crowned with a pure maple glaze that soaks right in.",
    price: 2.4,
    dozen: 27.6,
    image: "images/cake-maple.jpg",
    ingredients: {
      topping: [
        "powdered sugar",
        "pure maple syrup",
        "milk",
        "maple extract",
        "salt",
      ],
      dough: [
        "unbleached cake flour",
        "sugar",
        "eggs",
        "buttermilk",
        "grass-fed butter",
        "baking powder",
        "pure vanilla extract",
        "nutmeg",
        "salt",
      ],
    },
  },
  {
    id: "cake-dark-chocolate-glazed",
    name: "Dark Chocolate Glazed",
    type: "Cake",
    description:
      "Tender cake donut wrapped in an indulgent dark chocolate glaze — chocolate lover's dream.",
    price: 2.4,
    dozen: 27.6,
    image: "images/cake-dark-chocolate-glazed.jpg",
    ingredients: {
      topping: [
        "powdered sugar",
        "cocoa powder",
        "butter",
        "pure vanilla extract",
        "water",
      ],
      dough: [
        "unbleached cake flour",
        "sugar",
        "eggs",
        "buttermilk",
        "grass-fed butter",
        "baking powder",
        "pure vanilla extract",
        "nutmeg",
        "salt",
      ],
    },
  },
  {
    id: "build-your-own",
    name: "Build Your Box",
    type: "Assorted",
    isAssorted: true,
    description:
      `Mix and match a dozen of any* assortment of our glazed, maple, cinnamon sugar, sprinkles, or dark-chocolate glazed.
      <br><br>&nbsp;&nbsp;&nbsp;* jelly filled and apple fritters not included.`,
    price: 21.6,  
    dozen: 21.6,
    image: "images/build-your-own.jpg",
    ingredients: {
      topping: [
        "See individual donut for list of topping ingredients.",
      ],
      dough: [
        "See individual donut for list of dough ingredients.",
      ],
    },
  },
  {
    id: "yeast-glazed-letters",
    name: "Glazed Letters",
    type: "Yeast",
    isLetters: true,
    description:
      "Spell out a special message with our classic glazed donuts. Order a 6-letter pack to get started, then add extra individual letters as needed.",
    pricePerGroup: 20.0,
    groupSize: 6,
    pricePerExtra: 2.0,
    image: "images/yeast-glazed-letters.jpg",
    ingredients: {
      topping: [
        "powdered sugar",
        "cocoa powder",
        "butter",
        "pure vanilla extract",
        "water",
      ],
      dough: [
        "unbleached wheat flour",
        "water",
        "grass-fed butter",
        "sugar",
        "eggs",
        "yeast",
        "pure vanilla extract",
        "salt",
      ],
    },
  }
];
