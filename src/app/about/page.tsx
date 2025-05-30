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
            Welcome to my minimalist blog! This site is built with modern web technologies 
            and follows a clean, readable design philosophy inspired by platforms like Medium.
          </p>

          <p>
            The blog is powered by <strong>Next.js</strong> and uses markdown files for content management, 
            making it easy to write and publish new posts. Simply add a markdown file to the posts 
            directory, and it will automatically appear on the site.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Features</h2>
          
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Markdown Support:</strong> Write posts in markdown format with frontmatter metadata</li>
            <li><strong>Search Functionality:</strong> Find posts quickly using the search bar</li>
            <li><strong>Tag System:</strong> Organize and filter posts by tags</li>
            <li><strong>Image Support:</strong> Display images with automatic optimization</li>
            <li><strong>Responsive Design:</strong> Looks great on all devices</li>
            <li><strong>Fast Performance:</strong> Static generation for lightning-fast loading</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Technology Stack</h2>
          
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Next.js 15:</strong> React framework with App Router</li>
            <li><strong>TypeScript:</strong> Type-safe development</li>
            <li><strong>Tailwind CSS:</strong> Utility-first CSS framework</li>
            <li><strong>Markdown Processing:</strong> Remark and Rehype for content processing</li>
            <li><strong>Search:</strong> Fuse.js for fuzzy search functionality</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How to Add New Posts</h2>
          
          <p>
            Creating a new blog post is simple. Just add a new markdown file to the <code>posts</code> directory 
            with the following frontmatter structure:
          </p>

          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`---
title: "Your Post Title"
date: "2025-05-30"
description: "A brief description of your post"
tags: ["tag1", "tag2", "tag3"]
image: "/images/your-image.jpg"
---

# Your Post Content

Write your content here using markdown syntax...`}
          </pre>

          <p>
            The blog will automatically detect the new file and make it available on the site. 
            No database configuration or complex setup required!
          </p>
        </div>
      </div>
    </div>
  )
}
