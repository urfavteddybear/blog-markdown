import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'

const postsDirectory = path.join(process.cwd(), 'posts')

export interface BlogPost {
  id: string
  title: string
  date: string
  description: string
  tags: string[]
  image?: string
  contentHtml: string
}

export interface BlogPostMetadata {
  id: string
  title: string
  date: string
  description: string
  tags: string[]
  image?: string
}

export function getSortedPostsData(): BlogPostMetadata[] {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map((fileName) => {
      // Remove ".md" from file name to get id
      const id = fileName.replace(/\.md$/, '')

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents)

      // Combine the data with the id
      return {
        id,
        title: matterResult.data.title || '',
        date: matterResult.data.date || '',
        description: matterResult.data.description || '',
        tags: matterResult.data.tags || [],
        image: matterResult.data.image || '',
      }
    })

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map((fileName) => {
      return {
        params: {
          id: fileName.replace(/\.md$/, ''),
        },
      }
    })
}

export async function getPostData(id: string): Promise<BlogPost> {
  const fullPath = path.join(postsDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(matterResult.content)

  const contentHtml = processedContent.toString()

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    title: matterResult.data.title || '',
    date: matterResult.data.date || '',
    description: matterResult.data.description || '',
    tags: matterResult.data.tags || [],
    image: matterResult.data.image || '',
  }
}

export function getAllTags(): string[] {
  const posts = getSortedPostsData()
  const tags = new Set<string>()
  
  posts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag))
  })
  
  return Array.from(tags).sort()
}

export function getPostsByTag(tag: string): BlogPostMetadata[] {
  const posts = getSortedPostsData()
  return posts.filter(post => post.tags.includes(tag))
}
