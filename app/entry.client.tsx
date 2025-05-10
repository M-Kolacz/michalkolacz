import posthog from 'posthog-js'
import { startTransition, useEffect, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

if (ENV.MODE === 'production' && ENV.SENTRY_DSN) {
	void import('./utils/monitoring.client.tsx').then(({ init }) => init())
}

const PosthogInit = () => {
	useEffect(() => {
		posthog.init(ENV.POSTHOG_API_KEY, {
			api_host: '/ingest',
			ui_host: 'https://eu.posthog.com',
			person_profiles: 'always',
		})
	}, [])

	return null
}

startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<HydratedRouter />
			{process.env.NODE_ENV === 'production' && <PosthogInit />}
		</StrictMode>,
	)
})
