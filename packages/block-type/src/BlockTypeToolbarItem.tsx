import { useCallback, useEffect, useState } from "react";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { useEditorLocale, FadeAnimate, BLOCK_INLINE_STYLES, setNodeStyle, ChevronDownIcon } from "@react-easy-editor/core";

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
      if ($isHeadingNode(element)) {
        const targetTag = BLOCK_TYPE_LIST.find(
          (v) => v.value === element.getTag(),
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
            setNodeStyle(node, BLOCK_INLINE_STYLES[value] || "");
            return node;
          }
          if (value === "quote") {
            const node = $createQuoteNode();
            setNodeStyle(node, BLOCK_INLINE_STYLES[value] || "");
            return node;
          }
          const node = $createHeadingNode(value as HeadingTagType);
          setNodeStyle(node, BLOCK_INLINE_STYLES[value] || "");
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

  useEffect(() => {
    function handlePopover({ target }: MouseEvent) {
      if (!(target as HTMLElement)?.classList?.contains("editor-block-type-area")) {
        setIsPopover(false);
      }
    }
    window.addEventListener("click", handlePopover);
    return () => {
      window.removeEventListener("click", handlePopover);
    };
  }, []);

  return (
    <>
      <button
        aria-label={t("Block Type")}
        className="toolbar-item editor-block-type-area"
        onClick={(e) => {
          e.stopPropagation();
          setIsPopover(!isPopover);
        }}
      >
        <div className="text-ellipsis">{t(blockType.label)}</div>
        <span className={`editor-select-box-chevron ${isPopover ? "open" : ""}`}>
          <ChevronDownIcon width={14} height={14} />
        </span>

        <FadeAnimate className="editor-block-type-popover" isVisible={isPopover}>
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
              >
                {t(label)}
              </div>
            );
          })}
        </FadeAnimate>
      </button>
    </>
  );
}
