'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BlogPostMetadata } from '@/lib/posts'
import { searchPosts } from '@/lib/search'
import { paginateArray } from '@/lib/utils'
import PostCard from '@/components/PostCard'
import SearchBar from '@/components/SearchBar'
import TagCloud from '@/components/TagCloud'
import Pagination from '@/components/Pagination'

interface PostsClientProps {
  posts: BlogPostMetadata[]
  tags: string[]
}

const POSTS_PER_PAGE = 12

export default function PostsClient({ posts, tags }: PostsClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [searchResults, setSearchResults] = useState(posts)
  const [currentSearchQuery, setCurrentSearchQuery] = useState('')
  
  // Get current page from URL params
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const searchQuery = searchParams.get('search') || ''

  const handleSearch = useCallback((query: string) => {
    const results = searchPosts(posts, query)
    const filteredPosts = results.map(result => result.item)
    setSearchResults(filteredPosts)
    setCurrentSearchQuery(query)
    
    // Update URL with search query and reset to page 1
    const params = new URLSearchParams()
    if (query) {
      params.set('search', query)
    }
    router.push(`/?${params.toString()}`)
  }, [posts, router])

  // Initialize search on mount if there's a search query in URL
  useEffect(() => {
    if (searchQuery && searchQuery !== currentSearchQuery) {
      handleSearch(searchQuery)
      setCurrentSearchQuery(searchQuery)
    } else if (!searchQuery && currentSearchQuery) {
      setSearchResults(posts)
      setCurrentSearchQuery('')
    }
  }, [searchQuery, posts, currentSearchQuery, handleSearch])
  // Paginate the current search results
  const paginationResult = paginateArray(searchResults, currentPage, POSTS_PER_PAGE)
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to WPCreative Blog
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A minimalist blog about web development, design, and technology.
          Built with Next.js and markdown for simple content management.
        </p>
      </div>

      {/* Search Bar - Centered */}
      <div className="mb-12">
        <div className="max-w-md mx-auto">
          <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {paginationResult.items.length > 0 ? (
          paginationResult.items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No posts found matching your search.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {searchResults.length > 0 && (
        <Pagination
          currentPage={paginationResult.currentPage}
          totalPages={paginationResult.totalPages}
          basePath="/"
          searchQuery={currentSearchQuery}
        />
      )}

      {/* Results count */}
      {searchResults.length > 0 && (
        <div className="text-center mt-8 mb-12 text-gray-500">
          Showing {paginationResult.items.length} of {paginationResult.totalItems} posts
          {currentSearchQuery && ` for "${currentSearchQuery}"`}
        </div>
      )}

      {/* Browse by Topic - Bottom Section */}
      <div className="border-t border-gray-200 pt-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by Topic</h2>
          <p className="text-gray-600">Explore posts by category</p>
        </div>
        <TagCloud tags={tags} />
      </div>
    </div>
  )
}
