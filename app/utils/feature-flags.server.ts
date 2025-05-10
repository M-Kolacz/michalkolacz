import { remember } from '@epic-web/remember'
import { PostHog } from 'posthog-node'

export const posthogClient = remember('feature-flags-client', () => {
	return new PostHog(process.env.POSTHOG_API_KEY, {
		host: 'https://eu.i.posthog.com',
	})
})
