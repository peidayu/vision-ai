import React, { useEffect } from "react";
import ImageUploadArea from "./components/ImageUploadArea";
import ResultDisplay from "./components/ResultDisplay";
import ConfigPanel from "./components/ConfigPanel";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { config } from "mdye";

export default function App() {
  useEffect(() => {
    if (config.themeColor) {
      document.documentElement.style.setProperty(
        "--primary",
        config.themeColor
      );
    }
  }, []);
  return (
    <div className="h-screen overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {config.isCharge && (
          <ResizablePanel defaultSize={30} minSize={20}>
            <ConfigPanel />
          </ResizablePanel>
        )}
        {config.isCharge && <ResizableHandle />}
        <ResizablePanel defaultSize={33} minSize={20}>
          <div className="h-full flex flex-col">
            <ImageUploadArea />
            <ResultDisplay />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
