"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  onClose: () => void;
  backdropClassName?: string;
  contentClassName?: string;
  ariaLabel: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  layer?: "modal" | "nested";
};

let bodyLockCount = 0;
let originalOverflow = "";
let originalPaddingRight = "";
const modalStack: symbol[] = [];

function lockBodyScroll() {
  if (bodyLockCount === 0) {
    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
  bodyLockCount += 1;
}

function unlockBodyScroll() {
  bodyLockCount = Math.max(0, bodyLockCount - 1);
  if (bodyLockCount === 0) {
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
  }
}

export function ModalPortal({
  children,
  onClose,
  backdropClassName,
  contentClassName,
  ariaLabel,
  closeOnBackdrop = true,
  closeOnEscape = true,
  layer = "modal",
}: Props) {
  const modalId = useRef(Symbol("ninibu-modal"));

  useEffect(() => {
    const id = modalId.current;
    modalStack.push(id);
    lockBodyScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (!closeOnEscape || event.key !== "Escape" || modalStack.at(-1) !== id) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onClose();
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      const index = modalStack.lastIndexOf(id);
      if (index >= 0) modalStack.splice(index, 1);
      unlockBodyScroll();
    };
  }, [closeOnEscape, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={cn("ninibu-modal-backdrop", layer === "nested" && "is-nested", backdropClassName)}
      role="presentation"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cn("ninibu-modal-surface", contentClassName)}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
