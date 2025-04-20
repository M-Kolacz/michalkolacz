import { useEffect, useState } from 'react'
import meSrc from '#app/assets/me.avif?url'
import { Icon } from '#app/components/ui/icon.tsx'
import { type Route } from './+types/index.ts'

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
				href="https://twitter.com"
				target="_blank"
				rel="noopener noreferrer"
				className="text-gray-600 transition-all hover:scale-105 hover:text-[oklch(42.4%_0.199_265.638)] dark:text-gray-400 dark:hover:text-[oklch(42.4%_0.199_265.638)]"
				aria-label="Twitter"
			>
				<Icon size="lg" name="twitter-logo" />
			</a>
			<a
				href="https://github.com"
				target="_blank"
				rel="noopener noreferrer"
				className="text-gray-600 transition-all hover:scale-105 hover:text-[oklch(42.4%_0.199_265.638)] dark:text-gray-400 dark:hover:text-[oklch(42.4%_0.199_265.638)]"
				aria-label="GitHub"
			>
				<Icon size="lg" name="github-logo" />
			</a>
			<a
				href="https://linkedin.com"
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
				Michal Kolacz
			</h1>
			<p className="text-gray-600 dark:text-gray-300">
				Software engineer who wants to share his knowledge and opinions about
				web development. I have experience in creating products using React,
				Typescript and Node.js. Also I am a big fan of Remix (currently React
				Router v7).
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
						<div className="mt-6">
							<SocialLinks />
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}
