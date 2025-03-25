"use client";

import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { examsAPI, submissionsAPI, certificatesAPI } from "../../services/api";
import AuthContext from "../../context/AuthContext";
import Loader from "../../components/common/Loader";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    availableExams: 0,
    completedExams: 0,
    upcomingExams: 0,
    certificates: 0,
  });
  const [recentExams, setRecentExams] = useState([]);
  const [recentCertificates, setRecentCertificates] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch available exams
        const availableExamsRes = await examsAPI.getAvailableExams();

        // Fetch user submissions
        const submissionsRes = await submissionsAPI.getUserSubmissions();

        // Fetch user certificates
        const certificatesRes = await certificatesAPI.getUserCertificates();

        // Fetch upcoming exams
        const upcomingExamsRes = await examsAPI.getUpcomingExams();

        // Set stats
        setStats({
          availableExams: availableExamsRes.data.count || 0,
          completedExams: submissionsRes.data.data.filter((sub) => sub.isCompleted).length || 0,
          upcomingExams: upcomingExamsRes.data.count || 0,
          certificates: certificatesRes.data.count || 0,
        });

        // Set recent exams (completed submissions)
        const completedSubmissions = submissionsRes.data.data
          .filter((sub) => sub.isCompleted)
          .sort((a, b) => new Date(b.endTime) - new Date(a.endTime))
          .slice(0, 3);
        setRecentExams(completedSubmissions);

        // Set recent certificates
        setRecentCertificates(certificatesRes.data.data.slice(0, 3));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <header className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-blue-700 dark:text-blue-400 tracking-tight">
            Welcome, {user.name}
          </h1>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Your Exam Activities</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-t-4 border-blue-500 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Available Exams</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{stats.availableExams}</h3>
              </div>
            </div>
            <Link to="/exams" className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center hover:underline">
              View All
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-t-4 border-green-500 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Completed Exams</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{stats.completedExams}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-t-4 border-yellow-500 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Upcoming Exams</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{stats.upcomingExams}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-t-4 border-indigo-500 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Certificates Earned</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{stats.certificates}</h3>
              </div>
            </div>
            <Link to="/certificates" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center hover:underline">
              View All
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Recent Exam Results</h2>

        {recentExams.length > 0 ? (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6">
            <table className="w-full border rounded-md">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Exam</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Score</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentExams.map((exam) => (
                  <tr key={exam._id} className="border-t">
                    <td className="px-4 py-2">{exam.exam.title}</td>
                    <td className="px-4 py-2">{new Date(exam.endTime).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      {exam.totalScore}/{exam.exam.totalMarks}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${exam.isPassed ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}>
                        {exam.isPassed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <Link to={`/results/${exam._id}`} className="text-blue-600 hover:text-blue-800 transition">
                        View Results
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">You haven't completed any exams yet.</p>
        )}
      </section>

      {recentCertificates.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Recent Certificates</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentCertificates.map((cert) => (
              <div key={cert._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{cert.exam.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Issued on: {new Date(cert.issueDate).toLocaleDateString()}</p>
                <Link to={`/certificates/${cert._id}`} className="text-blue-600 hover:text-blue-800 transition">
                  View Certificate
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Quick Actions</h2>

        <div className="flex flex-wrap gap-4">
          <Link to="/exams" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Browse Available Exams
          </Link>
          <Link to="/certificates" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
            View All Certificates
          </Link>
          <Link to="/profile" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
            Update Profile
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;