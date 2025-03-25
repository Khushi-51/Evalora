"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { BookOpen, Home, User, Award, FileText, LogOut, Menu, X, Bell, ChevronDown, Settings } from "react-feather"

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const location = useLocation()

  const user = JSON.parse(localStorage.getItem("user")) || {}
  const role = user.role || "student"

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen)
  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen)

  const studentNavItems = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/student/dashboard" },
    { name: "Exams", icon: <FileText size={20} />, path: "/student/exams" },
    { name: "Certificates", icon: <Award size={20} />, path: "/student/certificates" },
    { name: "Profile", icon: <User size={20} />, path: "/student/profile" },
  ]

  const adminNavItems = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/admin/dashboard" },
    { name: "Manage Exams", icon: <BookOpen size={20} />, path: "/admin/exams" },
    { name: "Users", icon: <User size={20} />, path: "/admin/users" },
    { name: "Certificates", icon: <Award size={20} />, path: "/admin/certificates" },
    { name: "Settings", icon: <Settings size={20} />, path: "/admin/settings" },
  ]

  const navItems = role === "admin" ? adminNavItems : studentNavItems

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleSidebar}></div>

        <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-6 bg-blue-600">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-white">ExamPro</span>
            </Link>
            <button onClick={toggleSidebar} className="text-white">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 px-4 py-4 overflow-y-auto">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md group transition-colors ${
                    location.pathname === item.path
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  <span
                    className={`mr-3 ${
                      location.pathname === item.path ? "text-blue-500" : "text-gray-500 group-hover:text-blue-500"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 mt-6 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-700 group transition-colors"
              >
                <span className="mr-3 text-gray-500 group-hover:text-red-500">
                  <LogOut size={20} />
                </span>
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-6 bg-blue-600">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-white">ExamPro</span>
            </Link>
          </div>

          <div className="flex flex-col flex-1 px-4 py-4 overflow-y-auto">
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md group transition-colors ${
                    location.pathname === item.path
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  <span
                    className={`mr-3 ${
                      location.pathname === item.path ? "text-blue-500" : "text-gray-500 group-hover:text-blue-500"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-700 group transition-colors"
              >
                <span className="mr-3 text-gray-500 group-hover:text-red-500">
                  <LogOut size={20} />
                </span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top navigation */}
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 sm:px-6 lg:px-8">
          <button type="button" className="p-1 text-gray-500 lg:hidden" onClick={toggleSidebar}>
            <span className="sr-only">Open sidebar</span>
            <Menu size={24} />
          </button>

          <div className="flex items-center space-x-4">
            {/* Notifications dropdown */}
            <div className="relative">
              <button
                type="button"
                className="p-1 text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-100"
                onClick={toggleNotifications}
              >
                <span className="sr-only">View notifications</span>
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 w-80 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-100">
                      Notifications
                    </div>
                    <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-medium">New exam available</p>
                      <p className="text-gray-500">Mathematics Final Exam is now available</p>
                    </div>
                    <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-medium">Certificate generated</p>
                      <p className="text-gray-500">Your certificate for Physics is ready</p>
                    </div>
                    <div className="px-4 py-2 text-sm text-blue-600 text-center">
                      <a href="#" className="hover:underline">
                        View all notifications
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center max-w-xs text-sm rounded-full focus:outline-none"
                onClick={toggleUserMenu}
              >
                <span className="sr-only">Open user menu</span>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{user.name || "User"}</span>
                <ChevronDown size={16} className="ml-1 text-gray-500" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link
                      to={`/${role}/profile`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Your Profile
                    </Link>
                    <Link
                      to={`/${role}/settings`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>

        {/* Footer */}
        <footer className="py-4 bg-white border-t border-gray-200">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <p className="text-sm text-center text-gray-500">
              &copy; {new Date().getFullYear()} ExamPro. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default DashboardLayout

