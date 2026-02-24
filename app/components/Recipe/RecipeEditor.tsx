"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { useState } from "react";
import { Chip } from "../common/Chip";
import { Textarea } from "@/components/ui/textarea";
import { RecipeItem } from "@/types/recipe";

export interface RecipeEditorValues {
  recipeName: string;
  recipeMemo: string;
  recipeUrl: string;
  ingredients: string[];
}

interface Props {
  mode: "create" | "edit";
  initialValues?: RecipeItem | null;
  onClose: () => void;
  onSave: (values: RecipeEditorValues) => void | Promise<void>;
  isSaving: boolean;
}

export default function RecipeEditor({
  mode,
  initialValues,
  onClose,
  onSave,
  isSaving,
}: Props) {
  const [name, setName] = useState(initialValues?.recipeName ?? "");
  const [ingredientList, setIngredientList] = useState<string[]>(
    initialValues?.ingredients.map((ingredientItem) => ingredientItem.ingredientName) ?? [],
  );
  const [ingredient, setIngredient] = useState("");
  const [memo, setMemo] = useState(initialValues?.recipeMemo ?? "");
  const [url, setUrl] = useState(initialValues?.recipeUrl ?? "");

  const canSave =
    !isSaving && name.trim().length > 0 && ingredientList.length > 0;

  const addIngredient = () => {
    if (ingredient.trim() === "") return;
    setIngredientList((prev) => [...prev, ingredient.trim()]);
    setIngredient("");
  };

  const deleteIngredient = (target: string) => {
    setIngredientList((prev) => prev.filter((item) => item !== target));
  };

  return (
    <div className="shadow-box flex flex-col gap-2 rounded bg-white p-4">
      <p className="border-border-gray border-b pb-2 text-sm font-medium text-gray-800">
        {mode === "edit" ? "레시피 수정" : "레시피 등록"}
      </p>
      <div className="flex gap-4">
        <Label htmlFor="recipe-name" className="w-12 text-xs">
          레시피명
        </Label>
        <Input
          id="recipe-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-7 flex-1 text-xs"
        />
      </div>
      <div className="flex gap-4">
        <Label htmlFor="ingredient" className="w-12 text-xs">
          재료
        </Label>
        <div className="relative w-50">
          <Input
            id="ingredient"
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            className="h-7 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addIngredient();
              }
            }}
          />
          <Check
            size={18}
            className="text-verde absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
            onClick={addIngredient}
          />
        </div>
      </div>
      <div className="ml-16">
        {ingredientList.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ingredientList.map((item, idx) => (
              <Chip key={idx} text={item} onDelete={deleteIngredient} />
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <Label htmlFor="memo" className="w-12 text-xs">
          메모
        </Label>
        <Textarea
          id="memo"
          placeholder="Memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="flex-1 text-xs"
        />
      </div>

      <div className="flex gap-4">
        <Label htmlFor="url" className="w-12 text-xs">
          참고링크
        </Label>
        <Input
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-7 flex-1 text-xs"
        />
      </div>
      <div className="mb-3 flex items-center justify-end gap-1">
        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
          className="border-lime text-lime hover:text-lime"
        >
          취소
        </Button>
        <Button
          onClick={() =>
            void onSave({
              recipeName: name.trim(),
              recipeMemo: memo.trim(),
              recipeUrl: url.trim(),
              ingredients: ingredientList,
            })
          }
          size="sm"
          disabled={!canSave}
        >
          {isSaving ? "..." : mode === "edit" ? "수정" : "저장"}
        </Button>
      </div>
    </div>
  );
}
