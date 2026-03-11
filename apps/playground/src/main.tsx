import { createRoot } from "react-dom/client";
import "@react-easy-editor/core/styles.css";
import "./App.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(<App />);
