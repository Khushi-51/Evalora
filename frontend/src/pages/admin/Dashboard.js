"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { authAPI, examsAPI, submissionsAPI, certificatesAPI } from "../../services/api";
import Loader from "../../components/common/Loader";
import { User, Clipboard, File, Medal, PieChart, ChevronRight, Settings, PlusCircle } from "lucide-react";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExams: 0,
    totalSubmissions: 0,
    totalCertificates: 0,
    studentCount: 0,
    examinerCount: 0,
    adminCount: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentExams, setRecentExams] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersResponse = await authAPI.getUsers();
      const users = usersResponse.data.data || [];

      // Fetch exams
      const examsResponse = await examsAPI.getExams();
      const exams = examsResponse.data.data || [];

      // Fetch submissions
      const submissionsResponse = await submissionsAPI.getSubmissions();
      const submissions = submissionsResponse.data.data || [];

      // Fetch certificates
      const certificatesResponse = await certificatesAPI.getCertificates();
      const certificates = certificatesResponse.data.data || [];

      // Calculate stats
      const studentCount = users.filter((user) => user.role === "student").length;
      const examinerCount = users.filter((user) => user.role === "examiner").length;
      const adminCount = users.filter((user) => user.role === "admin").length;

      setStats({
        totalUsers: users.length,
        totalExams: exams.length,
        totalSubmissions: submissions.length,
        totalCertificates: certificates.length,
        studentCount,
        examinerCount,
        adminCount,
      });

      // Get recent users
      const sortedUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
      setRecentUsers(sortedUsers);

      // Get recent exams
      const sortedExams = [...exams].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
      setRecentExams(sortedExams);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <header className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-blue-700 dark:text-blue-400 tracking-tight">
            Administration Dashboard
          </h1>
          <div className="flex space-x-3">
            <Link 
              to="/admin/settings" 
              className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg 
                         border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all 
                         text-gray-700 dark:text-gray-200 font-medium"
            >
              <Settings size={18} />
              <span>Settings</span>
            </Link>
            <Link 
              to="/admin/users/create" 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
                         dark:bg-blue-700 dark:hover:bg-blue-800 px-4 py-2 rounded-lg
                         shadow-sm hover:shadow-md transition-all text-white font-medium"
            >
              <PlusCircle size={18} />
              <span>New User</span>
            </Link>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 
                        p-6 rounded-xl shadow-sm mb-8">
          <p className="text-gray-700 dark:text-gray-200 text-lg">
            Welcome to your administration dashboard. Here you can manage users, exams, and view system statistics.
          </p>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">System Overview</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-t-4 border-blue-500
                         hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Users</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{stats.totalUsers}</h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <User className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
            <Link to="/admin/users" className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center hover:underline">
              Manage Users
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-t-4 border-indigo-500
                         hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Exams</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{stats.totalExams}</h3>
              </div>
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                <Clipboard className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
            </div>
            <Link to="/examiner/exams" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center hover:underline">
              View Exams
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-t-4 border-violet-500
                         hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Submissions</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{stats.totalSubmissions}</h3>
              </div>
              <div className="bg-violet-100 dark:bg-violet-900/30 p-3 rounded-full">
                <File className="text-violet-600 dark:text-violet-400" size={24} />
              </div>
            </div>
            <Link to="/examiner/submissions" className="text-violet-600 dark:text-violet-400 text-sm font-medium flex items-center hover:underline">
              View Submissions
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-t-4 border-amber-500
                         hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Certificates</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{stats.totalCertificates}</h3>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                <Medal className="text-amber-600 dark:text-amber-400" size={24} />
              </div>
            </div>
            <Link to="/admin/certificates" className="text-amber-600 dark:text-amber-400 text-sm font-medium flex items-center hover:underline">
              Manage Certificates
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* User Distribution */}
      <section className="mb-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">User Distribution</h2>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
              <PieChart className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 
                          rounded-lg p-5 text-center">
              <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.studentCount}</h3>
              <p className="text-green-800 dark:text-green-300 font-medium">Students</p>
              <div className="mt-2 bg-green-200 dark:bg-green-800/40 h-1.5 rounded-full w-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full rounded-full" 
                  style={{ width: `${stats.totalUsers ? (stats.studentCount / stats.totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 
                          rounded-lg p-5 text-center">
              <h3 className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.examinerCount}</h3>
              <p className="text-amber-800 dark:text-amber-300 font-medium">Examiners</p>
              <div className="mt-2 bg-amber-200 dark:bg-amber-800/40 h-1.5 rounded-full w-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full" 
                  style={{ width: `${stats.totalUsers ? (stats.examinerCount / stats.totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 
                          rounded-lg p-5 text-center">
              <h3 className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.adminCount}</h3>
              <p className="text-red-800 dark:text-red-300 font-medium">Administrators</p>
              <div className="mt-2 bg-red-200 dark:bg-red-800/40 h-1.5 rounded-full w-full overflow-hidden">
                <div 
                  className="bg-red-500 h-full rounded-full" 
                  style={{ width: `${stats.totalUsers ? (stats.adminCount / stats.totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <section>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Recent Users</h2>
              <Link 
                to="/admin/users" 
                className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center"
              >
                View All <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            
            {recentUsers.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentUsers.map((user) => (
                  <Link
                    key={user._id}
                    to={`/admin/users/${user._id}/edit`}
                    className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h6 className="text-base font-semibold text-gray-900 dark:text-white">{user.name}</h6>
                      <span className={`
                        px-2.5 py-1 rounded-full text-xs font-medium 
                        ${user.role === 'admin' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                          : user.role === 'examiner' 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{user.email}</p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                      Joined on {formatDate(user.createdAt)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">No users found</p>
              </div>
            )}
          </div>
        </section>

        {/* Recent Exams */}
        <section>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Recent Exams</h2>
              <Link 
                to="/examiner/exams" 
                className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center"
              >
                View All <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            
            {recentExams.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentExams.map((exam) => (
                  <div key={exam._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <h6 className="text-base font-semibold text-gray-900 dark:text-white truncate max-w-xs">
                        {exam.title}
                      </h6>
                      <span
                        className={`
                          px-2.5 py-1 rounded-full text-xs font-medium 
                          ${exam.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : exam.status === "draft"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                      >
                        {exam.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {exam.description.substring(0, 100)}...
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                      Created by {exam.createdBy.name} on {formatDate(exam.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">No exams found</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;