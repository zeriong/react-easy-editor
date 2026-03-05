import { createCommand } from "lexical";
import { useToastStore } from "../store/toastStore.ts";

// Editor Toast
export const toast = useToastStore.getState().addToast;

// resizable image command
export const UPDATE_IMAGE_SIZE_COMMAND = createCommand<{
  key: string;
  width: number;
  height: number;
}>("UPDATE_IMAGE_SIZE");
// resizable video command
export const UPDATE_VIDEO_SIZE_COMMAND = createCommand<{
  key: string;
  width: number;
  height: number;
}>("UPDATE_VIDEO_SIZE_COMMAND");
