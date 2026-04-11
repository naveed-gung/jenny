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
    <div className="w-full h-screen flex items-center justify-center p-5">
      <div className="glass-panel soft-ring max-w-lg rounded-[28px] p-8 text-center">
        <p className="brand-title text-sm uppercase tracking-[0.3em] text-pink-500">Jenny</p>
        <h2 className="brand-title mt-3 text-3xl font-bold text-slate-900">3D Scene Unavailable</h2>
        <p className="mt-4 text-sm leading-6 text-slate-600">The interface is still usable, but the avatar renderer failed to start.</p>
        <p className="mt-3 rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-500">{error.message}</p>
        <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-400">Check connectivity or reload after assets finish loading</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-rose-500 px-5 py-3 font-semibold text-white shadow-lg shadow-pink-300/40 transition hover:brightness-105"
        >
          Reload Experience
        </button>
      </div>
    </div>
  );
}

function CanvasLoadingFallback() {
  return (
    <div className="w-full h-screen flex items-center justify-center p-5">
      <div className="glass-panel soft-ring rounded-[28px] px-8 py-6 text-center">
        <p className="brand-title text-xs uppercase tracking-[0.32em] text-pink-500">Initializing</p>
        <h2 className="brand-title mt-2 text-2xl font-bold text-slate-900">Preparing Jenny</h2>
        <p className="mt-3 text-sm text-slate-600">Loading the avatar, animations, and conversation UI.</p>
      </div>
    </div>
  );
}

function CanvasWrapper() {
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <Suspense fallback={<CanvasLoadingFallback />}>
        <Canvas
          dpr={[1, 1.75]}
          shadows
          camera={{ position: [0, 0, 1], fov: 30 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
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
