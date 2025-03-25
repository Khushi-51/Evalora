"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loader";
import { Settings, Mail, Clipboard, Save } from "lucide-react";

const SystemSettings = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Online Exam Platform",
    siteDescription: "A comprehensive platform for online exams and certifications",
    contactEmail: "admin@example.com",
    maxFileUploadSize: 5, // MB
  });

  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    emailService: "smtp",
    emailHost: "smtp.example.com",
    emailPort: 587,
    emailUsername: "notifications@example.com",
    emailPassword: "",
    emailFromName: "Online Exam Platform",
    emailFromAddress: "notifications@example.com",
  });

  // Exam settings
  const [examSettings, setExamSettings] = useState({
    defaultPassingScore: 70,
    defaultCertificateTemplate: "default",
    allowStudentRegistration: true,
    requireEmailVerification: true,
    defaultProctoringEnabled: false,
  });

  const handleGeneralSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEmailSettingsChange = (e) => {
    const { name, value } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: value,
    });
  };

  const handleExamSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExamSettings({
      ...examSettings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSaveSettings = (settingsType) => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast.success(`${settingsType} settings saved successfully`);
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <header className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-blue-700 dark:text-blue-400 tracking-tight">
            System Settings
          </h1>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Settings</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <button
                className={`w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors 
                             ${activeTab === "general" ? "bg-gray-50 dark:bg-gray-750" : ""}`}
                onClick={() => setActiveTab("general")}
              >
                <div className="flex items-center gap-2">
                  <Settings size={18} />
                  <span>General Settings</span>
                </div>
              </button>
              <button
                className={`w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors 
                             ${activeTab === "email" ? "bg-gray-50 dark:bg-gray-750" : ""}`}
                onClick={() => setActiveTab("email")}
              >
                <div className="flex items-center gap-2">
                  <Mail size={18} />
                  <span>Email Configuration</span>
                </div>
              </button>
              <button
                className={`w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors 
                             ${activeTab === "exam" ? "bg-gray-50 dark:bg-gray-750" : ""}`}
                onClick={() => setActiveTab("exam")}
              >
                <div className="flex items-center gap-2">
                  <Clipboard size={18} />
                  <span>Exam Settings</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="md:w-3/4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              {activeTab === "general" && (
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">General Settings</h2>
              )}
              {activeTab === "email" && (
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Email Configuration</h2>
              )}
              {activeTab === "exam" && (
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Exam Settings</h2>
              )}
            </div>

            <div className="px-6 py-5">
              {/* General Settings */}
              {activeTab === "general" && (
                <form>
                  <div className="mb-4">
                    <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Site Name
                    </label>
                    <input
                      type="text"
                      id="siteName"
                      name="siteName"
                      value={generalSettings.siteName}
                      onChange={handleGeneralSettingsChange}
                      className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none 
                                 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Site Description
                    </label>
                    <textarea
                      id="siteDescription"
                      name="siteDescription"
                      rows="3"
                      value={generalSettings.siteDescription}
                      onChange={handleGeneralSettingsChange}
                      className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none 
                                 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={generalSettings.contactEmail}
                      onChange={handleGeneralSettingsChange}
                      className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none 
                                 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="maxFileUploadSize" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Max File Upload Size (MB)
                    </label>
                    <input
                      type="number"
                      id="maxFileUploadSize"
                      name="maxFileUploadSize"
                      value={generalSettings.maxFileUploadSize}
                      onChange={handleGeneralSettingsChange}
                      min="1"
                      max="50"
                      className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none 
                                 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveSettings("General")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md 
                                 hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Save size={18} />
                      Save Settings
                    </button>
                  </div>
                </form>
              )}

              {/* Email Settings */}
              {activeTab === "email" && (
                <form>
                  <div className="mb-4">
                    <label htmlFor="emailService" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Email Service
                    </label>
                    <select
                      id="emailService"
                      name="emailService"
                      value={emailSettings.emailService}
                      onChange={handleEmailSettingsChange}
                      className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none 
                                 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    >
                      <option value="smtp">SMTP</option>
                      <option value="sendgrid">SendGrid</option>
                      <option value="mailgun">Mailgun</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="emailHost" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      id="emailHost"
                      name="emailHost"
                      value={emailSettings.emailHost}
                      onChange={handleEmailSettingsChange}
                      className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none 
                                 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="emailPort" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      id="emailPort"
                      name="emailPort"
                      value={emailSettings.emailPort}
                      onChange={handleEmailSettingsChange}
                      className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none 
                                 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="emailUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      id="emailUsername"
                      name="emailUsername"
                      value={emailSettings.emailUsername}
                      onChange={handleEmailSettingsChange}
                      className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none 
                                 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="emailPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      id="emailPassword"
                      name="emailPassword"
                      value={emailSettings.emailPassword}
                      onChange={handleEmailSettingsChange}
                      placeholder="Enter password"
                      className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none 
                                 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="emailFromName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      From Name
                    </label>
                    <input
                      type="text"
                      id="emailFromName"
                      name="emailFromName"
                      value={emailSettings.emailFromName}
                      onChange={handleEmailSettingsChange}
                      className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none 
                                 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="emailFromAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      From Email Address
                    </label>
                    <input
                      type="email"
                      id="emailFromAddress"
                      name="emailFromAddress"
                      value={emailSettings.emailFromAddress}
                      onChange={handleEmailSettingsChange}
                      className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none 
                                 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveSettings("Email")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md 
                                 hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Save size={18} />
                      Save Settings
                    </button>
                  </div>
                </form>
              )}

              {/* Exam Settings */}
              {activeTab === "exam" && (
                <form>
                  <div className="mb-4">
                    <label htmlFor="defaultPassingScore" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Default Passing Score (%)
                    </label>
                    <input
                      type="number"
                      id="defaultPassingScore"
                      name="defaultPassingScore"
                      value={examSettings.defaultPassingScore}
                      onChange={handleExamSettingsChange}
                      min="0"
                      max="100"
                      className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none 
                                 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="defaultCertificateTemplate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Default Certificate Template
                    </label>
                    <select
                      id="defaultCertificateTemplate"
                      name="defaultCertificateTemplate"
                      value={examSettings.defaultCertificateTemplate}
                      onChange={handleExamSettingsChange}
                      className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none 
                                 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    >
                      <option value="default">Default</option>
                      <option value="gold">Gold</option>
                      <option value="blue">Blue</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowStudentRegistration"
                        name="allowStudentRegistration"
                        checked={examSettings.allowStudentRegistration}
                        onChange={handleExamSettingsChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 
                                   dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500"
                      />
                      <label htmlFor="allowStudentRegistration" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Allow Student Self-Registration
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireEmailVerification"
                        name="requireEmailVerification"
                        checked={examSettings.requireEmailVerification}
                        onChange={handleExamSettingsChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 
                                   dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500"
                      />
                      <label htmlFor="requireEmailVerification" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Require Email Verification
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="defaultProctoringEnabled"
                        name="defaultProctoringEnabled"
                        checked={examSettings.defaultProctoringEnabled}
                        onChange={handleExamSettingsChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 
                                   dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500"
                      />
                      <label htmlFor="defaultProctoringEnabled" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Enable Proctoring by Default
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveSettings("Exam")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md 
                                 hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Save size={18} />
                      Save Settings
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;