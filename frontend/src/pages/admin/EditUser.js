"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authAPI } from "../../services/api";
import Loader from "../../components/common/Loader";
import { Save, XCircle } from "lucide-react";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    institution: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getUsers();
      const users = response.data.data || [];
      const user = users.find((u) => u._id === id);

      if (!user) {
        toast.error("User not found");
        navigate("/admin/users");
        return;
      }

      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution || "",
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data");
      navigate("/admin/users");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) errors.email = "Email is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSaving(true);
    try {
      await authAPI.updateUser(id, formData);
      toast.success("User updated successfully");
      navigate("/admin/users");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <header className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-blue-700 dark:text-blue-400 tracking-tight">
            Edit User
          </h1>
          <button
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 dark:text-gray-200 font-medium"
            onClick={() => navigate("/admin/users")}
          >
            <XCircle size={18} />
            <span>Back to Users</span>
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">User Details</h2>
        </div>
        <div className="px-6 py-5">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 ${
                  formErrors.name ? "border-red-500" : ""
                }`}
                placeholder="Enter full name"
              />
              {formErrors.name && <div className="text-red-500 text-sm mt-1">{formErrors.name}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 ${
                  formErrors.email ? "border-red-500" : ""
                }`}
                placeholder="Enter email address"
              />
              {formErrors.email && <div className="text-red-500 text-sm mt-1">{formErrors.email}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="student">Student</option>
                <option value="examiner">Examiner</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="institution" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Institution (Optional)
              </label>
              <input
                type="text"
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                placeholder="Enter institution name"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <XCircle size={18} />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-md shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ml-3"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;