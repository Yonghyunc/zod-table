import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContextFromHeaders, unauthorizedResponse } from "@/lib/auth";

interface CreateRecipeBody {
  recipeName: string;
  recipeMemo?: string;
  recipeUrl?: string;
  ingredients: string[];
}

interface UpdateRecipeBody extends CreateRecipeBody {
  recipeId?: string;
}

function badRequest(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

function normalizeRecipeInput(body: CreateRecipeBody) {
  const recipeName = body.recipeName?.trim();
  const recipeMemo = body.recipeMemo?.trim() || null;
  const recipeUrl = body.recipeUrl?.trim() || null;
  const rawIngredients = Array.isArray(body.ingredients)
    ? body.ingredients
    : [];
  const ingredients = [
    ...new Set(rawIngredients.map((item) => item.trim())),
  ].filter((item) => item.length > 0);

  return { recipeName, recipeMemo, recipeUrl, ingredients };
}

function validateRecipeInput(params: {
  recipeName?: string;
  ingredients: string[];
}) {
  const { recipeName, ingredients } = params;

  if (!recipeName) {
    return "recipeName is required.";
  }

  if (recipeName.length > 50) {
    return "recipeName must be 50 characters or fewer.";
  }

  if (ingredients.length === 0) {
    return "ingredients must contain at least one item.";
  }

  if (ingredients.some((item) => item.length > 20)) {
    return "Each ingredient must be 20 characters or fewer.";
  }

  return null;
}

export async function GET(request: NextRequest) {
  const auth = getAuthContextFromHeaders(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  const keyword = request.nextUrl.searchParams.get("keyword")?.trim() ?? "";

  const recipes = await prisma.recipe.findMany({
    where: {
      userId: auth.userId,
      ...(keyword.length > 0
        ? {
            OR: [
              {
                recipeName: {
                  contains: keyword,
                  mode: "insensitive",
                },
              },
              {
                ingredients: {
                  some: {
                    ingredient: {
                      ingredientName: {
                        contains: keyword,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
            ],
          }
        : {}),
    },
    select: {
      recipeId: true,
      recipeName: true,
      recipeMemo: true,
      recipeUrl: true,
      ingredients: {
        select: {
          ingredient: {
            select: {
              ingredientId: true,
              ingredientName: true,
            },
          },
        },
      },
    },
    orderBy: {
      recipeName: "asc",
    },
  });

  const normalized = recipes.map((recipe) => ({
    recipeId: recipe.recipeId,
    recipeName: recipe.recipeName,
    recipeMemo: recipe.recipeMemo,
    recipeUrl: recipe.recipeUrl,
    ingredients: recipe.ingredients.map((row) => row.ingredient),
  }));

  return NextResponse.json(
    {
      success: true,
      recipes: normalized,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: NextRequest) {
  const auth = getAuthContextFromHeaders(request);
  if (!auth) {
    return unauthorizedResponse();
  }
  const userId = auth.userId;

  let body: CreateRecipeBody;
  try {
    body = (await request.json()) as CreateRecipeBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const { recipeName, recipeMemo, recipeUrl, ingredients } =
    normalizeRecipeInput(body);
  const error = validateRecipeInput({ recipeName, ingredients });
  if (error) {
    return badRequest(error);
  }

  const created = await prisma.$transaction(async (tx) => {
    const recipe = await tx.recipe.create({
      data: {
        recipeName,
        recipeMemo,
        recipeUrl,
        userId,
      },
      select: {
        recipeId: true,
        recipeName: true,
        recipeMemo: true,
        recipeUrl: true,
      },
    });

    const ingredientRows = await Promise.all(
      ingredients.map((ingredientName) =>
        tx.ingredient.create({
          data: {
            ingredientName,
          },
          select: {
            ingredientId: true,
            ingredientName: true,
          },
        }),
      ),
    );

    await tx.recipeIngredient.createMany({
      data: ingredientRows.map((ingredient) => ({
        recipeId: recipe.recipeId,
        ingredientId: ingredient.ingredientId,
      })),
    });

    return {
      ...recipe,
      ingredients: ingredientRows,
    };
  });

  return NextResponse.json(
    {
      success: true,
      recipe: created,
    },
    {
      status: 201,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function PATCH(request: NextRequest) {
  const auth = getAuthContextFromHeaders(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  let body: UpdateRecipeBody;
  try {
    body = (await request.json()) as UpdateRecipeBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const recipeId = body.recipeId?.trim();
  if (!recipeId) {
    return badRequest("recipeId is required.");
  }

  const { recipeName, recipeMemo, recipeUrl, ingredients } =
    normalizeRecipeInput(body);
  const error = validateRecipeInput({ recipeName, ingredients });
  if (error) {
    return badRequest(error);
  }

  const existing = await prisma.recipe.findFirst({
    where: {
      recipeId,
      userId: auth.userId,
    },
    select: {
      recipeId: true,
    },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, error: "Recipe not found." },
      { status: 404 },
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const recipe = await tx.recipe.update({
      where: {
        recipeId,
      },
      data: {
        recipeName,
        recipeMemo,
        recipeUrl,
      },
      select: {
        recipeId: true,
        recipeName: true,
        recipeMemo: true,
        recipeUrl: true,
      },
    });

    await tx.recipeIngredient.deleteMany({
      where: {
        recipeId,
      },
    });

    const ingredientRows = await Promise.all(
      ingredients.map((ingredientName) =>
        tx.ingredient.create({
          data: {
            ingredientName,
          },
          select: {
            ingredientId: true,
            ingredientName: true,
          },
        }),
      ),
    );

    await tx.recipeIngredient.createMany({
      data: ingredientRows.map((ingredient) => ({
        recipeId: recipe.recipeId,
        ingredientId: ingredient.ingredientId,
      })),
    });

    return {
      ...recipe,
      ingredients: ingredientRows,
    };
  });

  return NextResponse.json(
    {
      success: true,
      recipe: updated,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
