import posthog from 'posthog-js'
import { startTransition, useEffect, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

if (ENV.MODE === 'production' && ENV.SENTRY_DSN) {
	void import('./utils/monitoring.client.tsx').then(({ init }) => init())
}

const PosthogInit = () => {
	useEffect(() => {
		posthog.init('phc_F1WbwxCyp5a6a8PKfe9caNENHcOaRnDWyXCCYeRkFDT', {
			api_host: 'https://eu.i.posthog.com',
			person_profiles: 'always',
			// or 'always' to create profiles for anonymous users as well
		})
	}, [])

	return null
}

startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<HydratedRouter />
			<PosthogInit />
		</StrictMode>,
	)
})
