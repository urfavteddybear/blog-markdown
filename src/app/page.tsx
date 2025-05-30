import { Suspense } from 'react'
import { getSortedPostsData, getAllTags } from '@/lib/posts'
import PostsClient from './PostsClient'

function PostsClientWrapper() {
  const allPosts = getSortedPostsData()
  const allTags = getAllTags()

  return <PostsClient posts={allPosts} tags={allTags} />
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <PostsClientWrapper />
    </Suspense>
  )
}
