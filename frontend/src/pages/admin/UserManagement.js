"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { authAPI } from "../../services/api";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";
import { UserPlus, Edit, Trash2, Search, Filter, Users, ChevronDown, School, Shield, CheckCircle, Mail, Calendar } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [filter, currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getUsers();
      let filteredUsers = response.data.data || [];

      // Apply role filter
      if (filter !== "all") {
        filteredUsers = filteredUsers.filter((user) => user.role === filter);
      }

      // Apply search if present
      if (searchTerm) {
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.institution && user.institution.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setUsers(filteredUsers);
      setTotalPages(Math.ceil(filteredUsers.length / 10));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await authAPI.deleteUser(userToDelete._id);
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get current users for pagination
  const indexOfLastUser = currentPage * 10;
  const indexOfFirstUser = indexOfLastUser - 10;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <header className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-blue-700 dark:text-blue-400 tracking-tight">
            User Management
          </h1>
          <Link
            to="/admin/users/create"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all text-white font-medium"
          >
            <UserPlus size={18} />
            <span>New User</span>
          </Link>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <form onSubmit={handleSearch} className="flex-grow relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
            <select
              className="form-select px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="all">All Users</option>
              <option value="student">Students</option>
              <option value="examiner">Examiners</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 text-center">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">No users found</h3>
          <p className="text-gray-600 dark:text-gray-400">Create your first user to get started.</p>
          <Link to="/admin/users/create" className="mt-3 inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all text-white font-medium">
            Create New User
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6">
            <table className="w-full border rounded-md">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Institution</th>
                  <th className="px-4 py-2 text-left">Joined Date</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user._id} className="border-t">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className={`px-4 py-2 ${user.role === "admin" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : user.role === "examiner" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"} flex items-center`}>
                      {user.role === "admin" && <Shield className="h-4 w-4 mr-1" />}
                      {user.role === "examiner" && <CheckCircle className="h-4 w-4 mr-1" />}
                      {user.role === "student" && <School className="h-4 w-4 mr-1" />}
                      {user.role.toUpperCase()}
                    </td>
                    <td className="px-4 py-2">{user.institution || "N/A"}</td>
                    <td className="px-4 py-2">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-2 flex items-center space-x-2">
                      <Link to={`/admin/users/${user._id}/edit`} className="text-blue-600 hover:text-blue-800 transition">
                        <Edit />
                      </Link>
                      <button onClick={() => confirmDelete(user)} className="text-red-600 hover:text-red-800 transition">
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDeleteUser}>
              Delete
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete the user "{userToDelete?.name}"?</p>
        <p className="text-danger">This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default UserManagement;