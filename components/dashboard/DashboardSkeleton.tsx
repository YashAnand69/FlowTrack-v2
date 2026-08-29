'use client'

import React from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Page Title Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-4 w-72 rounded-lg" />
      </div>

      {/* Top Row Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="glass-card p-6 rounded-2xl space-y-4"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-36 rounded-lg" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
        ))}
      </div>

      {/* 6-Month Chart Skeleton */}
      <div className="glass-card p-6 rounded-2xl space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-3 w-64 rounded-md" />
          </div>
          <Skeleton className="h-7 w-28 rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>

      {/* Recent Activity Skeleton */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
