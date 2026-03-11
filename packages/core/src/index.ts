// Styles (side-effect import ensures CSS is loaded)
import "./styles/easy-lexical-editor.css";

// Types
export type { PluginConfig, ToolbarItemConfig, ToolbarRenderProps, ToolbarGroup, EditorLocale, EasyEditorInstance, ToastAPI } from "./types";

// Context
export { EditorProvider, useEditorContext } from "./EditorContext";
export type { EditorContextValue } from "./EditorContext";
export { ToolbarProvider, useToolbarItems } from "./ToolbarContext";

// Main component
export { ReactEasyEditor } from "./ReactEasyEditor";

// Theme
export { BasicTheme, BLOCK_INLINE_STYLES, TEXT_STYLE_OBJECT } from "./theme";

// Locale
export { LOCALE, useEditorLocale } from "./locale";

// Stores
export { useEditorStore } from "./store/editorStore";
export { useToastStore } from "./store/toastStore";

// Utils
export { parseAllowedFontSize, parseAllowedColor, styleStringToObject, clearRefTimeout, getNodeStyle, setNodeStyle, toBase64 } from "./utils/common";
export { whitelistStylesExportDOM } from "./utils/editorExporter";
export { buildInlineStyleImportMap } from "./utils/editorImporter";
export { parseCssRules, mergeStyles, cleanExcelText } from "./utils/cssInline";

// Constants
export { VIDEO_REGEXP, IMAGE_REG_EXP } from "./constants/regExp";

// Built-in Plugins
export { CaretColorPlugin } from "./plugins/CaretColorPlugin";

// Components
export { default as LoadingCover } from "./components/LoadingCover";
export { Toasts } from "./components/Toasts";
export { default as FadeAnimate } from "./components/FadeAnimate";
export { PopoverBox } from "./components/PopoverBox";

// Icons (Bootstrap Icons - MIT License)
export {
  ArrowCounterclockwiseIcon,
  ArrowClockwiseIcon,
  TypeBoldIcon,
  TypeItalicIcon,
  TypeUnderlineIcon,
  TypeStrikethroughIcon,
  FontsIcon,
  HighlighterIcon,
  TextLeftIcon,
  TextCenterIcon,
  TextRightIcon,
  JustifyIcon,
  TextParagraphIcon,
  JournalTextIcon,
  ChevronDownIcon,
  ImageIcon,
  VideoUploadIcon,
  CameraVideoIcon,
  TableIcon,
  ThreeDotsIcon,
  LoadingSpinnerIcon,
  ToastSuccessIcon,
  ToastErrorIcon,
  ToastWarnIcon,
} from "./icons";
