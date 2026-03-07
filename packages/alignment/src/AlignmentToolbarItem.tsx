import { useCallback, useEffect, useRef, useState } from "react";
import {
  $getSelection,
  $isRangeSelection,
  $isElementNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useEditorLocale, PopoverBox } from "@react-easy-editor/core";

import type { ToolbarRenderProps } from "@react-easy-editor/core";
import type { ElementFormatType } from "lexical";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Alignment types                                                    */
/* ------------------------------------------------------------------ */

type AlignmentType = "left" | "center" | "right" | "justify";

const ALIGNMENT_OPTIONS: AlignmentType[] = ["left", "center", "right", "justify"];

const ALIGNMENT_LABEL_MAP: Record<AlignmentType, string> = {
  left: "Left Align",
  center: "Center Align",
  right: "Right Align",
  justify: "Justify Align",
};

/* ------------------------------------------------------------------ */
/*  Inline SVG icons (Bootstrap Icons style)                           */
/* ------------------------------------------------------------------ */

function AlignLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M2 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"
      />
    </svg>
  );
}

function AlignCenterIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"
      />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M6 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm4-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"
      />
    </svg>
  );
}

function AlignJustifyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M2 12.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Icon map                                                           */
/* ------------------------------------------------------------------ */

const ALIGNMENT_ICON_MAP: Record<AlignmentType, () => ReactNode> = {
  left: AlignLeftIcon,
  center: AlignCenterIcon,
  right: AlignRightIcon,
  justify: AlignJustifyIcon,
};

/* ------------------------------------------------------------------ */
/*  Hook: track current element alignment                              */
/* ------------------------------------------------------------------ */

function useCurrentAlignment(editor: ToolbarRenderProps["editor"]): AlignmentType {
  const [alignment, setAlignment] = useState<AlignmentType>("left");

  const updateAlignment = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getTopLevelElementOrThrow();

      if ($isElementNode(element)) {
        const formatType = element.getFormatType();
        if (formatType === "left" || formatType === "center" || formatType === "right" || formatType === "justify") {
          setAlignment(formatType);
        } else {
          setAlignment("left");
        }
      }
    });
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateAlignment();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, updateAlignment]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getTopLevelElementOrThrow();

        if ($isElementNode(element)) {
          const formatType = element.getFormatType();
          if (formatType === "left" || formatType === "center" || formatType === "right" || formatType === "justify") {
            setAlignment(formatType);
          } else {
            setAlignment("left");
          }
        }
      });
    });
  }, [editor]);

  return alignment;
}

/* ------------------------------------------------------------------ */
/*  Toolbar render function                                            */
/* ------------------------------------------------------------------ */

export function AlignmentToolbarItem({ editor }: ToolbarRenderProps): ReactNode {
  const currentAlignment = useCurrentAlignment(editor);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useEditorLocale();

  const handleAlign = useCallback(
    (align: AlignmentType) => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, align as ElementFormatType);
      setIsOpen(false);
    },
    [editor],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const CurrentIcon = ALIGNMENT_ICON_MAP[currentAlignment];

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="toolbar-item spaced"
        aria-label={t(ALIGNMENT_LABEL_MAP[currentAlignment])}
        data-tooltip={t(ALIGNMENT_LABEL_MAP[currentAlignment])}
      >
        <CurrentIcon />
        <span className="toolbar-item-chevron">
          <ChevronDownIcon />
        </span>
      </button>

      {isOpen && (
        <PopoverBox>
          {ALIGNMENT_OPTIONS.map((align) => {
            const Icon = ALIGNMENT_ICON_MAP[align];
            return (
              <button
                key={align}
                onClick={() => handleAlign(align)}
                className={"toolbar-item spaced " + (currentAlignment === align ? "active" : "")}
                aria-label={t(ALIGNMENT_LABEL_MAP[align])}
                data-tooltip={t(ALIGNMENT_LABEL_MAP[align])}
              >
                <Icon />
              </button>
            );
          })}
        </PopoverBox>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chevron icon                                                       */
/* ------------------------------------------------------------------ */

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
      />
    </svg>
  );
}
