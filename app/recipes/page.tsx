"use client";

import { Plus, SearchIcon } from "lucide-react";
import HeaderBar from "../components/HeaderBar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import RecipeBox from "../components/Recipe/RecipeBox";
import { useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import RecipeEditor, {
  type RecipeEditorValues,
} from "../components/Recipe/RecipeEditor";
import { RecipeItem } from "@/types/recipe";

export default function RecipesPage() {
  const [keyword, setKeyword] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editingRecipe, setEditingRecipe] = useState<RecipeItem | null>(null);
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadRecipes = async () => {
      setIsLoadingRecipes(true);
      try {
        const params = new URLSearchParams();
        if (keyword.trim().length > 0) {
          params.set("keyword", keyword.trim());
        }

        const response = await fetch(`/api/recipes?${params.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load recipes.");
        }

        const data = (await response.json()) as {
          success: boolean;
          recipes?: RecipeItem[];
        };

        if (!isMounted || !data.success) {
          return;
        }

        setRecipes(data.recipes ?? []);
      } catch {
        if (!isMounted) return;
        setRecipes([]);
      } finally {
        if (isMounted) {
          setIsLoadingRecipes(false);
        }
      }
    };

    void loadRecipes();

    return () => {
      isMounted = false;
    };
  }, [keyword, refreshKey]);

  const handleSaveRecipe = async (values: RecipeEditorValues) => {
    try {
      if (editorMode === "edit" && !editingRecipe) {
        alert("수정할 레시피를 찾을 수 없습니다.");
        return;
      }

      setIsSavingRecipe(true);

      const response = await fetch("/api/recipes", {
        method: editorMode === "edit" ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editorMode === "edit"
            ? { recipeId: editingRecipe?.recipeId, ...values }
            : values,
        ),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        const message = errorBody?.error ?? "레시피 저장에 실패했습니다.";
        throw new Error(message);
      }

      setRefreshKey((prev) => prev + 1);
      setIsEditorOpen(false);
      setEditingRecipe(null);
      setEditorMode("create");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "레시피 저장에 실패했습니다.";
      alert(message);
    } finally {
      setIsSavingRecipe(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <HeaderBar title="레시피" />
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto scroll-smooth bg-[#F8F9F9] p-4">
        <div className="shadow-box">
          <InputGroup className="border-none bg-white">
            <InputGroupInput
              placeholder="이름 또는 재료로 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <InputGroupAddon align="inline-end">
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="flex h-[calc(100%-68px)] flex-col gap-2 py-4">
          {isLoadingRecipes ? (
            <p className="text-center text-sm text-gray-500">로딩 중입니다</p>
          ) : recipes.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              {keyword.trim().length > 0
                ? "검색 결과가 없습니다."
                : "등록된 레시피가 없습니다."}
            </p>
          ) : (
            recipes.map((recipe) => (
              <RecipeBox
                recipe={recipe}
                key={recipe.recipeId}
                onEdit={(target) => {
                  setEditorMode("edit");
                  setEditingRecipe(target);
                  setIsEditorOpen(true);
                }}
              />
            ))
          )}
        </div>
        <div
          className="shadow-box flex h-8 w-full cursor-pointer items-center justify-center bg-white"
          onClick={() => {
            setEditorMode("create");
            setEditingRecipe(null);
            setIsEditorOpen(true);
          }}
        >
          <Plus size={18} />
        </div>
      </div>
      <Modal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingRecipe(null);
          setEditorMode("create");
        }}
      >
        <RecipeEditor
          key={`${editorMode}-${editingRecipe?.recipeId ?? "new"}`}
          mode={editorMode}
          initialValues={editingRecipe}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingRecipe(null);
            setEditorMode("create");
          }}
          onSave={handleSaveRecipe}
          isSaving={isSavingRecipe}
        />
      </Modal>
    </div>
  );
}
