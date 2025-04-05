"use client"

import { useState, useContext, useEffect } from "react"
import { toast } from "react-toastify"
import AuthContext from "../../context/AuthContext"
import Loader from "../../components/common/Loader"

const Profile = () => {
  const { user, updateProfile, updatePassword, loading } = useContext(AuthContext)
  const [profileData, setProfileData] = useState({
    name: "",
    institution: "",
    profilePicture: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [profileErrors, setProfileErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})
  const [activeTab, setActiveTab] = useState("profile")
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        institution: user.institution || "",
        profilePicture: user.profilePicture || "",
      })
    }
  }, [user])

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value })
    // Clear error when user types
    if (profileErrors[e.target.name]) {
      setProfileErrors({ ...profileErrors, [e.target.name]: "" })
    }
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
    // Clear error when user types
    if (passwordErrors[e.target.name]) {
      setPasswordErrors({ ...passwordErrors, [e.target.name]: "" })
    }
  }

  const validateProfileForm = () => {
    const errors = {}
    if (!profileData.name) errors.name = "Name is required"
    setProfileErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePasswordForm = () => {
    const errors = {}
    if (!passwordData.currentPassword) errors.currentPassword = "Current password is required"
    if (!passwordData.newPassword) errors.newPassword = "New password is required"
    if (passwordData.newPassword.length < 6) errors.newPassword = "Password must be at least 6 characters"
    if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = "Passwords do not match"
    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()

    if (!validateProfileForm()) return

    setUpdatingProfile(true)
    try {
      await updateProfile(profileData)
      toast.success("Profile updated successfully")
      setUpdatingProfile(false)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile")
      setUpdatingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (!validatePasswordForm()) return

    setUpdatingPassword(true)
    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast.success("Password updated successfully")
      setUpdatingPassword(false)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password")
      setUpdatingPassword(false)
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  // Generate random background color based on name
  const getAvatarBackground = (name) => {
    const colors = [
      'bg-blue-500', 'bg-red-500', 'bg-green-500', 
      'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (loading) {
    return <Loader />
  }
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-col items-center">
              {profileData.profilePicture ? (
                <img
                  src={profileData.profilePicture}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-gray-100"
                />
              ) : (
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-2xl font-bold text-white ${getAvatarBackground(user.name)}`}>
                  {getInitials(user.name)}
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-1">{user.name}</h3>
              <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full mb-2">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              <p className="text-gray-600 dark:text-gray-400">{user.institution || "No institution"}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <nav className="divide-y divide-gray-200 dark:divide-gray-700">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full px-6 py-4 text-left transition-colors ${
                  activeTab === "profile"
                    ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <span className="text-gray-900 dark:text-white font-medium">Profile Information</span>
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`w-full px-6 py-4 text-left transition-colors ${
                  activeTab === "password"
                    ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <span className="text-gray-900 dark:text-white font-medium">Change Password</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {activeTab === "profile" ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Information</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      profileErrors.name ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600`}
                  />
                  {profileErrors.name && <p className="mt-1 text-sm text-red-600">{profileErrors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-600 dark:border-gray-600"
                  />
                  <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label htmlFor="institution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Institution
                  </label>
                  <input
                    type="text"
                    id="institution"
                    name="institution"
                    value={profileData.institution}
                    onChange={handleProfileChange}
                    placeholder="Your school, university or organization"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
  <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Profile Picture
  </label>
  <div className="mt-1 flex items-center space-x-4">
    <div className="flex-shrink-0">
      {profileData.profilePicture ? (
        <img
          src={profileData.profilePicture}
          alt={user.name}
          className="h-16 w-16 rounded-full object-cover ring-2 ring-blue-500"
          onError={(e) => {
            e.target.onerror = null;
            setProfileData(prev => ({ ...prev, profilePicture: "" }));
          }}
        />
      ) : (
        <div className={`h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold text-white ${getAvatarBackground(user.name)}`}>
          {getInitials(user.name)}
        </div>
      )}
    </div>
    <div className="flex-grow">
      <input
        type="text"
        id="profilePicture"
        name="profilePicture"
        value={profileData.profilePicture}
        onChange={handleProfileChange}
        placeholder="Enter image URL or leave empty for initials avatar"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
        />
    </div>
    </div>
        <p className="mt-2 text-sm text-gray-500">
          Enter a valid image URL or leave empty to use your initials as avatar
        </p>
    </div>

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
                >
                  {updatingProfile ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </form>
            </div>
          ) : (
            // Password form with similar styling
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
  <div>
    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Current Password
    </label>
    <input
      type="password"
      id="currentPassword"
      name="currentPassword"
      value={passwordData.currentPassword}
      onChange={handlePasswordChange}
      className={`w-full px-4 py-2 rounded-lg border ${
        passwordErrors.currentPassword ? "border-red-500" : "border-gray-300"
      } focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600`}
    />
    {passwordErrors.currentPassword && (
      <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
    )}
  </div>

  <div>
    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      New Password
    </label>
    <input
      type="password"
      id="newPassword"
      name="newPassword"
      value={passwordData.newPassword}
      onChange={handlePasswordChange}
      className={`w-full px-4 py-2 rounded-lg border ${
        passwordErrors.newPassword ? "border-red-500" : "border-gray-300"
      } focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600`}
    />
    {passwordErrors.newPassword && (
      <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
    )}
  </div>

  <div>
    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Confirm New Password
    </label>
    <input
      type="password"
      id="confirmPassword"
      name="confirmPassword"
      value={passwordData.confirmPassword}
      onChange={handlePasswordChange}
      className={`w-full px-4 py-2 rounded-lg border ${
        passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"
      } focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600`}
    />
    {passwordErrors.confirmPassword && (
      <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
    )}
  </div>

  <button
    type="submit"
    disabled={updatingPassword}
    className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
  >
    {updatingPassword ? (
      <span className="flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Updating Password...
      </span>
    ) : (
      "Update Password"
    )}
  </button>
</form>
            </div>
          )}
        </div>
      </div>
    </div>
  );

}

export default Profile

