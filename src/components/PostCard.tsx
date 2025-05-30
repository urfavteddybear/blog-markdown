import Link from 'next/link'
import Image from 'next/image'
import { BlogPostMetadata } from '@/lib/posts'
import { formatDate } from '@/lib/utils'

interface PostCardProps {
  post: BlogPostMetadata
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {post.image && (
        <div className="relative w-full h-48">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-gray-700 transition-colors">
          <Link href={`/posts/${post.id}`}>
            {post.title}
          </Link>
        </h2>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {post.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <time dateTime={post.date}>
            {formatDate(post.date)}
          </time>
          <Link 
            href={`/posts/${post.id}`}
            className="text-black hover:underline font-medium"
          >
            Read more →
          </Link>
        </div>
      </div>
    </article>
  )
}
