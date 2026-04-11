import {
  CameraControls,
  ContactShadows,
  Text,
} from "@react-three/drei";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { Avatar } from "./Avatar";

// Error Boundary for Three.js components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D Experience error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <group position={[0, 1.5, 0]}>
          <Text fontSize={0.2} color="red" anchorX="center" anchorY="middle">
            Error loading 3D experience
          </Text>
          <Text fontSize={0.1} position={[0, -0.3, 0]} color="white" anchorX="center" anchorY="middle">
            {this.state.error?.message || "Unknown error"}
          </Text>
        </group>
      );
    }

    return this.props.children;
  }
}

const Dots = (props) => {
  const { loading } = useChat();
  const [loadingText, setLoadingText] = useState("");
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingText((loadingText) => {
          if (loadingText.length > 2) {
            return ".";
          }
          return loadingText + ".";
        });
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLoadingText("");
    }
  }, [loading]);
  if (!loading) return null;
  return (
    <group {...props}>
      <Text fontSize={0.14} anchorX={"left"} anchorY={"bottom"}>
        {loadingText}
        <meshBasicMaterial attach="material" color="black" />
      </Text>
    </group>
  );
};

export const Experience = () => {
  const cameraControls = useRef();
  const { cameraZoomed } = useChat();

  useEffect(() => {
    cameraControls.current.setLookAt(0, 2, 5, 0, 1.5, 0);
  }, []);

  useEffect(() => {
    if (cameraZoomed) {
      cameraControls.current.setLookAt(0, 1.5, 1.5, 0, 1.5, 0, true);
    } else {
      cameraControls.current.setLookAt(0, 2.2, 5, 0, 1.0, 0, true);
    }
  }, [cameraZoomed]);
  return (
    <>
      <CameraControls ref={cameraControls} />
      <color attach="background" args={["#f8edf2"]} />
      <ambientLight intensity={0.9} color="#fff2f6" />
      <hemisphereLight intensity={0.7} groundColor="#d2b8c8" color="#ffffff" />
      <directionalLight position={[2.5, 4, 3]} intensity={1.4} color="#fff4f8" castShadow />
      <directionalLight position={[-2, 2.5, -2]} intensity={0.45} color="#ffd9e6" />
      {/* Wrapping Dots into Suspense to prevent Blink when Troika/Font is loaded */}
      <Suspense>
        <Dots position-y={1.75} position-x={-0.02} />
      </Suspense>
      <ErrorBoundary>
        <Suspense fallback={null}>
          <Avatar />
        </Suspense>
      </ErrorBoundary>
      <ContactShadows opacity={0.5} blur={2} scale={9} far={4.2} />
    </>
  );
};
