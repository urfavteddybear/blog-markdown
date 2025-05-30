import { format, parseISO } from 'date-fns'

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString)
    return format(date, 'MMMM d, yyyy')
  } catch {
    return dateString
  }
}

// Pagination utilities
export interface PaginationResult<T> {
  items: T[]
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export function paginateArray<T>(
  array: T[],
  page: number = 1,
  itemsPerPage: number = 6
): PaginationResult<T> {
  const totalItems = array.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const currentPage = Math.max(1, Math.min(page, totalPages))
  
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  
  const items = array.slice(startIndex, endIndex)
  
  return {
    items,
    currentPage,
    totalPages: totalPages || 1,
    totalItems,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  }
}
