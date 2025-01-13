"use client";

import React, { useEffect } from "react";
import "./index.css";

function Page() {
  useEffect(() => {
    window.addEventListener("message", (event) => {
      console.log(event.data);
    });

    document.addEventListener(
      "wheel",
      function (event: WheelEvent) {
        if (!event.deltaY || !event.ctrlKey) {
          return;
        }
        console.log("wheel...");
        event.preventDefault();
        window.parent.postMessage({ name: "zoom", deltaY: event.deltaY }, "*");
        return false;
      },
      { passive: false }
    );
  }, []);

  return <div className="">我是画布</div>;
}

export default Page;
