import type { ReactNode } from "react";

interface PopoverBoxProps {
  children: ReactNode;
}

export default function PopoverBox({ children }: PopoverBoxProps) {
  return <div className="popover-box">{children}</div>;
}
