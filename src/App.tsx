import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminClients from "@/pages/admin/AdminClients";
import AdminEmployees from "@/pages/admin/AdminEmployees";
import AdminBilling from "@/pages/admin/AdminBilling";
import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";
import EmployeeClients from "@/pages/employee/EmployeeClients";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminDashboard /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/clients" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminClients /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/employees" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminEmployees /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/billing" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminBilling /></DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Employee Routes */}
            <Route path="/employee/dashboard" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <DashboardLayout><EmployeeDashboard /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/employee/clients" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <DashboardLayout><EmployeeClients /></DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
