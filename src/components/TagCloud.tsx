import Link from 'next/link'

interface TagCloudProps {
  tags: string[]
  selectedTag?: string
}

export default function TagCloud({ tags, selectedTag }: TagCloudProps) {
  if (tags.length === 0) return null

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className={`inline-block px-3 py-1 text-sm rounded-full transition-colors ${
            !selectedTag
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Posts
        </Link>
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className={`inline-block px-3 py-1 text-sm rounded-full transition-colors ${
              selectedTag === tag
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  )
}
