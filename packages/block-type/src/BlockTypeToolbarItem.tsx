import { useCallback, useEffect, useState } from "react";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { useEditorLocale, PopoverBox, BLOCK_INLINE_STYLES } from "@react-easy-editor/core";

import type { ToolbarRenderProps } from "@react-easy-editor/core";
import type { HeadingTagType } from "@lexical/rich-text";
import type { ReactNode } from "react";

interface BlockTypeItem {
  label: string;
  value: string;
  className: string;
}

const BLOCK_TYPE_LIST: BlockTypeItem[] = [
  { label: "Paragraph", value: "paragraph", className: "editor-paragraph" },
  { label: "H1", value: "h1", className: "editor-heading-h1" },
  { label: "H2", value: "h2", className: "editor-heading-h2" },
  { label: "H3", value: "h3", className: "editor-heading-h3" },
  { label: "H4", value: "h4", className: "editor-heading-h4" },
  { label: "H5", value: "h5", className: "editor-heading-h5" },
  { label: "H6", value: "h6", className: "editor-heading-h6" },
  { label: "Quote", value: "quote", className: "editor-quote" },
];

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
        marginLeft: "4px",
      }}
    >
      <path
        fillRule="evenodd"
        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
      />
    </svg>
  );
}

export function BlockTypeToolbarItem({ editor }: ToolbarRenderProps): ReactNode {
  const { t } = useEditorLocale();

  const [blockType, setBlockType] = useState<BlockTypeItem>(BLOCK_TYPE_LIST[0]);
  const [isPopover, setIsPopover] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow();

      const type = element.getType();
      if (type === "heading" && typeof (element as Record<string, unknown>).getTag === "function") {
        const targetTag = BLOCK_TYPE_LIST.find(
          (v) => v.value === (element as unknown as { getTag: () => string }).getTag(),
        );
        if (targetTag) {
          setBlockType(targetTag);
        }
      } else {
        const findTarget = BLOCK_TYPE_LIST.find((v) => v.value === type);
        setBlockType(findTarget || BLOCK_TYPE_LIST[0]);
      }
    }
  }, []);

  const setBlock = useCallback(
    (currentBlockType: BlockTypeItem) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        const { value } = currentBlockType;

        $setBlocksType(selection, () => {
          if (value === "paragraph") {
            const node = $createParagraphNode();
            (node as unknown as { setStyle: (s: string) => void }).setStyle(
              BLOCK_INLINE_STYLES[value] || "",
            );
            return node;
          }
          if (value === "quote") {
            const node = $createQuoteNode();
            (node as unknown as { setStyle: (s: string) => void }).setStyle(
              BLOCK_INLINE_STYLES[value] || "",
            );
            return node;
          }
          const node = $createHeadingNode(value as HeadingTagType);
          (node as unknown as { setStyle: (s: string) => void }).setStyle(
            BLOCK_INLINE_STYLES[value] || "",
          );
          return node;
        });

        setBlockType(currentBlockType);
      });
    },
    [editor],
  );

  useEffect(() => {
    const removeSelectionListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => updateToolbar());
    });

    return () => {
      removeSelectionListener();
      removeUpdateListener();
    };
  }, [editor, updateToolbar]);

  return (
    <div style={{ position: "relative" }}>
      <button
        aria-label={t("Block Type")}
        className="toolbar-item editor-block-type-area"
        onClick={(e) => {
          e.stopPropagation();
          setIsPopover(!isPopover);
        }}
      >
        <span className="text-ellipsis">{t(blockType.label)}</span>
        <ChevronIcon isOpen={isPopover} />
      </button>

      <PopoverBox>
        {isPopover && (
          <div className="editor-block-type-popover">
            {BLOCK_TYPE_LIST.map((item) => {
              const { className, value, label } = item;
              return (
                <div
                  key={value}
                  onClick={() => {
                    setBlock(item);
                    setIsPopover(false);
                  }}
                  className={className}
                  role="option"
                  aria-selected={blockType.value === value}
                >
                  {t(label)}
                </div>
              );
            })}
          </div>
        )}
      </PopoverBox>
    </div>
  );
}
