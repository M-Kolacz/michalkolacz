import { createHmac, timingSafeEqual } from 'crypto'
import { type PushEvent } from '@octokit/webhooks-types'
import { data } from 'react-router'
import { getBlogMdxListItems, getMdxPage } from '#app/utils/mdx.server.ts'
import { type Route } from '../+types/me'

export async function action({ request }: Route.ActionArgs) {
	const arrayBuffer = await request.arrayBuffer()
	const rawBody = Buffer.from(arrayBuffer)

	const signature = request.headers.get('x-hub-signature-256') ?? ''

	const secret = process.env.GITHUB_WEBHOOK_SECRET

	const expectedSignature = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`

	const signatureBuffer = Buffer.from(signature, 'utf8')
	const expectedSignatureBuffer = Buffer.from(expectedSignature, 'utf8')

	if (
		signatureBuffer.length !== expectedSignatureBuffer.length ||
		!timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
	)
		throw new Response('Invalid signature', { status: 401 })

	let body: PushEvent
	try {
		body = JSON.parse(rawBody.toString()) as PushEvent
	} catch (error) {
		console.error('Error parsing JSON:', error)
		throw new Response('Invalid JSON', { status: 400 })
	}

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
