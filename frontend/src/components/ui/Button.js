"use client"
import { Link } from "react-router-dom"

const Button = ({
  children,
  onClick,
  to,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  className = "",
  icon = null,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    warning: "bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500",
    info: "bg-cyan-500 hover:bg-cyan-600 text-white focus:ring-cyan-500",
    light: "bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-300",
    dark: "bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-700",
    outline: "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300",
  }

  const sizes = {
    sm: "text-xs px-2.5 py-1.5 rounded-md",
    md: "text-sm px-4 py-2 rounded-md",
    lg: "text-base px-5 py-2.5 rounded-lg",
    xl: "text-lg px-6 py-3 rounded-lg",
  }

  const widthClass = fullWidth ? "w-full" : ""
  const disabledClass = disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"

  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${disabledClass} ${className}`

  if (to) {
    return (
      <Link to={to} className={buttonClasses}>
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={buttonClasses}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}

export default Button

