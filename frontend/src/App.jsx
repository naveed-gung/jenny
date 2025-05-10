import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import React, { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";

// Fallback UI if Canvas fails to load
function FallbackComponent({ error }) {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-pink-50 text-center p-4">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading 3D Experience</h2>
      <p className="text-gray-800 mb-2">Something went wrong with the 3D renderer.</p>
      <p className="text-sm text-gray-600 mb-4">{error.message}</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
      >
        Refresh Page
      </button>
    </div>
  );
}

function CanvasWrapper() {
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <Suspense fallback={<div className="w-full h-screen bg-pink-50 flex items-center justify-center">Loading 3D Experience...</div>}>
        <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
          <Experience />
        </Canvas>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <>
      <Loader />
      <Leva hidden />
      <UI />
      <CanvasWrapper />
    </>
  );
}

export default App;
