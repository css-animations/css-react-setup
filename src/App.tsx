import React, { useState, useEffect, useReducer } from "react";
import { AnimateProperties } from "./components/AnimateProperties";
import KeyframeDetails from "./components/KeyframeDetails";
import "./App.css";
import { BezierComponent } from "./components/Canvas";
import ExportWindow from "./components/ExportWindow";
import { Property } from "./types/propertyData";
import {
  propertyReducer,
  PropertyReducerActionTypes,
  propertyReducerDefaultState,
} from "./utils/propertyDataReducer";
import { Point } from "./types/bezier";
import { ANIMATABLE_PROPERTIES } from "./components/NewChild";

export function App() {
  const [headContent, setHeadContent] = useState("");
  const [propertyData, dispatchPropertyData] = useReducer(
    propertyReducer,
    propertyReducerDefaultState,
  );

  //grab initial head content onMount
  useEffect(() => {
    const head = window.document.getElementsByTagName("HEAD")[0];
    setHeadContent(head.innerHTML);
  }, []);

  // Quickly calculates the correct bezier points from the starting points
  useEffect(() => {
    const points: Point[] = [
      { x: 20, y: 400 },
      { x: 100, y: 350 },
      { x: 200, y: 200 },
      { x: 300, y: 80 },
      { x: 400, y: 30 },
    ];

    dispatchPropertyData({
      type: PropertyReducerActionTypes.COMPUTE_STARTING_BEZIER_POINTS,
      data: { points: points },
      timelineId: ANIMATABLE_PROPERTIES.scale,
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <AnimateProperties />
        <KeyframeDetails />
        {propertyData.propertyMetadata.selectedProperty &&
        propertyData.propertyMetadata.selectedProperty in
          propertyData.properties ? (
          <BezierComponent
            propertyData={
              propertyData.properties[
                propertyData.propertyMetadata.selectedProperty
              ] as Property
            }
            currentIndex={1}
            width={400}
            height={400}
            timelineId={propertyData.propertyMetadata.selectedProperty}
            dispatchPropertyData={dispatchPropertyData}
          />
        ) : (
          <div>Select or create a property to view it's curve!</div>
        )}
        <ExportWindow />
      </header>
    </div>
  );
}
