
export default function Button({ children, onClick, variant = 'primary', className = '' }) {
  const baseStyles = "px-6 py-2 rounded-lg font-medium transition-all active:scale-95";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    danger: "bg-red-500 text-white hover:bg-red-600"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}