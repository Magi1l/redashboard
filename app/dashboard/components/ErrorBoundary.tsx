"use client";
import React, { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO: 에러 로깅 시스템 연동
    console.error("ErrorBoundary caught error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">문제가 발생했습니다</h2>
          <div className="mb-2">{this.state.error?.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
} 