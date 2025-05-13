import React, { ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: { componentStack: string } | null;
}

export default class ErrorBoundary extends React.Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    this.setState({ error, errorInfo });
    // 외부 로깅 연동 필요시 여기에 추가
  }
  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };
  handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <div className="text-red-500 text-lg font-bold mb-2">문제가 발생했습니다</div>
          <div className="mb-4 text-gray-700">일시적인 오류이거나, 입력값/설정 문제일 수 있습니다.<br />
            아래 버튼으로 새로고침하거나, 홈으로 이동해 주세요.<br />
            문제가 반복되면 관리자에게 문의해 주세요.
          </div>
          <div className="flex gap-2 justify-center mb-4">
            <button onClick={this.handleReload} className="px-4 py-2 bg-blue-500 text-white rounded">새로고침</button>
            <button onClick={this.handleGoHome} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">홈으로</button>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="bg-gray-100 p-2 rounded text-left max-w-xl mx-auto" style={{ whiteSpace: "pre-wrap" }}>
              <summary className="cursor-pointer text-sm text-gray-500 mb-1">상세 에러 정보 (개발환경)</summary>
              <div className="text-xs text-gray-600">
                {this.state.error.toString()}
                <br />
                {this.state.errorInfo?.componentStack}
              </div>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
} 