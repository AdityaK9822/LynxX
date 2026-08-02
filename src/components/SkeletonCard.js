"use client";

import React from "react";

export default function SkeletonCard() {
    return (
        <div 
            className="activity-card" 
            style={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                cursor: 'default',
                marginBottom: '12px'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div 
                    className="skeleton-pulse" 
                    style={{
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.08)',
                        flexShrink: 0
                    }} 
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div 
                        className="skeleton-pulse" 
                        style={{
                            width: '140px', 
                            height: '18px', 
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.08)'
                        }} 
                    />
                    <div 
                        className="skeleton-pulse" 
                        style={{
                            width: '90px', 
                            height: '13px', 
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.05)'
                        }} 
                    />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div 
                    className="skeleton-pulse" 
                    style={{
                        width: '70px', 
                        height: '18px', 
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.08)'
                    }} 
                />
                <div 
                    className="skeleton-pulse" 
                    style={{
                        width: '50px', 
                        height: '12px', 
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.04)'
                    }} 
                />
            </div>
        </div>
    );
}
