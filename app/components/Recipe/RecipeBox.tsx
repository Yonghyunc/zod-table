"use client";

import { RecipeItem } from "@/types/recipe";
import { Link, Settings } from "lucide-react";

interface Props {
  recipe: RecipeItem;
  onEdit: (recipe: RecipeItem) => void;
}

export default function RecipeBox({ recipe, onEdit }: Props) {
  return (
    <div className="shadow-box rounded bg-white p-4">
      <div className="mb-2 flex justify-between">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-semibold">{recipe.recipeName}</h3>
          {recipe.recipeUrl && (
            <a
              href={recipe.recipeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-verde text-xs"
            >
              <Link size={13} />
            </a>
          )}
        </div>
        <Settings
          size={16}
          color="#808080"
          className="cursor-pointer"
          onClick={() => onEdit(recipe)}
        />
      </div>
      <div className="mx-1 flex justify-start">
        <p className="w-10 text-xs font-medium">재료</p>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {recipe && recipe.ingredients.length > 0 && (
            <p className="text-xs text-gray-700">
              {recipe.ingredients.map((log) => log.ingredientName).join(", ")}
            </p>
          )}
        </div>
      </div>
      <div className="mx-1 flex justify-start">
        <p className="w-10 text-xs font-medium">메모</p>
        {recipe.recipeMemo && (
          <p className="text-xs whitespace-pre-line text-gray-700">
            {recipe.recipeMemo}
          </p>
        )}
      </div>
    </div>
  );
}
