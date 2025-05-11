import {
	data,
	Link,
	type LoaderFunctionArgs,
	useLoaderData,
} from 'react-router'
import { getBlogMdxListItems } from '#app/utils/mdx.server.ts'

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const posts = await getBlogMdxListItems({
		request,
	})

	return data({ posts })
}

export default function BlogIndex() {
	const { posts } = useLoaderData<typeof loader>()

	return (
		<main className="container mx-auto flex-1 py-12">
			<div className="mx-auto max-w-3xl">
				<h1 className="font-roboto mb-8 text-3xl font-bold">Blog posts</h1>

				<ul className="space-y-6">
					{posts.map((post) => (
						<li key={post.slug}>
							<Link to={`/blog/${post.slug}`} className="group block">
								<div className="flex flex-col space-y-1">
									<h2 className="group-hover:text-primary text-lg font-medium transition-all duration-200 group-hover:translate-y-[-2px]">
										{post.frontmatter.title}
									</h2>
									<p className="text-muted-foreground text-sm">
										{post.dateDisplay}
									</p>
								</div>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</main>
	)
}
