"use client";

import React from "react";

export default function SkeletonCard({ count = 4 }) {
  const items = Array.from({ length: count });

  return (
    <div className="skeleton-card-container flex flex-col gap-3 w-full">
      {items.map((_, index) => (
        <div key={index} className="skeleton-card-item">
          {/* Avatar / Icon Bone */}
          <div className="skeleton-bone skeleton-avatar flex-shrink-0" />

          {/* Text Information Column Bone */}
          <div className="skeleton-info-col flex-1 flex flex-col gap-2">
            <div className="skeleton-bone skeleton-title-line" />
            <div className="skeleton-bone skeleton-sub-line" />
          </div>

          {/* Amount Pill Bone */}
          <div className="skeleton-bone skeleton-amount-pill flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
