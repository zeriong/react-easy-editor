import { AnimatePresence, motion } from "framer-motion";

import type { CSSProperties, ReactNode } from "react";
import type { AnimatePresenceProps } from "framer-motion";

interface FadeAnimateProps {
  isVisible: boolean;
  children: ReactNode;
  animMode?: AnimatePresenceProps["mode"];
  motionOptions?: Record<string, unknown>;
  className?: string;
  style?: CSSProperties;
}

export default function FadeAnimate({
  isVisible,
  children,
  animMode = "wait",
  motionOptions = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: "easeInOut" },
  },
  className,
  style = {},
}: FadeAnimateProps) {
  return (
    <AnimatePresence mode={animMode}>
      {isVisible && (
        <motion.div {...motionOptions} className={className} style={style}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
