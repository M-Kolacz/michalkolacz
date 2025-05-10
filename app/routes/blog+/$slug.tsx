import { data, type HeadersFunction, Link } from 'react-router'
import blogPostStyleSheetUrl from '#app/styles/blog-post.css?url'
import { pipeHeaders } from '#app/utils/headers.server.ts'
import { getMdxPage } from '#app/utils/mdx.server.ts'
import { useMDXComponent } from '#app/utils/mdx.tsx'
import { getServerTimeHeader, makeTimings } from '#app/utils/timing.server.ts'
import { type Route } from './+types/$slug'

export const links: Route.LinksFunction = () => {
	return [{ rel: 'stylesheet', href: blogPostStyleSheetUrl }].filter(Boolean)
}

export const loader = async ({ params, request }: Route.LoaderArgs) => {
	const timings = makeTimings('blog post loader')

	const page = await getMdxPage(
		{
			contentDir: 'blog',
			slug: params.slug,
		},
		{ timings, request },
	)

	const headers = {
		'Cache-Control': 'private, max-age=3600',
		'Server-Timing': getServerTimeHeader(timings),
	}

	if (!page) {
		throw data('Page not found', { status: 404, headers })
	}

	return data(
		{
			page,
		},
		{ headers },
	)
}

export const headers: HeadersFunction = pipeHeaders

export default function BlogPost({ loaderData }: Route.ComponentProps) {
	const { page } = loaderData

	const Component = useMDXComponent(page.code)

	return (
		<main className="container mx-auto flex-1 py-12">
			<div className="mx-auto max-w-3xl">
				<Link
					to="/blog"
					className="text-muted-foreground hover:text-primary mb-4 inline-block text-sm font-medium"
				>
					← Back to all posts
				</Link>
				<article id="blog-post">
					<Component />
				</article>
			</div>
		</main>
	)
}
