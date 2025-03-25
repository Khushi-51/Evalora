"use client";

import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import {
  User,
  Clipboard,
  File,
  Medal,
  LogOut,
  Settings,
  Home,
  LogIn,
  UserPlus,
  ChevronDown,
  Menu,
  X,
  Award,
  BookOpen,
  CheckSquare
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import "../../styles/globals.css";

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin, isExaminer } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    // Close menu when clicking outside of it
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Determine active link
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (isAdmin) return "/admin";
    if (isExaminer) return "/examiner";
    return "/dashboard";
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex-shrink-0">
            <Link 
              to={isAuthenticated ? getDashboardLink() : "/"} 
              className="flex items-center"
            >
              <Award className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text">
                ExamPlatform
              </span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-1">
            {isAuthenticated ? (
              <>
                {/* Main Navigation Links */}
                <Link 
                  to={getDashboardLink()} 
                  className={`nav-link-desktop ${isActive(getDashboardLink()) ? "nav-link-active" : ""}`}
                >
                  <Home size={18} className="mr-1.5" />
                  <span>Dashboard</span>
                </Link>

                {/* Student Links */}
                {!isAdmin && !isExaminer && (
                  <>
                    <Link 
                      to="/exams" 
                      className={`nav-link-desktop ${isActive("/exams") ? "nav-link-active" : ""}`}
                    >
                      <Clipboard size={18} className="mr-1.5" />
                      <span>Exams</span>
                    </Link>
                    <Link 
                      to="/certificates" 
                      className={`nav-link-desktop ${isActive("/certificates") ? "nav-link-active" : ""}`}
                    >
                      <Medal size={18} className="mr-1.5" />
                      <span>Certificates</span>
                    </Link>
                  </>
                )}

                {/* Examiner Links */}
                {(isExaminer || isAdmin) && (
                  <>
                    <Link 
                      to="/examiner/exams" 
                      className={`nav-link-desktop ${isActive("/examiner/exams") ? "nav-link-active" : ""}`}
                    >
                      <Clipboard size={18} className="mr-1.5" />
                      <span>Manage Exams</span>
                    </Link>
                    <Link 
                      to="/examiner/questions" 
                      className={`nav-link-desktop ${isActive("/examiner/questions") ? "nav-link-active" : ""}`}
                    >
                      <BookOpen size={18} className="mr-1.5" />
                      <span>Question Bank</span>
                    </Link>
                    <Link 
                      to="/examiner/submissions" 
                      className={`nav-link-desktop ${isActive("/examiner/submissions") ? "nav-link-active" : ""}`}
                    >
                      <CheckSquare size={18} className="mr-1.5" />
                      <span>Submissions</span>
                    </Link>
                  </>
                )}

                {/* Admin Links */}
                {isAdmin && (
                  <>
                    <Link 
                      to="/admin/users" 
                      className={`nav-link-desktop ${isActive("/admin/users") ? "nav-link-active" : ""}`}
                    >
                      <User size={18} className="mr-1.5" />
                      <span>Users</span>
                    </Link>
                    <Link 
                      to="/admin/settings" 
                      className={`nav-link-desktop ${isActive("/admin/settings") ? "nav-link-active" : ""}`}
                    >
                      <Settings size={18} className="mr-1.5" />
                      <span>Settings</span>
                    </Link>
                  </>
                )}

                {/* User Profile Dropdown */}
                <div className="relative ml-2" ref={profileDropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 
                              bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <User size={18} className="mr-1.5" />
                    <span className="max-w-xs truncate">{user?.name || "Profile"}</span>
                    <ChevronDown size={16} className={`ml-1.5 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700">
                      <div className="py-1 px-4">
                        <p className="block text-sm font-medium text-gray-900 dark:text-white truncate pb-1">{user?.name}</p>
                        <p className="block text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <User size={16} className="mr-3 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                          Profile Settings
                        </Link>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <LogOut size={16} className="mr-3 text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`nav-link-desktop ${isActive("/login") ? "nav-link-active" : ""}`}
                >
                  <LogIn size={18} className="mr-1.5" />
                  <span>Login</span>
                </Link>
                <Link 
                  to="/register" 
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md 
                            shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                            focus:ring-offset-2 focus:ring-blue-500"
                >
                  <UserPlus size={18} className="mr-1.5" />
                  <span>Register</span>
                </Link>
              </>
            )}

            {/* Theme Toggle */}
            <div className="ml-3">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <div className="mr-2">
              <ThemeToggle />
            </div>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 
                        hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 
                        focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        ref={menuRef}
        className={`${
          isMenuOpen ? "block" : "hidden"
        } md:hidden bg-white dark:bg-gray-900 shadow-inner border-t dark:border-gray-800`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {isAuthenticated ? (
            <>
              {/* User info for mobile */}
              <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-white">{user?.name}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">{user?.role}</div>
                  </div>
                </div>
              </div>

              <Link
                to={getDashboardLink()}
                className={`mobile-nav-link ${isActive(getDashboardLink()) ? "mobile-nav-active" : ""}`}
              >
                <Home size={20} className="mr-3" />
                Dashboard
              </Link>

              {/* Student Links */}
              {!isAdmin && !isExaminer && (
                <>
                  <Link
                    to="/exams"
                    className={`mobile-nav-link ${isActive("/exams") ? "mobile-nav-active" : ""}`}
                  >
                    <Clipboard size={20} className="mr-3" />
                    Exams
                  </Link>
                  <Link
                    to="/certificates"
                    className={`mobile-nav-link ${isActive("/certificates") ? "mobile-nav-active" : ""}`}
                  >
                    <Medal size={20} className="mr-3" />
                    Certificates
                  </Link>
                </>
              )}

              {/* Examiner Links */}
              {(isExaminer || isAdmin) && (
                <>
                  <Link
                    to="/examiner/exams"
                    className={`mobile-nav-link ${isActive("/examiner/exams") ? "mobile-nav-active" : ""}`}
                  >
                    <Clipboard size={20} className="mr-3" />
                    Manage Exams
                  </Link>
                  <Link
                    to="/examiner/questions"
                    className={`mobile-nav-link ${isActive("/examiner/questions") ? "mobile-nav-active" : ""}`}
                  >
                    <BookOpen size={20} className="mr-3" />
                    Question Bank
                  </Link>
                  <Link
                    to="/examiner/submissions"
                    className={`mobile-nav-link ${isActive("/examiner/submissions") ? "mobile-nav-active" : ""}`}
                  >
                    <CheckSquare size={20} className="mr-3" />
                    Submissions
                  </Link>
                </>
              )}

              {/* Admin Links */}
              {isAdmin && (
                <>
                  <Link
                    to="/admin/users"
                    className={`mobile-nav-link ${isActive("/admin/users") ? "mobile-nav-active" : ""}`}
                  >
                    <User size={20} className="mr-3" />
                    Users
                  </Link>
                  <Link
                    to="/admin/settings"
                    className={`mobile-nav-link ${isActive("/admin/settings") ? "mobile-nav-active" : ""}`}
                  >
                    <Settings size={20} className="mr-3" />
                    Settings
                  </Link>
                </>
              )}

              <Link
                to="/profile"
                className={`mobile-nav-link ${isActive("/profile") ? "mobile-nav-active" : ""}`}
              >
                <User size={20} className="mr-3" />
                Profile
              </Link>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-base font-medium rounded-md text-red-700 dark:text-red-400 
                           bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <LogOut size={20} className="mr-3" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`mobile-nav-link ${isActive("/login") ? "mobile-nav-active" : ""}`}
              >
                <LogIn size={20} className="mr-3" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center px-4 py-3 text-base font-medium rounded-md text-white 
                           bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus size={20} className="mr-3" />
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;