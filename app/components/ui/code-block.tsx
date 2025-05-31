import { cloneElement, useRef, useState } from 'react'

export default function CodeBlock({ children, ...preProps }) {
	// This ref will point to the actual <code> DOM node
	const codeRef = useRef(null)
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		if (!codeRef.current) return
		// innerText of <code> includes all lines of code as text
		const textToCopy = codeRef.current.innerText

		try {
			await navigator.clipboard.writeText(textToCopy)
			setCopied(true)
			// Reset “Copied!” after 1.5s
			setTimeout(() => setCopied(false), 1500)
		} catch (err) {
			console.error('Failed to copy text: ', err)
		}
	}

	const {
		props: { children: codeChildren, ...restProps },
	} = children

	return (
		<div className={`group relative ${preProps.className}`}>
			{/* Copy button: absolutely positioned in the top-right */}
			<button
				onClick={handleCopy}
				className="absolute top-2 right-2 z-10 rounded bg-gray-700 px-2 py-1 text-sm text-gray-200 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-600 focus:outline-none"
				aria-label="Copy code to clipboard"
			>
				{copied ? 'Copied!' : 'Copy'}
			</button>

			{/* Re-insert a <pre> around the code. children === <code>…</code>. */}
			<pre {...preProps}>
				{/*
          Clone the <code> element so we can attach our ref.
          We preserve all original props (className, data-…, etc.) and add `ref`.
        */}
				{cloneElement(children, { ref: codeRef })}
			</pre>
		</div>
	)
}
