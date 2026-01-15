import React from 'react';
import { Navigate } from 'react-router-dom';

export default function DashboardHome() {
  // Redirect to stats page by default
  return <Navigate to="/dashboard/stats" replace />;
}
