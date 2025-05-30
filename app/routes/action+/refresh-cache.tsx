import { type PushEvent } from '@octokit/webhooks-types'
import { data } from 'react-router'
import { verifySignature } from '#app/utils/github.server.ts'
import { getBlogMdxListItems, getMdxPage } from '#app/utils/mdx.server.ts'
import { parseRawBody } from '#app/utils/misc.tsx'
import { type Route } from './+types/refresh-cache.tsx'

export async function action({ request }: Route.ActionArgs) {
	const arrayBuffer = await request.arrayBuffer()
	const rawBody = Buffer.from(arrayBuffer)

	verifySignature(request, rawBody)

	const body = parseRawBody<PushEvent>(rawBody)

	if (body.ref !== 'refs/heads/master')
		throw data('Webhook not from master branch', { status: 400 })

	const changedFiles = new Set<string>()

	body.commits.forEach((commit) => {
		commit.modified.forEach((file) => changedFiles.add(file))
	})

	const filteredFiles = [...changedFiles].filter((file) => {
		return file.startsWith('content/blog')
	})

	const keysToInvalidate = filteredFiles.map(
		(file) => file.split('/')[2] as string,
	)

	const cachePromises: Array<Promise<unknown>> = []

	for (const slug of keysToInvalidate) {
		cachePromises.push(
			getMdxPage({ contentDir: 'blog', slug }, { forceFresh: true }),
		)
	}

	if (keysToInvalidate.length !== 0)
		cachePromises.push(getBlogMdxListItems({ request, forceFresh: true }))

	await Promise.all(cachePromises).catch(() => {
		throw new Response('Error occurred while refreshing cache', { status: 500 })
	})

	return data({ invalidatedKeys: keysToInvalidate })
}
