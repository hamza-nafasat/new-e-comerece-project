const categoriesOptions: string[] = ["mens", "womens", "girls", "boys"];
const subCategoriesOptions: Record<string, string[]> = {
  womens: ["sweaters", "jackets-&-coats", "shirts-/-blouse", "jeans"],

  mens: [
    "shirt",
    "pants-&-trouser",
    "jackets-&-hoodie",
    "sweater",
    "pant-coats",
    "shirwani",
    "eastren-wear",
  ],

  girls: [
    "shirt",
    "pant-&-capry",
    "jackets-&-hoodie",
    "sweatshirt",
    "maxi-dresses",
    "ready-to-wear",
    "barbie-dresses",
  ],

  boys: [
    "shirt",
    "pant-&-capry",
    "jackets-&-hoodie",
    "sweatshirt",
    "maxi-dresses",
    "ready-to-wear",
    "barbie-dresses",
  ],
};

export { categoriesOptions, subCategoriesOptions };
