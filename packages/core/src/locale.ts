import { useCallback } from "react";
import { useEditorContext } from "./EditorContext";

export const LOCALE: Record<string, Record<string, string>> = {
  en: {
    Paragraph: "Paragraph",
    Quote: "Quote",
    "Undo (Ctrl + Z)": "Undo (Ctrl + Z)",
    "Redo (Ctrl + Y)": "Redo (Ctrl + Y)",
    "Bold (Ctrl + B)": "Bold (Ctrl + B)",
    "Italic (Ctrl + I)": "Italic (Ctrl + I)",
    "Underline (Ctrl + U)": "Underline (Ctrl + U)",
    Strikethrough: "Strikethrough",
    "Left Align": "Left Align",
    "Center Align": "Center Align",
    "Right Align": "Right Align",
    "Justify Align": "Justify Align",
    "Block Type": "Block Type",
    "Text Color": "Text Color",
    "Background Color": "Background Color",
    "Insert Image": "Insert Image",
    "Insert Video": "Insert Video",
    "Insert Table": "Insert Table",
    placeholder: "Enter your content...",
    uploadFail: "Upload failed. Please contact your administrator.",
    "Not an image file.": "Not an image file.",
    "Not a video file.": "Not a video file.",
    "Compressing file...": "Compressing file...",
  },
  kr: {
    Paragraph: "\uB2E8\uB77D",
    Quote: "\uC778\uC6A9",
    "Undo (Ctrl + Z)": "\uC2E4\uD589 \uCDE8\uC18C (Ctrl + Z)",
    "Redo (Ctrl + Y)": "\uB2E4\uC2DC \uC2E4\uD589 (Ctrl + Y)",
    "Bold (Ctrl + B)": "\uAD75\uAC8C (Ctrl + B)",
    "Italic (Ctrl + I)": "\uAE30\uC6B8\uC784\uAF34 (Ctrl + I)",
    "Underline (Ctrl + U)": "\uBC11\uC904 (Ctrl + U)",
    Strikethrough: "\uCDE8\uC18C\uC120",
    "Left Align": "\uC67C\uCABD \uC815\uB82C",
    "Center Align": "\uAC00\uC6B4\uB370 \uC815\uB82C",
    "Right Align": "\uC624\uB978\uCABD \uC815\uB82C",
    "Justify Align": "\uC591\uCABD \uB9DE\uCDA4",
    "Block Type": "\uBE14\uB85D \uC720\uD615",
    "Text Color": "\uD14D\uC2A4\uD2B8 \uC0C9\uC0C1",
    "Background Color": "\uBC30\uACBD \uC0C9\uC0C1",
    "Insert Image": "\uC774\uBBF8\uC9C0 \uC0BD\uC785",
    "Insert Video": "\uBE44\uB514\uC624 \uC0BD\uC785",
    "Insert Table": "\uD14C\uC774\uBE14 \uC0BD\uC785",
    placeholder: "\uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.",
    uploadFail: "\uC5C5\uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD558\uC600\uC2B5\uB2C8\uB2E4, \uAD00\uB9AC\uC790\uC5D0\uAC8C \uBB38\uC758\uD574\uC8FC\uC138\uC694.",
    "Not an image file.": "\uC774\uBBF8\uC9C0 \uD30C\uC77C\uC774 \uC544\uB2D9\uB2C8\uB2E4.",
    "Not a video file.": "\uBE44\uB514\uC624 \uD30C\uC77C\uC774 \uC544\uB2D9\uB2C8\uB2E4.",
    "Compressing file...": "\uD30C\uC77C \uC555\uCD95\uC911...",
  },
  ja: {
    Paragraph: "\u6BB5\u843D",
    Quote: "\u5F15\u7528",
    "Undo (Ctrl + Z)": "\u5143\u306B\u623B\u3059 (Ctrl + Z)",
    "Redo (Ctrl + Y)": "\u3084\u308A\u76F4\u3057 (Ctrl + Y)",
    "Bold (Ctrl + B)": "\u592A\u5B57 (Ctrl + B)",
    "Italic (Ctrl + I)": "\u659C\u4F53 (Ctrl + I)",
    "Underline (Ctrl + U)": "\u4E0B\u7DDA (Ctrl + U)",
    Strikethrough: "\u53D6\u308A\u6D88\u3057\u7DDA",
    "Left Align": "\u5DE6\u63C3\u3048",
    "Center Align": "\u4E2D\u592E\u63C3\u3048",
    "Right Align": "\u53F3\u63C3\u3048",
    "Justify Align": "\u4E21\u7AEF\u63C3\u3048",
    "Block Type": "\u30D6\u30ED\u30C3\u30AF\u30BF\u30A4\u30D7",
    "Text Color": "\u6587\u5B57\u8272",
    "Background Color": "\u80CC\u666F\u8272",
    "Insert Image": "\u753B\u50CF\u3092\u633F\u5165",
    "Insert Video": "\u52D5\u753B\u3092\u633F\u5165",
    "Insert Table": "\u30C6\u30FC\u30D6\u30EB\u3092\u633F\u5165",
    placeholder: "\u5185\u5BB9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    uploadFail: "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u7BA1\u7406\u8005\u306B\u304A\u554F\u3044\u5408\u308F\u305B\u304F\u3060\u3055\u3044\u3002",
    "Not an image file.": "\u753B\u50CF\u30D5\u30A1\u30A4\u30EB\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
    "Not a video file.": "\u52D5\u753B\u30D5\u30A1\u30A4\u30EB\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
    "Compressing file...": "\u30D5\u30A1\u30A4\u30EB\u5727\u7E2E\u4E2D...",
  },
};

export function useEditorLocale() {
  const { locale } = useEditorContext();

  const t = useCallback(
    (content: string): string => {
      return LOCALE[locale]?.[content] || content;
    },
    [locale],
  );

  return { t };
}
