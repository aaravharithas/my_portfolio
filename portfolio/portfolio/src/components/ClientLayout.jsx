import React from "react";
import Navbar from "./Navbar.jsx";
import AppleCursor from "./AppleCursor.jsx";
import ScrollIndicator from "./ScrollIndicator.jsx";

export default function ClientLayout({ children }) {
  return (
    <>
      <Navbar variant="desktop" />
      <AppleCursor />
      <ScrollIndicator />
      {children}
    </>
  );
}
