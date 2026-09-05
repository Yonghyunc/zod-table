export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
}

export interface RecipeItem {
  recipeId: string;
  recipeName: string;
  recipeMemo: string | null;
  recipeUrl: string | null;
  isOwner: boolean;
  ingredients: RecipeIngredient[];
}
