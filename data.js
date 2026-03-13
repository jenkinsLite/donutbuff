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
    name: "Glazed original",
    type: "Yeast",
    description:
      "Light and airy with a perfectly sweet vanilla glaze. The classic that started it all.",
    price: 1.8,
    dozen: 20.4,
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
    id: "yeast-glazed-sprinkles",
    name: "Glazed original with sprinkles",
    type: "Yeast",
    description:
      "Light and airy with a perfectly sweet vanilla glaze. The classic that started it all.",
    price: 1.9,
    dozen: 21.6,
    image: "images/yeast-glazed-sprinkles.jpg",
    ingredients: {
      topping: ["powdered sugar", "milk", "pure vanilla extract", "salt", "sprinkles"],
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
    name: "Cinnamon sugar original",
    type: "Yeast",
    description:
      "Soft yeast donut rolled in a warm cinnamon and sugar coating — comfort in every bite.",
    price: 1.8,
    dozen: 20.4,
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
    id: "yeast-chocolate-glazed",
    name: "Chocolate glazed",
    type: "Yeast",
    description:
      "Pillowy yeast donut dipped in a deep, velvety dark chocolate glaze.",
    price: 1.9,
    dozen: 21.6,
    image: "images/yeast-chocolate-glazed.jpg",
    ingredients: {
      topping: [
        "powdered sugar",
        "cocoa powder",
        "butter",
        "vanilla extract",
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
    id: "yeast-chocolate-glazed-sprinkles",
    name: "Chocolate glazed with sprinkles",
    type: "Yeast",
    description:
      "Pillowy yeast donut dipped in a deep, velvety dark chocolate glaze.",
    price: 1.9,
    dozen: 21.6,
    image: "images/yeast-chocolate-glazed-sprinkles.jpg",
    ingredients: {
      topping: [
        "powdered sugar",
        "cocoa powder",
        "butter",
        "vanilla extract",
        "water",
        "sprinkles",
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
    id: "yeast-maple",
    name: "Maple glazed",
    type: "Yeast",
    description:
      "Fluffy yeast donut glazed with a rich, sweet maple glaze — warm and indulgent in every bite.",
    price: 1.9,
    dozen: 21.6,
    image: "images/yeast-maple.jpg",
    ingredients: {
      topping: [
        "powdered sugar",
        "butter",
        "brown sugar",
        "milk",
        "maple extract",
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
    id: "yeast-maple-sprinkles",
    name: "Maple glazed with sprinkles",
    type: "Yeast",
    description:
      "Fluffy yeast donut glazed with a rich, sweet maple glaze — warm and indulgent in every bite.",
    price: 1.9,
    dozen: 21.6,
    image: "images/yeast-maple-sprinkles.jpg",
    ingredients: {
      topping: [
        "powdered sugar",
        "butter",
        "brown sugar",
        "milk",
        "maple extract",
        "sprinkles",
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
    name: "Apple fritter",
    type: "Yeast",
    description:
      "Generous chunks of real apple folded into a cinnamon-spiced dough, fried golden and drizzled with vanilla glaze.",
    price: 2.5,
    dozen: 30.0,
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
  {
    id: "strawberry-filled",
    name: "Strawberry filled",
    type: "Yeast",
    description:
      "Light and airy with a perfectly sweet vanilla glaze and the perfect amount of strawberry filling.",
    price: 2.25,
    dozen: 27.0,
    image: "images/strawberry-filled.jpg",
    ingredients: {
      topping: ["powdered sugar", "milk", "pure vanilla extract", "salt"],
      dough: [
        "unbleached wheat flour",
        "water",
        "grass-fed butter",
        "sugar",
        "eggs",
        "jam (organic strawberries, organic cane sugar, water, pectin, citric acid)",
        "yeast",
        "pure vanilla extract",
        "salt",
      ],
    },
  },
  {
    id: "raspberry-filled",
    name: "Raspberry filled",
    type: "Yeast",
    description:
      "Light and airy with a perfectly sweet vanilla glaze and the perfect amount of raspberry filling.",
    price: 2.25,
    dozen: 27.0,
    image: "images/raspberry-filled.jpg",
    ingredients: {
      topping: ["powdered sugar", "milk", "pure vanilla extract", "salt"],
      dough: [
        "unbleached wheat flour",
        "water",
        "grass-fed butter",
        "sugar",
        "eggs",
        "jam (organic raspberries, organic cane sugar, water, pectin, citric acid)",
        "yeast",
        "pure vanilla extract",
        "salt",
      ],
    },
  },
  {
    id: "donut-holes",
    name: "Donut holes",
    type: "Yeast",
    description:
      "Our classic Glazed original donut in a bite size.",
    price: 0.3,
    dozen: 3.24,
    image: "images/donut-holes.jpg",
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

  // ── Cake Donuts ───────────────────────────────────────────────────────────
  {
    id: "cake-glazed",
    name: "Glazed cake",
    type: "Cake",
    description:
      "Dense and moist cake donut with a smooth vanilla glaze — a satisfying, sturdy classic.",
    price: 2.0,
    dozen: 22.8,
    image: "images/cake-glazed.jpg",
    ingredients: {
      topping: ["powdered sugar", "milk", "pure vanilla extract", "salt"],
      dough: [
        "unbleached wheat flour",
        "milk",
        "sugar",
        "grass-fed butter",
        "eggs",
        "baking powder",
        "salt",
        "nutmeg",
        "cinnamon",
      ],
    },
  },
  {
    id: "cake-maple",
    name: "Maple glazed cake",
    type: "Cake",
    description:
      "Rich cake donut crowned with a sweet maple glaze that soaks right in.",
    price: 2.1,
    dozen: 24.0,
    image: "images/cake-maple.jpg",
    ingredients: {
      topping: [
        "powdered sugar",
        "butter",
        "brown sugar",
        "milk",
        "maple extract",
      ],
      dough: [
        "unbleached wheat flour",
        "milk",
        "sugar",
        "grass-fed butter",
        "eggs",
        "baking powder",
        "salt",
        "nutmeg",
        "cinnamon",
      ],
    },
  },
  {
    id: "cake-maple-sprinkles",
    name: "Maple glazed cake with sprinkles",
    type: "Cake",
    description:
      "Rich cake donut crowned with a sweet maple glaze and colorful sprinkles.",
    price: 2.1,
    dozen: 24.0,
    image: "images/cake-maple-sprinkles.jpg",
    ingredients: {
      topping: [
        "powdered sugar",
        "butter",
        "brown sugar",
        "milk",
        "maple extract",
        "sprinkles",
      ],
      dough: [
        "unbleached wheat flour",
        "milk",
        "sugar",
        "grass-fed butter",
        "eggs",
        "baking powder",
        "salt",
        "nutmeg",
        "cinnamon",
      ],
    },
  },
  {
    id: "cake-chocolate-glazed",
    name: "Chocolate glazed cake",
    type: "Cake",
    description:
      "Tender cake donut wrapped in an indulgent dark chocolate glaze — chocolate lover's dream.",
    price: 2.1,
    dozen: 24.0,
    image: "images/cake-chocolate-glazed.jpg",
    ingredients: {
      topping: [
        "powdered sugar",
        "cocoa powder",
        "butter",
        "vanilla extract",
        "water",
      ],
      dough: [
        "unbleached wheat flour",
        "milk",
        "sugar",
        "grass-fed butter",
        "eggs",
        "baking powder",
        "salt",
        "nutmeg",
        "cinnamon",
      ],
    },
  },
  {
    id: "cake-chocolate-glazed-sprinkles",
    name: "Chocolate glazed cake with sprinkles",
    type: "Cake",
    description:
      "Tender cake donut wrapped in an indulgent dark chocolate glaze — chocolate lover's dream.",
    price: 2.1,
    dozen: 24.0,
    image: "images/cake-chocolate-glazed-sprinkles.jpg",
    ingredients: {
      topping: [
        "powdered sugar",
        "cocoa powder",
        "butter",
        "vanilla extract",
        "water",
        "sprinkles",
      ],
      dough: [
        "unbleached wheat flour",
        "milk",
        "sugar",
        "grass-fed butter",
        "eggs",
        "baking powder",
        "salt",
        "nutmeg",
        "cinnamon",
      ],
    },
  },
  {
    id: "yeast-glazed-heart",
    name: "Glazed hearts with heart overlay",
    type: "Yeast",
    description:
      "Light and airy with a perfectly sweet vanilla glaze. The classic that started it all.",
    price: 1.85,
    dozen: 21.0,
    image: "images/yeast-glazed-heart.jpg",
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
    id: "yeast-glazed-mini",
    name: "Glazed original mini",
    type: "Yeast",
    description:
      "Light and airy with a perfectly sweet vanilla glaze. The classic that started it all.",
    price: 18.0,
    dozen: 18.0,
    image: "images/yeast-glazed-mini.jpg",
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
    id: "carrot-cake",
    name: "Carrot cake",
    type: "Cake",
    description:
      "Moist cake donut packed with fresh carrots and warm cinnamon, finished with a luscious cream cheese frosting.",
    price: 2.1,
    dozen: 24.0,
    image: "images/carrot-cake.jpg",
    ingredients: {
      topping: ["cream cheese", "powdered sugar", "butter"],
      dough: [
        "unbleached wheat flour",
        "milk",
        "sugar",
        "grass-fed butter",
        "carrots",
        "eggs",
        "salt",
        "baking powder",
        "cinnamon",
      ],
    },
  },
  {
    id: "build-your-own",
    name: "Build your box",
    type: "Assorted",
    isAssorted: true,
    description:
      `Mix and match a dozen of any* assortment of our glazed, maple, cinnamon sugar, sprinkles, or dark-chocolate glazed.
      <br><br>&nbsp;&nbsp;&nbsp;* jelly filled and apple fritters and specials not included.`,
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
    name: "Glazed letters and numbers",
    type: "Yeast",
    isLetters: true,
    description:
      "Spell out a special message with our classic glazed donuts. Order a 6-letter pack to get started, then add extra individual letters as needed.",
    pricePerGroup: 20.0,
    groupSize: 6,
    pricePerExtra: 2.0,
    image: "images/yeast-glazed-letters.jpg",
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
    id: "yeast-glazed-letters-sprinkles",
    name: "Glazed letters and numbers with sprinkles",
    type: "Yeast",
    isLetters: true,
    description:
      "Spell out a special message with our classic glazed donuts. Order a 6-letter pack to get started, then add extra individual letters as needed.",
    pricePerGroup: 21.0,
    groupSize: 6,
    pricePerExtra: 2.1,
    image: "images/yeast-glazed-letters-sprinkles.jpg",
    ingredients: {
      topping: ["powdered sugar", "milk", "pure vanilla extract", "salt", "sprinkles"],
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
    id: "yeast-gluten-free",
    name: "Gluten free yeast",
    type: "Yeast",
    description:
      "Light and airy with a perfectly sweet vanilla glaze. The classic that started it all.",
    price: 27.0,
    dozen: 27.0,
    image: "images/yeast-gluten-free.jpg",
    ingredients: {
      topping: ["powdered sugar", "milk", "pure vanilla extract", "salt"],
      dough: [
        "gluten free flour",
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
];
