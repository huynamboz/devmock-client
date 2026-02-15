import { useState } from "react";
import { Outlet } from "react-router-dom";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-default-100">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {/* Content area: offset by sidebar width on desktop */}
      <div className="flex flex-col min-h-screen min-w-0 transition-[margin] duration-200 lg:ml-[256px]">
        <div className="sticky top-0 z-30 shrink-0">
          <AdminHeader onMenuClick={toggleSidebar} />
        </div>
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
