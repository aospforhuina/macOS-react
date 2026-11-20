// Imports
import "./App.scss";
import React, { createContext, useReducer, useEffect } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import reducer from "./reducers/reducer";
import sampleStore from "./utils/keys/samples/sampleStore";
import WeatherBoard from "./components/WeatherBoard/WeatherBoard";
import QueryBoard from "./components/QueryBoard/QueryBoard";
import Terminal from "./components/Terminal/Terminal";
import Draggable from "react-draggable";
import NavBar from "./components/NavBar/NavBar";
import Page from "./components/Page/Page";
import Dock from "./components/Dock/Dock";
import ContextMenu from "./components/ContextMenu/ContextMenu";
import BootSound from "./resources/audio/bootsound.mp3";
import WallpaperMenu from "./components/WallpaperMenu/WallpaperMenu";
import wallpapers from "./utils/helpers/wallpapers";

// Create store (redux naming convention)
export const store = createContext<any>(null);

// Create store provider to wrap subcomponents in
const StoreProvider = ({ children }: any) => (
  <store.Provider value={useReducer(reducer as any, sampleStore as any)}>
    {children}
  </store.Provider>
);

function App() {
  return (
    <ChakraProvider>
      <StoreProvider>
        <Page>
          <NavBar />
          <div className="wde-terminal-window" id="wde-terminal-window">
            <Draggable
              handle="#wde-terminal-handle"
              onStart={(e: any): false | void => {
                // 글씨(span) 등 핸들의 자식을 잡아도 드래그되도록,
                // id 직접 비교 대신 closest 로 핸들 영역 포함 여부 판정.
                if (!e.target.closest("#wde-terminal-handle")) {
                  return false;
                }
                return undefined;
              }}
            >
              <div className={`window terminal-window`} id="terminal-window">
                <div className="terminal-titlebar" id="wde-terminal-handle">
                  <span className="terminal-title">WDE Terminal</span>
                </div>
                <Terminal />
              </div>
            </Draggable>
          </div>
          <Draggable
            handle="#handle"
            onStart={(e: any) => {
              if (e.target.id !== "handle") {
                return false;
              }
            }}
          >
            <div className={`window weather-window`} id="weather-window">
              <QueryBoard />
              <WeatherBoard />
            </div>
          </Draggable>
          <WallpaperMenu />
          <ContextMenu />
          <Dock />
        </Page>
      </StoreProvider>
    </ChakraProvider>
  );
}

export default App;
