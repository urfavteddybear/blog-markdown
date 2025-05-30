import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath?: string
  searchQuery?: string
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  basePath = '', 
  searchQuery = '' 
}: PaginationProps) {
  if (totalPages <= 1) return null

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams()
    if (page > 1) params.set('page', page.toString())
    if (searchQuery) params.set('search', searchQuery)
    
    const queryString = params.toString()
    return `${basePath}${queryString ? `?${queryString}` : ''}`
  }

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  return (
    <nav className="flex items-center justify-center space-x-2 mt-8" aria-label="Pagination">
      {/* Previous button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-black border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Link>
      ) : (
        <span className="flex items-center px-3 py-2 text-sm text-gray-400 border border-gray-100 rounded-md cursor-not-allowed">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </span>
      )}

      {/* Page numbers */}
      <div className="flex items-center space-x-1">
        {getVisiblePages().map((page, index) => {
          if (page === '...') {
            return (
              <span key={index} className="px-3 py-2 text-gray-400">
                ...
              </span>
            )
          }

          const pageNumber = page as number
          const isCurrentPage = pageNumber === currentPage

          return (
            <Link
              key={pageNumber}
              href={createPageUrl(pageNumber)}
              className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                isCurrentPage
                  ? 'bg-black text-white border-black'
                  : 'text-gray-600 border-gray-200 hover:text-black hover:border-gray-300'
              }`}
              aria-label={`Page ${pageNumber}`}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {pageNumber}
            </Link>
          )
        })}
      </div>

      {/* Next button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-black border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
          aria-label="Next page"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      ) : (
        <span className="flex items-center px-3 py-2 text-sm text-gray-400 border border-gray-100 rounded-md cursor-not-allowed">
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </span>
      )}
    </nav>
  )
}
