"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { authAPI } from "../../services/api";
import Loader from "../../components/common/Loader";
import { User, ArrowLeft, UserPlus, Key, Mail, Building, AtSign, ShieldAlert, Check, X } from "lucide-react";

const CreateUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "student",
    institution: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.username) errors.username = "Username is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    if (!formData.password) errors.password = "Password is required";
    if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      await authAPI.createUser(formData);
      toast.success("User created successfully");
      navigate("/admin/users");
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.response?.data?.message || "Failed to create user");
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30";
      case "examiner":
        return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30";
      default:
        return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <ShieldAlert className="mr-2 h-4 w-4" />;
      case "examiner":
        return <Check className="mr-2 h-4 w-4" />;
      default:
        return <User className="mr-2 h-4 w-4" />;
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      {/* Page header */}
      <div className="mb-8 space-y-4">
        <button
          onClick={() => navigate("/admin/users")}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Users
        </button>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New User</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md">
            <UserPlus size={16} />
            <span>Adding to system</span>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400">
          Create a new user account and add them to your organization. All fields marked with an asterisk (*) are required.
        </p>
      </div>

      {/* Form container */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">User Information</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Enter the details for the new user account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Full Name */}
            <div className="form-group col-span-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 ${formErrors.name ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  className={`pl-10 block w-full rounded-md border ${
                    formErrors.name 
                      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500'
                  } shadow-sm sm:text-sm`}
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
                {formErrors.name && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <X className="h-5 w-5 text-red-500" aria-hidden="true" />
                  </div>
                )}
              </div>
              {formErrors.name && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <X className="mr-1 h-4 w-4" /> {formErrors.name}
                </p>
              )}
            </div>

            {/* Username */}
            <div className="form-group col-span-1">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSign className={`h-5 w-5 ${formErrors.username ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  className={`pl-10 block w-full rounded-md border ${
                    formErrors.username 
                      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500'
                  } shadow-sm sm:text-sm`}
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                />
                {formErrors.username && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <X className="h-5 w-5 text-red-500" aria-hidden="true" />
                  </div>
                )}
              </div>
              {formErrors.username && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <X className="mr-1 h-4 w-4" /> {formErrors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="form-group col-span-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${formErrors.email ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="email"
                  className={`pl-10 block w-full rounded-md border ${
                    formErrors.email 
                      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500'
                  } shadow-sm sm:text-sm`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                />
                {formErrors.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <X className="h-5 w-5 text-red-500" aria-hidden="true" />
                  </div>
                )}
              </div>
              {formErrors.email && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <X className="mr-1 h-4 w-4" /> {formErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="form-group col-span-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className={`h-5 w-5 ${formErrors.password ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="password"
                  className={`pl-10 block w-full rounded-md border ${
                    formErrors.password 
                      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500'
                  } shadow-sm sm:text-sm`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••"
                />
                {formErrors.password && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <X className="h-5 w-5 text-red-500" aria-hidden="true" />
                  </div>
                )}
              </div>
              {formErrors.password && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <X className="mr-1 h-4 w-4" /> {formErrors.password}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 6 characters
              </p>
            </div>

            {/* Role */}
            <div className="form-group col-span-1 md:col-span-2">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                User Role <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label 
                  className={`relative rounded-lg border p-4 cursor-pointer focus:outline-none flex items-center space-x-3 ${
                    formData.role === 'student' 
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/30' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="role" 
                    value="student" 
                    checked={formData.role === 'student'} 
                    onChange={handleChange} 
                    className="sr-only" 
                  />
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
                    formData.role === 'student' 
                      ? 'bg-blue-100 dark:bg-blue-900/40' 
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <User className={formData.role === 'student' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`block text-sm font-medium ${formData.role === 'student' ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                      Student
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Can take exams
                    </span>
                  </div>
                </label>

                <label 
                  className={`relative rounded-lg border p-4 cursor-pointer focus:outline-none flex items-center space-x-3 ${
                    formData.role === 'examiner' 
                      ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/30' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="role" 
                    value="examiner" 
                    checked={formData.role === 'examiner'} 
                    onChange={handleChange} 
                    className="sr-only" 
                  />
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
                    formData.role === 'examiner' 
                      ? 'bg-amber-100 dark:bg-amber-900/40' 
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <Check className={formData.role === 'examiner' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`block text-sm font-medium ${formData.role === 'examiner' ? 'text-amber-900 dark:text-amber-100' : 'text-gray-900 dark:text-gray-100'}`}>
                      Examiner
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Can create exams
                    </span>
                  </div>
                </label>

                <label 
                  className={`relative rounded-lg border p-4 cursor-pointer focus:outline-none flex items-center space-x-3 ${
                    formData.role === 'admin' 
                      ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/30' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="role" 
                    value="admin" 
                    checked={formData.role === 'admin'} 
                    onChange={handleChange} 
                    className="sr-only" 
                  />
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
                    formData.role === 'admin' 
                      ? 'bg-red-100 dark:bg-red-900/40' 
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <ShieldAlert className={formData.role === 'admin' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`block text-sm font-medium ${formData.role === 'admin' ? 'text-red-900 dark:text-red-100' : 'text-gray-900 dark:text-gray-100'}`}>
                      Administrator
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Full system access
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Institution */}
            <div className="form-group col-span-1 md:col-span-2">
              <label htmlFor="institution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Institution
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 shadow-sm sm:text-sm"
                  id="institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="University or Organization (Optional)"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The institution this user belongs to
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-5 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                disabled={loading}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {loading ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;