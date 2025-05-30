# Minimalist Blog with Next.js

A clean, minimalist blog built with Next.js that automatically generates pages from markdown files. Features a black and white design aesthetic similar to Medium, with search functionality and tag-based filtering.

## Features

- **Markdown-based content**: Write posts in markdown format with frontmatter metadata
- **Automatic post generation**: Add markdown files to `/posts` directory and they appear automatically
- **Search functionality**: Real-time search across all blog posts
- **Tag system**: Organize and filter posts by tags
- **Image support**: Display optimized images in posts
- **Responsive design**: Clean, minimalist design that works on all devices
- **Fast performance**: Static generation for lightning-fast loading
- **SEO optimized**: Proper meta tags and structured data

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Remark/Rehype** for markdown processing
- **Fuse.js** for search functionality
- **Lucide React** for icons

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000) to see the blog

## Adding New Blog Posts

Create a new markdown file in the `posts` directory with the following frontmatter structure:

```markdown
---
title: "Your Post Title"
date: "2025-05-30"
description: "A brief description of your post"
tags: ["tag1", "tag2", "tag3"]
image: "/images/your-image.jpg"
---

# Your Post Content

Write your content here using standard markdown syntax...
```

The blog will automatically:
- Generate a new page for your post
- Add it to the homepage listing
- Include it in search results
- Make it filterable by tags

## Project Structure

```
├── posts/                  # Markdown blog posts
├── public/images/          # Static images for posts
├── src/
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   └── lib/              # Utility functions
└── ...
```

## Customization

- **Styling**: Modify `src/app/globals.css` and Tailwind classes
- **Layout**: Update components in `src/components/`
- **Content processing**: Modify functions in `src/lib/posts.ts`
- **Search**: Customize search behavior in `src/lib/search.ts`

## Deploy on Vercel

The easiest way to deploy your blog is to use the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Deploy with one click

Your blog will be live with automatic deployments on every push!
