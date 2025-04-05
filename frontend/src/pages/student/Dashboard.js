"use client";

import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { examsAPI, submissionsAPI, certificatesAPI } from "../../services/api";
import AuthContext from "../../context/AuthContext";
import Loader from "../../components/common/Loader";
import "../../styles/globals.css";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 -mx-4 px-8 py-12 sm:px-6 sm:rounded-3xl shadow-2xl mb-12">
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-2">
              Welcome back, <span className="text-blue-100">{user.name}</span>
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Track your progress and manage your learning journey
            </p>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4">
            <svg className="w-64 h-64 text-white/10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14l9-5-9-5-9 5 9 5z"/>
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
            </svg>
          </div>
        </header>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300 border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Exams</p>
                <span className="p-2 bg-blue-100 text-blue-600 rounded-xl dark:bg-blue-900/30 dark:text-blue-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </span>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{stats.availableExams}</p>
              <Link to="/exams" 
                className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 group">
                Browse Exams
                <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300 border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Exams</p>
                <span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl dark:bg-emerald-900/30 dark:text-emerald-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </span>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.completedExams}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300 border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Exams</p>
                <span className="p-2 bg-amber-100 text-amber-600 rounded-xl dark:bg-amber-900/30 dark:text-amber-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </span>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.upcomingExams}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300 border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Certificates</p>
                <span className="p-2 bg-purple-100 text-purple-600 rounded-xl dark:bg-purple-900/30 dark:text-purple-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                  </svg>
                </span>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{stats.certificates}</p>
              <Link to="/certificates" 
                className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 group">
                View Certificates
                <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Results & Certificates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-gray-800 dark:to-gray-750">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  Recent Exam Results
                </h2>
              </div>
              
              {recentExams.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Exam</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-slate-200 dark:divide-slate-700">
                      {recentExams.map((exam) => (
                        <tr key={exam._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{exam.exam.title}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(exam.endTime).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(exam.endTime).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white font-medium">
                              {exam.totalScore}/{exam.exam.totalMarks}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {Math.round((exam.totalScore / exam.exam.totalMarks) * 100)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                              ${exam.isPassed 
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}`}>
                              <svg className={`w-4 h-4 mr-1.5 ${exam.isPassed ? "text-emerald-500" : "text-red-500"}`} fill="currentColor" viewBox="0 0 20 20">
                                {exam.isPassed ? (
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                ) : (
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                )}
                              </svg>
                              {exam.isPassed ? "Passed" : "Failed"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Link 
                              to={`/results/${exam._id}`}
                              className="inline-flex items-center text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium group"
                            >
                              View Results
                              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">No exam results yet</p>
                  <Link 
                    to="/exams"
                    className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Browse Available Exams
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Certificates Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-gray-800 dark:to-gray-750">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <svg className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                  </svg>
                  Recent Certificates
                </h2>
              </div>
              <div className="p-6">
                {recentCertificates.length > 0 ? (
                  <div className="space-y-4">
                    {recentCertificates.map((cert) => (
                      <div 
                        key={cert._id} 
                        className="group p-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-xl hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{cert.exam.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Issued on: {new Date(cert.issueDate).toLocaleDateString()}
                            </p>
                            <Link 
                              to={`/certificates/${cert._id}`}
                              className="mt-2 inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 group"
                            >
                              View Certificate
                              <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">Complete exams to earn certificates</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-gray-800 dark:to-gray-750">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/exams" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                Browse Available Exams
              </Link>
              
              <Link 
                to="/certificates" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                View All Certificates
              </Link>
              
              <Link 
                to="/profile" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Update Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;