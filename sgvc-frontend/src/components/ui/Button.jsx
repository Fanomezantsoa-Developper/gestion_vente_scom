// Bouton avec variantes
const VARIANTS = {
  primary: 'bg-primary text-on-primary hover:opacity-90',
  secondary: 'bg-secondary-container text-on-secondary-container hover:opacity-90',
  danger: 'bg-error text-on-error hover:opacity-90',
  outline: 'border border-outline-variant bg-white text-on-surface hover:bg-surface-container',
  ghost: 'text-on-surface-variant hover:bg-surface-container',
}

function Button({ variant = 'primary', icon: Icon, children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  )
}

export default Button
