import { type PushEvent } from '@octokit/webhooks-types'
import { data } from 'react-router'
import { getBlogMdxListItems, getMdxPage } from '#app/utils/mdx.server.ts'
import { type Route } from '../+types/me'

export async function action({ request }: Route.ActionArgs) {
	// TODO: Add secret to verify the weebook sender

	const body = (await request.json()) as PushEvent

	const isMaster = body.ref === 'refs/heads/master'

	if (!isMaster) throw data('Webhook not from master branch', { status: 400 })

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

	for (const slug of keysToInvalidate) {
		await getMdxPage({ contentDir: 'blog', slug }, { forceFresh: true })
	}

	await getBlogMdxListItems({ request, forceFresh: true })

	return data({ filteredFiles, keysToInvalidate })
}
