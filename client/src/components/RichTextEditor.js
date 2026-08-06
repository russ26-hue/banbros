"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

function ToolbarButton({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-2.5 py-1 text-sm rounded transition-colors disabled:opacity-40 ${
        active
          ? "bg-primary text-white"
          : "text-navy hover:bg-surface border border-transparent"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, rows = 8 }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Only enable the formatting that the backend sanitizer permits.
        codeBlock: false,
        code: false,
        horizontalRule: false,
        heading: { levels: [2, 3, 4] },
      }),
    ],
    content: value || "",
    // Required in Next.js: without this, TipTap renders during SSR and the
    // markup will not match what the browser produces, causing a hydration error.
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // TipTap represents "empty" as an empty paragraph; normalise that to a
      // genuinely empty string so required-field checks behave as expected.
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
  });

  if (!editor) {
    return (
      <div className="w-full border border-border rounded-lg px-4 py-2 text-sm text-text-muted">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface px-2 py-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <span className="line-through">S</span>
        </ToolbarButton>

        <span className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Large heading"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Small heading"
        >
          H3
        </ToolbarButton>

        <span className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bulleted list"
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered list"
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Quote"
        >
          Quote
        </ToolbarButton>

        <span className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          ↶
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          ↷
        </ToolbarButton>
      </div>

      <EditorContent
        editor={editor}
        style={{ minHeight: `${rows * 1.6}rem` }}
        className="px-4 py-3 text-sm text-navy
          [&_p]:mb-2 [&_p:last-child]:mb-0
          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-2
          [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-2
          [&_h4]:text-base [&_h4]:font-bold [&_h4]:mt-3 [&_h4]:mb-2
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
          [&_li]:mb-0.5
          [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-text-muted
          [&_strong]:font-bold [&_em]:italic"
      />
    </div>
  );
}
