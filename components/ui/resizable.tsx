"use client";

// Placeholder component - react-resizable-panels API has changed
// Install and configure properly when needed

import * as React from "react";
import { cn } from "./utils";

function ResizablePanelGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex h-full w-full", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function ResizablePanel({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>;
}

function ResizableHandle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-px bg-border", className)} {...props} />;
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
