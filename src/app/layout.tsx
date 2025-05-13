import "../styles/globals.css";
import { ReactNode } from "react";
import ErrorBoundary from "./ErrorBoundary";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
} 