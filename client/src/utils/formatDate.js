export const formatDate = (dateString, options = {}) => {
  const defaultOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  const mergedOptions = { ...defaultOptions, ...options }
  return new Date(dateString).toLocaleDateString(undefined, mergedOptions)
}

export const formatDateRelative = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  return formatDate(dateString, { year: 'numeric', month: 'short', day: 'numeric' })
}