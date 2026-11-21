// GTK 창 프레임 뷰어
// 브리지(ws://localhost:5000)에 frame_subscribe 로 연결해,
// 컴포지터가 캡처한 GTK 창 PNG 프레임을 canvas 에 그린다.

import React, { useEffect, useRef } from "react";
import "./FrameViewer.scss";

export default function FrameViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wsUrl = process.env.REACT_APP_BRIDGE_URL || "ws://localhost:5000";
    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
    } catch (e) {
      console.error("[FrameViewer] WebSocket 연결 실패", e);
      return;
    }

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "frame_subscribe" }));
      console.log("[FrameViewer] subscribed to frame stream");
    };

    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data as string);
      if (msg.type === "frame") {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const img = new Image();
        img.onload = () => {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(img, 0, 0);
        };
        img.src = `data:image/png;base64,${msg.data}`;
      }
    };

    ws.onclose = () => console.log("[FrameViewer] disconnected");
    ws.onerror = (e) => console.error("[FrameViewer] 오류", e);

    return () => ws.close();
  }, []);

  return (
    <div className="wde-frameviewer">
      <canvas ref={canvasRef} className="wde-frame-canvas" />
    </div>
  );
}