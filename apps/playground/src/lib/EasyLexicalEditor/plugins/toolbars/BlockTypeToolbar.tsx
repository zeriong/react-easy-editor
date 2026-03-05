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
import { BLOCK_INLINE_STYLES } from "../../constants/common.ts";
import FadeAnimate from "../../components/common/FadeAnimate.tsx";
import useEditorLocale from "../../hooks/useEditorLocale.ts";

import type { LexicalEditor } from "lexical";
import type { HeadingTagType } from "@lexical/rich-text";

interface BlockTypeItem {
  label: string;
  value: string;
  className: string;
}

export default function BlockTypeToolbar({ editor }: { editor: LexicalEditor }) {
  const { t } = useEditorLocale();

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
        const targetTag = BLOCK_TYPE_LIST.find((v) => v.value == (element as unknown as { getTag: () => string }).getTag());
        setBlockType(targetTag!);
      } else {
        const findTarget = BLOCK_TYPE_LIST.find((v) => v.value == type);
        setBlockType(findTarget || BLOCK_TYPE_LIST[0]);
      }
    }
  }, []);

  const setBlock = (currentBlockType: BlockTypeItem) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      const { value } = currentBlockType;

      const creator = () => {
        if (value === "paragraph") return $createParagraphNode();
        if (value === "quote") return $createQuoteNode();
        return $createHeadingNode(value as HeadingTagType);
      };

      console.log("selection", !!selection);

      $setBlocksType(selection, () => {
        const node = creator();
        (node as unknown as { setStyle: (s: string) => void }).setStyle(BLOCK_INLINE_STYLES[value]);
        return node;
      });

      setBlockType(currentBlockType);
    });
  };

  useEffect(() => {
    const removeBlockType = editor.registerCommand(
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
      removeBlockType();
      removeUpdateListener();
    };
  }, [editor]);

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
        aria-label="Block Type"
        className="toolbar-item editor-block-type-area"
        onClick={(e) => {
          e.stopPropagation();
          setIsPopover(!isPopover);
        }}
      >
        <div className={"text-ellipsis"}>{t(blockType?.label)}</div>
        <i className={`editor-select-box-chevron ${isPopover ? "open" : ""}`} />

        <FadeAnimate className={"editor-block-type-popover"} isVisible={isPopover}>
          {BLOCK_TYPE_LIST.map((blockType) => {
            const { className, value, label } = blockType;
            const onClick = () => {
              setBlock(blockType);
            };
            return (
              <div key={value} onClick={onClick} className={className}>
                {t(label)}
              </div>
            );
          })}
        </FadeAnimate>
      </button>
    </>
  );
}
