import { createContext, useContext } from "react";
import type { ToolbarItemConfig } from "./types";

const ToolbarContext = createContext<ToolbarItemConfig[]>([]);

export function ToolbarProvider({ items, children }: { items: ToolbarItemConfig[]; children: React.ReactNode }) {
  return <ToolbarContext.Provider value={items}>{children}</ToolbarContext.Provider>;
}

export function useToolbarItems(): ToolbarItemConfig[] {
  return useContext(ToolbarContext);
}
