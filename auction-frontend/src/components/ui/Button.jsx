const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'base', 
  disabled = false, 
  loading = false, 
  className = '',
  type = 'button',
  onClick,
  ...props 
}) => {
  const baseStyles = 'font-semibold border-none cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-red-800 text-white hover:bg-red-900 focus:ring-red-500 disabled:bg-gray-400',
    secondary: 'bg-white text-gray-900 border-2 border-gray-900 hover:bg-gray-900 hover:text-white focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500'
  };
  
  const sizes = {
    small: 'px-4 py-2 text-sm rounded-md',
    base: 'px-6 py-3 text-base rounded-lg',
    large: 'px-8 py-4 text-lg rounded-lg'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      suppressHydrationWarning
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
};

export default Button;
