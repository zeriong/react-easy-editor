import { BLOCK_INLINE_STYLES } from "../theme";
import { getNodeStyle } from "./common";
import { isHTMLElement } from "lexical";
import DOMPurify from "dompurify";

import type { LexicalEditor, LexicalNode, DOMExportOutput } from "lexical";

const TAG_STYLE_KEY_MAP: Record<string, string> = {
  P: "paragraph",
  BLOCKQUOTE: "quote",
  H1: "h1",
  H2: "h2",
  H3: "h3",
  H4: "h4",
  H5: "h5",
  H6: "h6",
};

export const whitelistStylesExportDOM = (editor: LexicalEditor, target: LexicalNode): DOMExportOutput => {
  const output = target.exportDOM(editor);
  if (output && isHTMLElement(output.element)) {
    output.element.removeAttribute("class");
    if (output.element.getAttribute("dir") === "ltr") {
      output.element.removeAttribute("dir");
    }

    let nodeStyle = getNodeStyle(target);

    if (!nodeStyle) {
      const key = TAG_STYLE_KEY_MAP[output.element.tagName];
      if (key && BLOCK_INLINE_STYLES[key]) {
        nodeStyle = BLOCK_INLINE_STYLES[key];
      }
    }

    if (nodeStyle) {
      const sanitized = DOMPurify.sanitize(
        `<${output.element.tagName} style="${nodeStyle}"></${output.element.tagName}>`,
        { ALLOWED_ATTR: ["style"], ALLOWED_TAGS: [output.element.tagName.toLowerCase()] },
      );

      const match = sanitized.match(/style="([^"]*)"/i);
      if (match) {
        output.element.setAttribute("style", match[1]);
      } else {
        output.element.removeAttribute("style");
      }
    }
  }
  return output;
};
