import { LRUCache } from 'lru-cache'
import * as mdxBundler from 'mdx-bundler/client/index.js'
import { useMemo } from 'react'
import CodeBlock from '#app/components/ui/code-block.tsx'

const mdxComponents = {
	pre: CodeBlock,
}

const getMdxComponent = (code: string) => {
	const Component = mdxBundler.getMDXComponent(code)
	const MdxComponent = ({
		components,
		...rest
	}: Parameters<typeof Component>['0']) => {
		return (
			<Component components={{ ...mdxComponents, ...components }} {...rest} />
		)
	}
	return MdxComponent
}

const mdxComponentCache = new LRUCache<
	string,
	ReturnType<typeof getMdxComponent>
>({ max: 1000 })

export const useMDXComponent = (code: string) => {
	return useMemo(() => {
		if (mdxComponentCache.has(code)) {
			return mdxComponentCache.get(code)!
		}
		const component = getMdxComponent(code)
		mdxComponentCache.set(code, component)
		return component
	}, [code])
}
