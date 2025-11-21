import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { provideFluentDesignSystem, fluentSlider, fluentSliderLabel, fluentSwitch } from "@fluentui/web-components";

provideFluentDesignSystem().register(fluentSlider(), fluentSliderLabel(), fluentSwitch());

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
