export interface Ingredient {
    icon: string;
    label: string;
  }
  
  export const allIngredients = [
    { icon: "🍅", label: "기업" },
    { icon: "🥬", label: "문화" },
    { icon: "🧀", label: "교육" },
    { icon: "🥕", label: "Carrot" },
    { icon: "🍌", label: "Banana" },
    { icon: "🫐", label: "Blueberries" }
  ];
  
  const [기업, 문화, 교육] = allIngredients;
  export const initialTabs = [기업, 문화, 교육];
  
  export function getNextIngredient(
    ingredients: Ingredient[]
  ): Ingredient | undefined {
    const existing = new Set(ingredients);
    return allIngredients.find((ingredient) => !existing.has(ingredient));
  }
  