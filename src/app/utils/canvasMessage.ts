export const sendCanvasMessage = (type: string, payload: Record<string, unknown>) => {
  const canvasIframe = document.querySelector<HTMLIFrameElement>('#canvas-iframe');
  if (canvasIframe?.contentWindow) {
    canvasIframe.contentWindow.postMessage({
      type,
      payload
    }, '*');
  }
};