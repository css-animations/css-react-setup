import React, { useContext } from "react";
import { DevToolContext, DevToolProvider } from "./DevToolContext";
import logo from "./logo.svg";
import AnimatedProperties from "./components/AnimatedProperties";
import "./App.css";

export default function AppWrapper() {
  return (
    <DevToolProvider>
      <AppContent />
    </DevToolProvider>
  );
}
function AppContent() {
  const {
    resetCSS,
    attachInspect,
    detachInspect,
    from,
    setFrom,
    to,
    setTo,
    chosenClasses,
    chosenIDs,
  } = useContext(DevToolContext);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <input
          type="number"
          value={from}
          placeholder="From"
          onChange={(event) => setFrom(Number(event.target.value))}
        />
        <input
          type="number"
          value={to}
          placeholder="To"
          onChange={(event) => setTo(Number(event.target.value))}
        />

        <button onClick={() => resetCSS()}>Reset the CSS</button>
        <button onClick={() => attachInspect()}>Inspect a class/div!</button>
        <button onClick={() => detachInspect()}>
          Stop inspecting a class!
        </button>
        <div>Chosen IDs: {Object.keys(chosenIDs)}</div>
        <div>Chosen Classes: {Object.keys(chosenClasses)}</div>
        <AnimatedProperties />
      </header>
    </div>
  );
}
