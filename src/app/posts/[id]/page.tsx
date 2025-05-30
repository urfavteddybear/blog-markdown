import { getAllPostIds, getPostData } from '@/lib/posts'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateStaticParams() {
  const paths = getAllPostIds()
  return paths.map(({ params }) => ({
    id: params.id,
  }))
}

export default async function Post({ params }: PageProps) {
  const { id } = await params
  const postData = await getPostData(id)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center text-gray-600 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to all posts
      </Link>

      {/* Post header */}
      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {postData.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {postData.title}
        </h1>
        
        <p className="text-xl text-gray-600 mb-4">
          {postData.description}
        </p>
        
        <time className="text-gray-500" dateTime={postData.date}>
          {formatDate(postData.date)}
        </time>
      </header>

      {/* Featured image */}
      {postData.image && (
        <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
          <Image
            src={postData.image}
            alt={postData.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
          />
        </div>
      )}

      {/* Post content */}
      <article 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
      />

      {/* Navigation */}
      <div className="border-t border-gray-200 mt-12 pt-8">
        <Link
          href="/"
          className="inline-flex items-center text-black hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to all posts
        </Link>
      </div>
    </div>
  )
}
