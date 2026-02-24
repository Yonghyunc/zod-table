"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategory } from "@/context/CategoryContext";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

export interface ExpenseEditorValues {
  expenseDate: Date;
  expenseItem: string;
  expenseAmount: number;
  categoryId: string;
}

interface Props {
  onClose: () => void;
  onSave: (values: ExpenseEditorValues) => void;
  isSaving: boolean;
}

export default function ExpenseDetailEditor({
  onClose,
  onSave,
  isSaving,
}: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const categories = useCategory();

  const amountNumber = Number(amount);
  const isAmountValid = amount.length > 0 && Number.isFinite(amountNumber);
  const canSave =
    !isSaving &&
    item.trim().length > 0 &&
    isAmountValid &&
    categoryId.length > 0;

  return (
    <div className="shadow-box flex flex-col gap-3 rounded bg-white p-4">
      <p className="border-border-gray border-b pb-2 text-sm font-medium text-gray-800">
        주간 식비 기록
      </p>

      <div className="flex gap-4">
        <Label htmlFor="expense-date" className="w-1/4 shrink-0 text-xs">
          날짜
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="expense-date"
              variant="outline"
              className="h-7 flex-1 justify-between rounded border-[1.5px] text-left text-gray-800"
            >
              {format(date, "PPP", { locale: ko })}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              required
              selected={date}
              onSelect={(nextDate) => {
                if (!nextDate) return;
                setDate(nextDate);
                setOpen(false);
              }}
              defaultMonth={date}
              locale={ko}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-4">
        <Label htmlFor="item" className="w-1/4 shrink-0 text-xs">
          지출내역
        </Label>
        <Input
          id="item"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          className="h-7 w-32 flex-1 text-xs"
        />
      </div>

      <div className="flex gap-4">
        <Label htmlFor="amount" className="w-1/4 shrink-0 text-xs">
          지출금액
        </Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-7 flex-1 text-xs"
        />
      </div>

      <div className="flex gap-4">
        <Label htmlFor="category" className="w-1/4 shrink-0 text-xs">
          카테고리
        </Label>
        <div className="flex-1">
          <Select
            value={categoryId}
            onValueChange={setCategoryId}
            disabled={categories.length === 0}
          >
            <SelectTrigger className="h-7 w-full text-xs" id="category">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="w-[var(--radix-select-trigger-width)]"
            >
              <SelectGroup>
                {categories.map((category) => (
                  <SelectItem
                    key={category.categoryId}
                    value={category.categoryId}
                  >
                    {category.categoryName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
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
            onSave({
              expenseDate: date,
              expenseItem: item.trim(),
              expenseAmount: amountNumber,
              categoryId,
            })
          }
          size="sm"
          disabled={!canSave}
        >
          {isSaving ? "..." : "저장"}
        </Button>
      </div>
    </div>
  );
}
