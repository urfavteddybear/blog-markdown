import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center text-gray-600 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to home
      </Link>

      {/* About content */}
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          About This Blog
        </h1>

        <div className="text-xl text-gray-600 leading-relaxed space-y-6">
          <p>
            Welcome to my blog! This site is built with modern web technologies 
            and follows a clean, readable design philosophy inspired by platforms like Medium.
          </p>

          <p>
            This blog focuses on web development, DevOps practices, Linux system administration, 
            and self-hosting solutions. Whether you&apos;re setting up a home server, managing a VPS, 
            or diving into modern web technologies, you&apos;ll find practical tutorials and insights here.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Technology Stack</h2>
          
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Next.js 15:</strong> React framework with App Router</li>
            <li><strong>TypeScript:</strong> Type-safe development</li>
            <li><strong>Tailwind CSS:</strong> Utility-first CSS framework</li>
            <li><strong>Markdown Processing:</strong> Remark and Rehype for content processing</li>
            <li><strong>Search:</strong> Fuse.js for fuzzy search functionality</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
