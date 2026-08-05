// État vide : icône dans un dégradé circulaire + message
function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="p-4 rounded-full bg-gradient-to-br from-primary-container to-secondary-container text-primary mb-4 shadow-sm">
        <Icon size={32} />
      </div>
      <p className="font-semibold text-on-surface">{title}</p>
      {message && <p className="text-sm text-on-surface-variant mt-1 max-w-sm">{message}</p>}
    </div>
  )
}

export default EmptyState
