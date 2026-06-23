import type { ReactNode } from "react";
import Navbar from "./Navbar";

export default function Layout({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen bg-bg bg-grid-fade">
      <Navbar />
      <main
        className={`mx-auto px-4 py-8 sm:px-6 ${wide ? "max-w-7xl" : "max-w-6xl"}`}
      >
        {children}
      </main>
    </div>
  );
}
