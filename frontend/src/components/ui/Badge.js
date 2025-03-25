const Badge = ({ children, variant = "primary", size = "md", rounded = false, className = "" }) => {
  const baseClasses = "inline-flex items-center font-medium"

  const variants = {
    primary: "bg-blue-100 text-blue-800",
    secondary: "bg-purple-100 text-purple-800",
    success: "bg-green-100 text-green-800",
    danger: "bg-red-100 text-red-800",
    warning: "bg-amber-100 text-amber-800",
    info: "bg-cyan-100 text-cyan-800",
    light: "bg-gray-100 text-gray-800",
    dark: "bg-gray-700 text-gray-100",
  }

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  }

  const roundedClass = rounded ? "rounded-full" : "rounded"

  return (
    <span className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${roundedClass} ${className}`}>
      {children}
    </span>
  )
}

export default Badge

