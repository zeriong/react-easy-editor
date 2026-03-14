// ── EasyEditor (All-in-one pre-configured component) ──
export { EasyEditor } from "./EasyEditor";
export type { EasyEditorProps } from "./EasyEditor";
export { EasyEditor as default } from "./EasyEditor";

// ── @react-easy-editor/core ──
export {
  // Main component
  ReactEasyEditor,
  // Context
  EditorProvider,
  useEditorContext,
  ToolbarProvider,
  useToolbarItems,
  // Theme
  BasicTheme,
  BLOCK_INLINE_STYLES,
  TEXT_STYLE_OBJECT,
  // Locale
  LOCALE,
  useEditorLocale,
  // Stores
  useEditorStore,
  useToastStore,
  // Utils
  parseAllowedFontSize,
  parseAllowedColor,
  styleStringToObject,
  clearRefTimeout,
  getNodeStyle,
  setNodeStyle,
  toBase64,
  whitelistStylesExportDOM,
  buildInlineStyleImportMap,
  parseCssRules,
  mergeStyles,
  cleanExcelText,
  // Constants
  VIDEO_REGEXP,
  IMAGE_REG_EXP,
  // Built-in Plugins
  CaretColorPlugin,
  // Components
  LoadingCover,
  Toasts,
  FadeAnimate,
  PopoverBox,
  // Icons (Bootstrap Icons - MIT License)
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
} from "@react-easy-editor/core";

export type {
  PluginConfig,
  ToolbarItemConfig,
  ToolbarRenderProps,
  ToolbarGroup,
  EditorLocale,
  EasyEditorInstance,
  ToastAPI,
  EditorContextValue,
} from "@react-easy-editor/core";

// ── @react-easy-editor/toolbar ──
export { ToolbarPlugin, ToolbarContainer } from "@react-easy-editor/toolbar";

// ── @react-easy-editor/history ──
export { HistoryPlugin } from "@react-easy-editor/history";

// ── @react-easy-editor/text-style ──
export { TextStylePlugin } from "@react-easy-editor/text-style";

// ── @react-easy-editor/text-color ──
export { TextColorPlugin } from "@react-easy-editor/text-color";
export type { TextColorPluginOptions } from "@react-easy-editor/text-color";

// ── @react-easy-editor/alignment ──
export { AlignmentPlugin } from "@react-easy-editor/alignment";

// ── @react-easy-editor/block-type ──
export { BlockTypePlugin } from "@react-easy-editor/block-type";

// ── @react-easy-editor/image ──
export { ImagePlugin, ImageNode } from "@react-easy-editor/image";
export type { ImagePayload } from "@react-easy-editor/image";

// ── @react-easy-editor/video ──
export { VideoPlugin, VideoNode } from "@react-easy-editor/video";
export type { VideoPayload } from "@react-easy-editor/video";

// ── @react-easy-editor/table ──
export { TablePlugin, StyledTableNode, StyledTableRowNode, StyledTableCellNode } from "@react-easy-editor/table";
