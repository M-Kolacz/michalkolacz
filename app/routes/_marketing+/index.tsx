import { useEffect, useState } from 'react'
import meSrc from '#app/assets/me.avif?url'
import { Icon } from '#app/components/ui/icon.tsx'
import { type Route } from './+types/index.ts'
import { Button } from '#app/components/ui/button.tsx'
import { Link } from 'react-router'

export const meta: Route.MetaFunction = () => [{ title: 'Epic Notes' }]

export function Avatar() {
	const [loaded, setLoaded] = useState(false)

	useEffect(() => {
		setLoaded(true)
	}, [])

	return (
		<div
			className={`relative overflow-hidden rounded-full bg-blue-50 p-2 transition-opacity duration-500 dark:bg-blue-900/20 ${loaded ? 'opacity-100' : 'opacity-0'}`}
			style={{ width: '180px', height: '180px' }}
		>
			<img
				src={meSrc}
				alt="Profile Avatar"
				className="h-[180px] w-[180px] rounded-full object-cover"
			/>
		</div>
	)
}

export function SocialLinks() {
	return (
		<div className="flex space-x-4">
			<a
				href="https://x.com/M_Kolacz"
				target="_blank"
				rel="noopener noreferrer"
				className="text-gray-600 transition-all hover:scale-105 hover:text-[oklch(42.4%_0.199_265.638)] dark:text-gray-400 dark:hover:text-[oklch(42.4%_0.199_265.638)]"
				aria-label="Twitter"
			>
				<Icon size="lg" name="twitter-logo" />
			</a>
			<a
				href="https://github.com/M-Kolacz"
				target="_blank"
				rel="noopener noreferrer"
				className="text-gray-600 transition-all hover:scale-105 hover:text-[oklch(42.4%_0.199_265.638)] dark:text-gray-400 dark:hover:text-[oklch(42.4%_0.199_265.638)]"
				aria-label="GitHub"
			>
				<Icon size="lg" name="github-logo" />
			</a>
			<a
				href="https://www.linkedin.com/in/m-kolacz"
				target="_blank"
				rel="noopener noreferrer"
				className="text-gray-600 transition-all hover:scale-105 hover:text-[oklch(42.4%_0.199_265.638)] dark:text-gray-400 dark:hover:text-[oklch(42.4%_0.199_265.638)]"
				aria-label="LinkedIn"
			>
				<Icon size="lg" name="linkedin-logo" />
			</a>
		</div>
	)
}

export function Description() {
	const [loaded, setLoaded] = useState(false)

	useEffect(() => {
		setLoaded(true)
	}, [])

	return (
		<div
			className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
		>
			<h1 className="mb-2 text-2xl font-medium text-gray-900 dark:text-white">
				Hi 👋 I'm Michal Kolacz.
			</h1>
			<p className="text-gray-600 dark:text-gray-300">
				Web developer from Krakow, Poland. I work at{' '}
				<a href="https://www.schibsted.pl/">Schibsted Tech Polska</a> as a
				Software Engineer.
			</p>
		</div>
	)
}

export default function Index() {
	return (
		<main className="font-poppins grid h-full place-items-center">
			<div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-lg transition-colors duration-300 dark:bg-gray-800">
				<div className="flex flex-col items-center md:flex-row">
					{/* Avatar Section */}
					<div className="animate-fade-in-left flex w-full items-center justify-center p-8 md:w-2/5">
						<Avatar />
					</div>

					{/* Divider - visible only on md screens and up */}
					<div className="hidden h-64 w-px bg-gray-200 md:block dark:bg-gray-700"></div>

					{/* Description Section */}
					<div className="animate-fade-in-right w-full p-8 md:w-3/5">
						<Description />
						<div className="mt-6 flex items-center justify-between">
							<SocialLinks />
							<Button asChild variant={'default'}>
								<Link to={'/blog'}>Check my blog</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}
