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

  if (loading) {
    return <Loader />
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-3">
          <div className="card mb-4">
            <div className="card-body text-center">
              <img
                src={profileData.profilePicture || "/default-profile.jpg"}
                alt="Profile"
                className="rounded-circle img-fluid"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
              <h5 className="my-3">{user.name}</h5>
              <p className="text-muted mb-1">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
              <p className="text-muted mb-4">{user.institution || "No institution"}</p>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li
                  className={`list-group-item d-flex justify-content-between align-items-center p-3 ${activeTab === "profile" ? "active" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setActiveTab("profile")}
                >
                  <span>Profile Information</span>
                </li>
                <li
                  className={`list-group-item d-flex justify-content-between align-items-center p-3 ${activeTab === "password" ? "active" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setActiveTab("password")}
                >
                  <span>Change Password</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          {activeTab === "profile" ? (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Profile Information</h5>
                <form onSubmit={handleProfileSubmit}>
                  <div className="form-group mb-3">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      className={`form-control ${profileErrors.name ? "is-invalid" : ""}`}
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                    />
                    {profileErrors.name && <div className="invalid-feedback">{profileErrors.name}</div>}
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" className="form-control" id="email" value={user.email} disabled />
                    <small className="form-text text-muted">Email cannot be changed</small>
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="institution">Institution</label>
                    <input
                      type="text"
                      className="form-control"
                      id="institution"
                      name="institution"
                      value={profileData.institution}
                      onChange={handleProfileChange}
                      placeholder="Your school, university or organization"
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="profilePicture">Profile Picture URL</label>
                    <input
                      type="text"
                      className="form-control"
                      id="profilePicture"
                      name="profilePicture"
                      value={profileData.profilePicture}
                      onChange={handleProfileChange}
                      placeholder="URL to your profile picture"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={updatingProfile}>
                    {updatingProfile ? "Updating..." : "Update Profile"}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Change Password</h5>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="form-group mb-3">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      className={`form-control ${passwordErrors.currentPassword ? "is-invalid" : ""}`}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                    {passwordErrors.currentPassword && (
                      <div className="invalid-feedback">{passwordErrors.currentPassword}</div>
                    )}
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      className={`form-control ${passwordErrors.newPassword ? "is-invalid" : ""}`}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                    {passwordErrors.newPassword && <div className="invalid-feedback">{passwordErrors.newPassword}</div>}
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      className={`form-control ${passwordErrors.confirmPassword ? "is-invalid" : ""}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                    {passwordErrors.confirmPassword && (
                      <div className="invalid-feedback">{passwordErrors.confirmPassword}</div>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={updatingPassword}>
                    {updatingPassword ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile

