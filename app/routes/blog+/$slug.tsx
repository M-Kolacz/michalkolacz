import { data, type HeadersFunction, Link } from 'react-router'
import { posthogClient } from '#app/utils/feature-flags.server'
import { pipeHeaders } from '#app/utils/headers.server.ts'
import { getMdxPage } from '#app/utils/mdx.server.ts'
import { useMDXComponent } from '#app/utils/mdx.tsx'
import { getServerTimeHeader, makeTimings } from '#app/utils/timing.server.ts'
import { type Route } from './+types/$slug'

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

	const isEnabled =
		(await posthogClient.isFeatureEnabled(
			'first-feature-flag',
			'distinct-id',
		)) || false

	return data(
		{
			page,
			isEnabled,
		},
		{ headers },
	)
}

export const headers: HeadersFunction = pipeHeaders

export default function BlogPost({ loaderData }: Route.ComponentProps) {
	const { page, isEnabled } = loaderData

	console.log({ isEnabled })

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

				<Component />
			</div>
		</main>
	)
}
