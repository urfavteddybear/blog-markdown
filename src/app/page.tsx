import { getSortedPostsData, getAllTags } from '@/lib/posts'
import PostsClient from './PostsClient'

export default function Home() {
  const allPosts = getSortedPostsData()
  const allTags = getAllTags()

  return <PostsClient posts={allPosts} tags={allTags} />
}
