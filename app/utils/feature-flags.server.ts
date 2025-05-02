import { remember } from '@epic-web/remember'
import { PostHog } from 'posthog-node'

export const posthogClient = remember('feature-flags-client', () => {
	return new PostHog('phc_F1WbwxCyp5a6a8PKfe9caNENHcOaRnDWyXCCYeRkFDT', {
		host: 'https://eu.i.posthog.com',
	})
})
