// WDE 터미널 컴포넌트
// Xterm.js 를 렌더링하고, WDE 브리지(Node WebSocket + node-pty)에 연결한다.
// 연결: bridge/src/server.js  (기본 ws://localhost:5000)

import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import "./Terminal.scss";

export default function WdeTerminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Xterm.js 생성
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      theme: { background: "#1e1e1e", foreground: "#d4d4d4" },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);

    // DOM 에 부착
    term.open(containerRef.current);
    fit.fit();
    term.focus();
    xtermRef.current = term;

    // 브리지 WebSocket 연결
    let ws: WebSocket;
    const wsUrl = process.env.REACT_APP_BRIDGE_URL || "ws://localhost:5000";
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;
    } catch (e) {
      term.writeln("\x1b[31m[WDE] bridge WebSocket 연결 실패\x1b[0m");
      return;
    }

    ws.onopen = () => {
      // 터미널 세션 생성
      ws.send(JSON.stringify({ type: "spawn", cols: term.cols, rows: term.rows }));
      term.writeln("WDE terminal ready (type commands)");
    };
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data as string);
      if (msg.type === "output") term.write(msg.data);
      else if (msg.type === "exit") term.writeln(`\r\n[process exited: ${msg.code}]`);
    };
    ws.onclose = () => term.writeln("\r\n[bridge disconnected]");
    ws.onerror = (e) => {
      term.writeln("\x1b[31m[WDE] bridge 오류\x1b[0m");
    };

    // 키 입력 → 브리지로 전달
    const dataListener = term.onData((data) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "input", data }));
      }
    });

    // resize
    const resizeObserver = new ResizeObserver(() => {
      try {
        fit.fit();
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows })
          );
        }
      } catch {}
    });
    resizeObserver.observe(containerRef.current);

    // cleanup
    return () => {
      resizeObserver.disconnect();
      dataListener.dispose();
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({ type: "close" }));
        wsRef.current.close();
      }
      term.dispose();
    };
  }, []);

  return <div className="wde-terminal" ref={containerRef} />;
}