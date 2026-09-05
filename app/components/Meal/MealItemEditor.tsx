"use client";

import { FormEvent, useState } from "react";
import { MEAL_TIME, MealTime } from "@/constants/meal";
import { MealSchedule } from "@/types/meal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Chip } from "../common/Chip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";

type Option = {
  value: string;
  label: string;
};

const OPTIONS: Option[] = [
  { value: "0", label: "집밥" },
  { value: "1", label: "도시락" },
  { value: "2", label: "외식" },
  { value: "3", label: "배달" },
  { value: "4", label: "기타" },
];

interface Props {
  mealDate: string;
  mealTime: MealTime;
  schedule: MealSchedule | null;
  onSaved: (mealDate: string) => void;
  onClose: () => void;
}

export default function MealItemEditor({
  mealDate,
  mealTime,
  schedule,
  onSaved,
  onClose,
}: Props) {
  const isSnack = mealTime === "snack";
  const [selected, setSelected] = useState<string | null>(
    isSnack ? null : (schedule?.mealType ?? "0"),
  );
  const [menuList, setMenuList] = useState<string[]>(
    schedule?.logs.map((log) => log.menuName) ?? [],
  );
  const [menu, setMenu] = useState("");
  const [memo, setMemo] = useState(schedule?.mealMemo ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleChange = (value: string, checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelected(value);
    }
  };

  const appendUniqueMenus = (current: string[], incoming: string[]) => {
    const existing = new Set(current);
    const uniqueIncoming = incoming.filter((item) => {
      if (existing.has(item)) return false;
      existing.add(item);
      return true;
    });

    return uniqueIncoming.length > 0
      ? [...current, ...uniqueIncoming]
      : current;
  };

  const addMenu = () => {
    const nextMenu = menu.trim();
    if (nextMenu === "") return;
    setMenuList((prev) => appendUniqueMenus(prev, [nextMenu]));
    setMenu("");
  };

  const handleMenuInputChange = (value: string) => {
    const normalized = value.replace(/\r\n/g, "\n");
    if (!/[,\n]/.test(normalized)) {
      setMenu(normalized);
      return;
    }

    const parts = normalized.split(/[,\n]/);
    const nextMenu = parts.pop() ?? "";
    const parsedMenus = parts.map((item) => item.trim()).filter(Boolean);
    if (parsedMenus.length > 0) {
      setMenuList((prev) => appendUniqueMenus(prev, parsedMenus));
    }
    setMenu(nextMenu);
  };

  const onMenuSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addMenu();
  };

  const deleteMenu = (target: string) => {
    setMenuList((prev) => prev.filter((item) => item !== target));
  };

  const onSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      const normalizedMemo = memo.replace(/\r\n/g, "\n");
      const pendingMenu = menu.trim();
      const menuNames =
        pendingMenu !== "" && !menuList.includes(pendingMenu)
          ? [...menuList, pendingMenu]
          : menuList;
      const mealType = isSnack ? null : selected;

      const response = schedule?.scheduleId
        ? await fetch("/api/meal-schedules", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              scheduleId: schedule.scheduleId,
              mealType,
              mealMemo: normalizedMemo,
              menuNames,
            }),
          })
        : await fetch("/api/meal-schedules", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mealDate,
              mealTime,
              mealType,
              mealMemo: normalizedMemo,
              menuNames,
            }),
          });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(result?.error ?? "Failed to save meal schedule.");
      }

      onSaved(mealDate);
      onClose();
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Failed to save meal schedule.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="shadow-box flex flex-col gap-3 rounded bg-white p-4">
      <p className="border-border-gray border-b pb-2 text-sm font-medium text-gray-800">
        {MEAL_TIME[mealTime]}
      </p>
      {!isSnack && (
        <div className="flex gap-4">
          {OPTIONS.map((opt) => {
            const isChecked = selected === opt.value;
            return (
              <div key={opt.value} className="flex items-center gap-1">
                <Checkbox
                  id={opt.value}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleChange(opt.value, checked)
                  }
                />
                <Label htmlFor={opt.value} className="cursor-pointer text-xs">
                  {opt.label}
                </Label>
              </div>
            );
          })}
        </div>
      )}
      <form className="relative w-60" onSubmit={onMenuSubmit}>
        <Input
          value={menu}
          onChange={(e) => handleMenuInputChange(e.target.value)}
          enterKeyHint="done"
          className="h-7 text-xs"
        />
        <Check
          size={18}
          className="text-verde absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
          onClick={addMenu}
        />
      </form>
      {menuList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {menuList.map((menuItem, idx) => (
            <Chip key={idx} text={menuItem} onDelete={deleteMenu} />
          ))}
        </div>
      )}
      <Textarea
        placeholder="Memo"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        className="text-xs"
      />
      {saveError && <p className="text-xs text-red-500">{saveError}</p>}
      <div className="mb-3 flex items-center justify-end gap-1">
        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
          className="border-lime text-lime hover:text-lime"
        >
          취소
        </Button>
        <Button onClick={onSave} size="sm" disabled={isSaving}>
          {isSaving ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}
