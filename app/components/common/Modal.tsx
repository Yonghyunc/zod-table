"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  contentClassName?: string;
  closeOnBackdropClick?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  contentClassName,
  closeOnBackdropClick = true,
}: Props) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-black/35"
        onClick={closeOnBackdropClick ? onClose : undefined}
        type="button"
      />
      <div className="relative z-10 w-full max-w-md px-4">
        <div className={cn("w-full", contentClassName)}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
