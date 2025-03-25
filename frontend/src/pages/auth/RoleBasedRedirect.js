"use client"

import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AuthContext from "../../context/AuthContext"
import Loader from "../../components/common/Loader"

const RoleBasedRedirect = () => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
      if (!loading) {
          if (!isAuthenticated) {
              navigate("/login");
          } else {
              // Check if user object exists
              if (user) {
                  if (user.role === "admin") {
                      navigate("/admin");
                  } else if (user.role === "examiner") {
                      navigate("/examiner");
                  } else {
                      navigate("/dashboard"); // Default student dashboard
                  }
              }
          }
      }
  }, [isAuthenticated, loading, navigate, user]);

  return loading ? <Loader /> : null;
};


export default RoleBasedRedirect