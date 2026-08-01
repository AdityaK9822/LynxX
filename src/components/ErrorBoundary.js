"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🚨 [ErrorBoundary Caught Component Crash]:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof this.props.onReset === "function") {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-card">
          <div className="error-boundary-icon-wrap">
            <AlertTriangle size={24} className="text-amber-400" />
          </div>

          <div className="error-boundary-content">
            <h3 className="error-boundary-title">Something Went Wrong</h3>
            <p className="error-boundary-desc">
              {this.props.message || "Something went wrong. Try again."}
            </p>

            <button
              type="button"
              className="btn btn-gradient btn-error-reset flex items-center justify-center gap-2 mt-4"
              onClick={this.handleReset}
            >
              <RefreshCw size={14} />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
