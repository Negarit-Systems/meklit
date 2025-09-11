import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar"
import { SideBar } from "./SideBar"


export function PublicLayout() {
  return (
    <div className="flex h-screen bg-background">
    <SideBar className="hidden md:flex" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
