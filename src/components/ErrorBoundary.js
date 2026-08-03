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
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onRetry) {
            this.props.onRetry();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-card">
                    <div className="error-boundary-icon">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>
                        Something went wrong. Try again.
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '20px', maxWidth: '400px' }}>
                        We encountered an unexpected error while rendering this view. Please try again.
                    </p>
                    <button 
                        onClick={this.handleRetry}
                        className="btn btn-primary flex items-center gap-2"
                        style={{
                            padding: '10px 20px',
                            borderRadius: '12px',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            background: '#ef4444',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <RefreshCw size={16} />
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
