import {
	data,
	Link,
	type LoaderFunctionArgs,
	useLoaderData,
} from 'react-router'
import { getBlogMdxListItems } from '#app/utils/mdx.server.ts'

const blogPosts = [
	{
		id: 1,
		title: 'Getting Started with Next.js and Tailwind CSS',
		slug: 'getting-started-with-nextjs-and-tailwind',
		date: 'April 15, 2025',
	},
	{
		id: 2,
		title: 'Building Responsive Layouts with Flexbox and Grid',
		slug: 'building-responsive-layouts',
		date: 'April 10, 2025',
	},
	{
		id: 3,
		title: 'The Power of Server Components in Next.js',
		slug: 'power-of-server-components',
		date: 'April 5, 2025',
	},
	{
		id: 4,
		title: 'Creating Accessible Web Applications',
		slug: 'creating-accessible-web-applications',
		date: 'March 28, 2025',
	},
	{
		id: 5,
		title: 'State Management Patterns in React',
		slug: 'state-management-patterns-in-react',
		date: 'March 20, 2025',
	},
	{
		id: 6,
		title: 'Optimizing Performance in Modern Web Apps',
		slug: 'optimizing-performance-in-modern-web-apps',
		date: 'March 15, 2025',
	},
]

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const posts = blogPosts
	const myBlogPosts = await getBlogMdxListItems({ request })

	return data({ posts })
}

export default function BlogIndex() {
	const { posts } = useLoaderData<typeof loader>()

	return (
		<main className="container mx-auto flex-1 py-12">
			<div className="mx-auto max-w-3xl">
				<h1 className="font-roboto mb-8 text-3xl font-bold">Blog</h1>

				<ul className="space-y-6">
					{posts.map((post) => (
						<li key={post.id}>
							<Link to={`/blog/${post.slug}`} className="group block">
								<div className="flex flex-col space-y-1">
									<h2 className="group-hover:text-primary text-lg font-medium transition-all duration-200 group-hover:translate-y-[-2px]">
										{post.title}
									</h2>
									<p className="text-muted-foreground text-sm">{post.date}</p>
								</div>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</main>
	)
}
