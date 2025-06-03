import {
	cloneElement,
	type ComponentProps,
	isValidElement,
	type ReactElement,
	useRef,
	useState,
} from 'react'

import { Button } from '#app/components/ui/button'

export default function CodeBlock({
	children,
	...preProps
}: ComponentProps<'pre'>) {
	const codeRef = useRef<HTMLPreElement>(null)
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		if (!codeRef.current) return

		const textToCopy = codeRef.current.innerText
		try {
			await navigator.clipboard.writeText(textToCopy)
			setCopied(true)
			setTimeout(() => setCopied(false), 1500)
		} catch (err) {
			console.error('Failed to copy text: ', err)
		}
	}

	if (!children) return null

	return (
		<div className={`group relative ${preProps.className}`}>
			<Button
				variant={'secondary'}
				onClick={handleCopy}
				className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
				aria-label="Copy code to clipboard"
			>
				{copied ? 'Copied!' : 'Copy'}
			</Button>

			<pre {...preProps}>
				{isValidElement(children)
					? cloneElement(children as ReactElement<any>, {
							ref: codeRef,
							className: 'py-6',
						})
					: children}
			</pre>
		</div>
	)
}
