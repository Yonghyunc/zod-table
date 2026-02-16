"use client";

import { Badge } from "@/components/ui/badge";
import { CircleX } from "lucide-react";

interface Props {
  text: string;
  onDelete: (text: string) => void;
}

export function Chip({ text, onDelete }: Props) {
  return (
    <Badge className="font-regular bg-[#F1F5F9] px-3 py-1 text-gray-800 dark:bg-gray-950 dark:text-gray-300">
      {text}
      <div>
        <CircleX
          className="ml-1 h-3 w-3 cursor-pointer rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => onDelete(text)}
        />
      </div>
    </Badge>
  );
}
