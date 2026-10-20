import { useEffect, useRef } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  RemoveFormatting,
  Underline,
  Undo2,
  Redo2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type EmailHtmlEditorProps = {
  value: string;
  onChange: (html: string) => void;
  className?: string;
  title?: string;
};

type FormatAction = {
  label: string;
  command: string;
  icon: LucideIcon;
};

const FORMAT_ACTIONS: FormatAction[] = [
  { label: "Bold", command: "bold", icon: Bold },
  { label: "Italic", command: "italic", icon: Italic },
  { label: "Underline", command: "underline", icon: Underline },
  { label: "Bulleted list", command: "insertUnorderedList", icon: List },
  { label: "Numbered list", command: "insertOrderedList", icon: ListOrdered },
  { label: "Align left", command: "justifyLeft", icon: AlignLeft },
  { label: "Align center", command: "justifyCenter", icon: AlignCenter },
  { label: "Align right", command: "justifyRight", icon: AlignRight },
  { label: "Undo", command: "undo", icon: Undo2 },
  { label: "Redo", command: "redo", icon: Redo2 },
  { label: "Clear formatting", command: "removeFormat", icon: RemoveFormatting },
];

const EMPTY_EMAIL = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"></head><body></body></html>";

function serializeDocument(doc: Document): string {
  const serializedRoot = doc.documentElement.cloneNode(true) as HTMLElement;
  const body = serializedRoot.querySelector("body");
  body?.removeAttribute("contenteditable");
  body?.removeAttribute("spellcheck");

  const doctype = doc.doctype ? `<!DOCTYPE ${doc.doctype.name}>` : "<!DOCTYPE html>";
  return `${doctype}\n${serializedRoot.outerHTML}`;
}

function safeLink(value: string): string | null {
  try {
    const parsed = new URL(value, window.location.href);
    return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol) ? value : null;
  } catch {
    return null;
  }
}

export function EmailHtmlEditor({
  value,
  onChange,
  className = "",
  title = "Visual email editor",
}: EmailHtmlEditorProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const initialDocument = useRef(value.trim() || EMPTY_EMAIL);
  const onChangeRef = useRef(onChange);
  const documentRef = useRef<Document | null>(null);
  const inputHandlerRef = useRef<(() => void) | null>(null);
  onChangeRef.current = onChange;

  useEffect(
    () => () => {
      if (documentRef.current && inputHandlerRef.current) {
        documentRef.current.removeEventListener("input", inputHandlerRef.current);
      }
    },
    [],
  );

  const handleFrameLoad = () => {
    const doc = frameRef.current?.contentDocument;
    if (!doc?.body) return;
    if (documentRef.current && inputHandlerRef.current) {
      documentRef.current.removeEventListener("input", inputHandlerRef.current);
    }

    doc.body.setAttribute("contenteditable", "true");
    doc.body.setAttribute("spellcheck", "true");
    const handleInput = () => onChangeRef.current(serializeDocument(doc));
    doc.addEventListener("input", handleInput);
    documentRef.current = doc;
    inputHandlerRef.current = handleInput;
  };

  const runCommand = (command: string, commandValue?: string) => {
    const doc = frameRef.current?.contentDocument;
    if (!doc?.body) return;
    doc.execCommand(command, false, commandValue);
    onChangeRef.current(serializeDocument(doc));
  };

  const insertLink = () => {
    const entered = window.prompt("Enter a web, email, or phone link");
    if (!entered) return;
    const url = safeLink(entered.trim());
    if (!url) {
      window.alert("Use an http, https, mailto, or tel link.");
      return;
    }
    runCommand("createLink", url);
  };

  return (
    <div
      data-testid="email-html-editor"
      className={`flex min-h-[420px] min-w-0 flex-col overflow-hidden bg-background ${className}`}
    >
      <div
        role="toolbar"
        aria-label="Email formatting"
        className="flex flex-wrap items-center gap-1 border-b bg-muted/30 px-2 py-2"
      >
        {FORMAT_ACTIONS.map(({ label, command, icon: Icon }) => (
          <Button
            key={command}
            type="button"
            variant="ghost"
            size="icon"
            title={label}
            aria-label={label}
            data-testid={`button-format-${command}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(command)}
            className="h-8 w-8"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Insert link"
          aria-label="Insert link"
          data-testid="button-format-create-link"
          onMouseDown={(event) => event.preventDefault()}
          onClick={insertLink}
          className="h-8 w-8"
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <span className="ml-auto hidden px-2 text-xs text-muted-foreground xl:block">
          Select text to format · Keep {"{{firstName}}"} for personalization
        </span>
      </div>
      <iframe
        ref={frameRef}
        title={title}
        data-testid="iframe-email-visual-editor"
        srcDoc={initialDocument.current}
        onLoad={handleFrameLoad}
        sandbox="allow-same-origin"
        className="min-h-[360px] w-full flex-1 border-0 bg-white"
      />
    </div>
  );
}
