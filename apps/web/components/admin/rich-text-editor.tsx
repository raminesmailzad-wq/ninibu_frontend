"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Quote, Link2, Undo2, Redo2, Eraser, ImagePlus } from "lucide-react";
import type { AdminMediaAsset } from "@ninibu/types";

export type RichTextEditorHandle = {
  focus: () => void;
  insertMedia: (media: AdminMediaAsset) => void;
};

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

export const RichTextEditor = forwardRef<RichTextEditorHandle, Props>(function RichTextEditor({ value, onChange, placeholder = "متن مطلب را بنویسید…", minHeight = 300 }, ref) {
  const editor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = editor.current;
    if (!node || document.activeElement === node) return;
    if (node.innerHTML !== value) node.innerHTML = value;
  }, [value]);

  useImperativeHandle(ref, () => ({
    focus: () => editor.current?.focus(),
    insertMedia: (media) => {
      editor.current?.focus();
      const src = media.asset_url || "";
      if (!src) return;
      const alt = escapeAttribute(media.alt_text || media.title || "تصویر");
      document.execCommand("insertHTML", false, `<figure><img src="${escapeAttribute(src)}" alt="${alt}"><figcaption>${escapeHTML(media.title || "")}</figcaption></figure><p><br></p>`);
      emit();
    }
  }));

  function emit() { onChange(editor.current?.innerHTML ?? ""); }
  function command(name: string, argument?: string) {
    editor.current?.focus();
    document.execCommand(name, false, argument);
    emit();
  }
  function addLink() {
    const href = window.prompt("آدرس لینک (https://...)");
    if (!href) return;
    command("createLink", href.trim());
  }

  return <div className="admin-rich-editor">
    <div className="admin-editor-toolbar" role="toolbar" aria-label="ابزار ویرایش متن">
      <button type="button" title="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => command("bold")}><Bold size={16}/></button>
      <button type="button" title="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => command("italic")}><Italic size={16}/></button>
      <button type="button" title="Underline" onMouseDown={(e) => e.preventDefault()} onClick={() => command("underline")}><Underline size={16}/></button>
      <span/>
      <button type="button" title="تیتر ۲" onMouseDown={(e) => e.preventDefault()} onClick={() => command("formatBlock", "h2")}>H2</button>
      <button type="button" title="تیتر ۳" onMouseDown={(e) => e.preventDefault()} onClick={() => command("formatBlock", "h3")}>H3</button>
      <button type="button" title="پاراگراف" onMouseDown={(e) => e.preventDefault()} onClick={() => command("formatBlock", "p")}>P</button>
      <span/>
      <button type="button" title="فهرست نقطه‌ای" onMouseDown={(e) => e.preventDefault()} onClick={() => command("insertUnorderedList")}><List size={16}/></button>
      <button type="button" title="فهرست شماره‌ای" onMouseDown={(e) => e.preventDefault()} onClick={() => command("insertOrderedList")}><ListOrdered size={16}/></button>
      <button type="button" title="نقل‌قول" onMouseDown={(e) => e.preventDefault()} onClick={() => command("formatBlock", "blockquote")}><Quote size={16}/></button>
      <button type="button" title="لینک" onMouseDown={(e) => e.preventDefault()} onClick={addLink}><Link2 size={16}/></button>
      <span/>
      <button type="button" title="Undo" onMouseDown={(e) => e.preventDefault()} onClick={() => command("undo")}><Undo2 size={16}/></button>
      <button type="button" title="Redo" onMouseDown={(e) => e.preventDefault()} onClick={() => command("redo")}><Redo2 size={16}/></button>
      <button type="button" title="پاک‌کردن قالب" onMouseDown={(e) => e.preventDefault()} onClick={() => command("removeFormat")}><Eraser size={16}/></button>
      <div className="admin-editor-hint"><ImagePlus size={14}/> تصویر را از کتابخانه رسانه درج کنید</div>
    </div>
    <div
      ref={editor}
      className="admin-editor-surface"
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      style={{ minHeight }}
      dir="rtl"
      onInput={emit}
      onBlur={emit}
    />
  </div>;
});

export function resolveMediaUrl(value: string) {
  if (!value) return "";
  if (value.startsWith("/api/v1/media/")) return value.replace("/api/v1/media/", "/api/ninibu/media/");
  return value;
}
function escapeAttribute(value: string) { return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
function escapeHTML(value: string) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
