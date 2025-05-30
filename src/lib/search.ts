import Fuse from 'fuse.js'
import { BlogPostMetadata } from './posts'

export interface SearchResult {
  item: BlogPostMetadata
  score?: number
}

export function createSearchIndex(posts: BlogPostMetadata[]) {
  const options = {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'description', weight: 0.3 },
      { name: 'tags', weight: 0.3 }
    ],
    threshold: 0.3,
    includeScore: true,
  }

  return new Fuse(posts, options)
}

export function searchPosts(posts: BlogPostMetadata[], query: string): SearchResult[] {
  if (!query.trim()) {
    return posts.map(item => ({ item }))
  }

  const fuse = createSearchIndex(posts)
  const results = fuse.search(query)
  
  return results.map(result => ({
    item: result.item,
    score: result.score
  }))
}
