import React from "react";
import Navbar from "./Navbar.jsx";
import AppleCursor from "./AppleCursor.jsx";
import ScrollIndicator from "./ScrollIndicator.jsx";
import FloatingDotsBackground from "./FloatingDotsBackground.jsx";

export default function ClientLayout({ children }) {
  return (
    <>
      <FloatingDotsBackground />
      <Navbar variant="desktop" />
      <AppleCursor />
      <ScrollIndicator />
      {children}
    </>
  );
}