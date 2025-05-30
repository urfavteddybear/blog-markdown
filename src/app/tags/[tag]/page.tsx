import { getAllTags, getPostsByTag } from '@/lib/posts'
import PostCard from '@/components/PostCard'
import TagCloud from '@/components/TagCloud'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{
    tag: string
  }>
}

export async function generateStaticParams() {
  const tags = getAllTags()
  return tags.map((tag) => ({
    tag: encodeURIComponent(tag),
  }))
}

export default async function TagPage({ params }: PageProps) {
  const { tag: tagParam } = await params
  const tag = decodeURIComponent(tagParam)
  const posts = getPostsByTag(tag)
  const allTags = getAllTags()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center text-gray-600 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        All posts
      </Link>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Posts tagged with <span className="text-black">#{tag}</span>
        </h1>
        <p className="text-xl text-gray-600">
          {posts.length} post{posts.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Tag cloud */}
      <div className="mb-12">
        <TagCloud tags={allTags} selectedTag={tag} />
      </div>

      {/* Posts grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts found with this tag.</p>
          <Link
            href="/"
            className="text-black hover:underline font-medium mt-4 inline-block"
          >
            Browse all posts →
          </Link>
        </div>
      )}
    </div>
  )
}
