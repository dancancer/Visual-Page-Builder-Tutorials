export const sendCanvasMessage = (type: string, payload: any) => {
  const canvasIframe = document.querySelector<HTMLIFrameElement>('#canvas-iframe');
  if (canvasIframe?.contentWindow) {
    canvasIframe.contentWindow.postMessage({
      type,
      payload
    }, '*');
  }
};