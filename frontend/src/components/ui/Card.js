"use client"

const Card = ({ children, className = "", variant = "default", hover = false, onClick = null }) => {
  const baseClasses = "rounded-lg overflow-hidden"

  const variants = {
    default: "bg-white border border-gray-200 shadow-sm",
    elevated: "bg-white border border-gray-200 shadow-md",
    flat: "bg-white border border-gray-200",
    colored: "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100",
    success: "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100",
    warning: "bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100",
    danger: "bg-gradient-to-br from-red-50 to-rose-50 border border-red-100",
    info: "bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-100",
    dark: "bg-gray-800 text-white",
  }

  const hoverClasses = hover
    ? "transition-transform duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer"
    : ""
  const clickableClass = onClick ? "cursor-pointer" : ""

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${hoverClasses} ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export const CardHeader = ({ children, className = "", title, subtitle }) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      {children}
    </div>
  )
}

export const CardBody = ({ children, className = "" }) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}

export const CardFooter = ({ children, className = "" }) => {
  return <div className={`px-6 py-4 bg-gray-50 border-t border-gray-100 ${className}`}>{children}</div>
}

export default Card

