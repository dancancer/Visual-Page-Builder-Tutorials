"use client";

import React, { useCallback, useEffect } from "react";
import "./index.css";

function Page() {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const canvasWraperRef = React.useRef<HTMLDivElement>(null);
  const zoomRatioRef = React.useRef<HTMLDivElement>(null);
  const zoomRatio = React.useRef(0.5);

  const zoom = useCallback(
    (deltaY: number) => {
      if (deltaY < 0) {
        console.log("放大...", deltaY);
        zoomRatio.current = zoomRatio.current * (1 - deltaY * 0.01);
      } else if (deltaY > 0) {
        zoomRatio.current = zoomRatio.current * (1 - deltaY * 0.01);
        console.log("缩小...", deltaY);
      }
      canvasRef.current!.style.transform = `scale(${zoomRatio.current})`;
      canvasWraperRef.current!.style.width = `${
        1440 * zoomRatio.current + 400
      }px`;
      canvasWraperRef.current!.style.height = `${
        1024 * zoomRatio.current + 400
      }px`;
      zoomRatioRef.current!.innerText = `${Math.round(
        zoomRatio.current * 100
      )}%`;
      document.dispatchEvent(new Event("canvas-zoom"));
    },
    [zoomRatio]
  );

  useEffect(() => {
    window.addEventListener("message", (event) => {
      const { deltaY } = event.data;
      zoom(deltaY);
    });
    document.addEventListener(
      "wheel",
      function (event: WheelEvent) {
        if (!event.deltaY || !event.ctrlKey) {
          return;
        }
        console.log("wheel...");
        event.preventDefault();

        zoom(event.deltaY);
        return false;
      },
      { passive: false }
    );
  }, [zoom]);

  return (
    <div className="editor">
      <div className="navbar">顶部导航+工具栏</div>
      <div className="main-container">
        <div className="sidebar">左侧功能区</div>
        <div className="canvas-container ">
          <div className=" zoom-ratio" ref={zoomRatioRef}>{`${Math.round(
            zoomRatio.current * 100
          )}%`}</div>
          <div
            className=" p-[200px]"
            style={{
              width: `${1440 * zoomRatio.current + 400}px`,
              height: `${1024 * zoomRatio.current + 400}px`,
            }}
            ref={canvasWraperRef}
          >
            <div
              className=" canvas origin-top-left h-[1024px] w-[1440px]"
              style={{
                transform: `scale(${zoomRatio.current})`,
              }}
              ref={canvasRef}
            >
              <iframe
                className=" h-full w-full"
                src="/canvas"
                ref={iframeRef}
              ></iframe>
            </div>
          </div>
        </div>
        <div className="properties">属性面板</div>
      </div>
    </div>
  );
}

export default Page;
