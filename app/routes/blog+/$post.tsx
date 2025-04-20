import { Link } from 'react-router'
import { Route } from './+types/$post'
import { invariant } from '@epic-web/invariant'

const blogPosts = [
	{
		id: 1,
		title: 'Getting Started with Next.js and Tailwind CSS',
		slug: 'getting-started-with-nextjs-and-tailwind',
		date: 'April 15, 2025',
		content:
			'This is a placeholder for the blog post content. In a real application, this would be fetched from a CMS or database.',
	},
	{
		id: 2,
		title: 'Building Responsive Layouts with Flexbox and Grid',
		slug: 'building-responsive-layouts',
		date: 'April 10, 2025',
		content:
			'This is a placeholder for the blog post content. In a real application, this would be fetched from a CMS or database.',
	},
	{
		id: 3,
		title: 'The Power of Server Components in Next.js',
		slug: 'power-of-server-components',
		date: 'April 5, 2025',
		content:
			'This is a placeholder for the blog post content. In a real application, this would be fetched from a CMS or database.',
	},
	{
		id: 4,
		title: 'Creating Accessible Web Applications',
		slug: 'creating-accessible-web-applications',
		date: 'March 28, 2025',
		content:
			'This is a placeholder for the blog post content. In a real application, this would be fetched from a CMS or database.',
	},
	{
		id: 5,
		title: 'State Management Patterns in React',
		slug: 'state-management-patterns-in-react',
		date: 'March 20, 2025',
		content:
			'This is a placeholder for the blog post content. In a real application, this would be fetched from a CMS or database.',
	},
	{
		id: 6,
		title: 'Optimizing Performance in Modern Web Apps',
		slug: 'optimizing-performance-in-modern-web-apps',
		date: 'March 15, 2025',
		content:
			'This is a placeholder for the blog post content. In a real application, this would be fetched from a CMS or database.',
	},
]

export default function BlogPost({ params }: Route.ComponentProps) {
	const post = blogPosts.find((post) => post.slug === params.post)

	invariant(post, `Post with slug "${params.post}" not found.`)

	return (
		<main className="container mx-auto flex-1 py-12">
			<div className="mx-auto max-w-3xl">
				<Link
					to="/blog"
					className="text-muted-foreground hover:text-primary mb-4 inline-block text-sm font-medium"
				>
					← Back to all posts
				</Link>

				<article className="prose prose-lg dark:prose-invert max-w-none">
					<h1 className="font-roboto mb-2 text-3xl font-bold">{post.title}</h1>
					<p className="text-muted-foreground mb-8 text-sm">{post.date}</p>
					<p>{post.content}</p>
				</article>
			</div>
		</main>
	)
}
