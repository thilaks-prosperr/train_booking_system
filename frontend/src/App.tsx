import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

// Public Pages
import Landing from "./pages/public/Landing";
import SearchResults from "./pages/public/SearchResults";
import SeatSelection from "./pages/public/SeatSelection";
import Login from "./pages/public/Login";
import Signup from "./pages/public/Signup";

// User Pages
import UserDashboard from "./pages/user/Dashboard";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import ManageStations from "./pages/admin/ManageStations";
import ManageTrains from "./pages/admin/ManageTrains";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/seats" element={<SeatSelection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* User Routes */}
            <Route path="/dashboard" element={<UserDashboard />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/stations" element={<ManageStations />} />
            <Route path="/admin/trains" element={<ManageTrains />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
