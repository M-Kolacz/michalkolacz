import { bundleMDX } from 'mdx-bundler'
import PQueue from 'p-queue'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import gfm from 'remark-gfm'
import type * as U from 'unified'
import { type GithubFile } from '#app/types'

const arrayToObj = <ItemType extends Record<string, unknown>>(
	array: Array<ItemType>,
	{
		keyName,
		valueName,
	}: {
		keyName: keyof ItemType
		valueName: keyof ItemType
	},
) => {
	const obj: Record<string, ItemType[keyof ItemType]> = {}
	for (const item of array) {
		const key = item[keyName]
		if (typeof key !== 'string') {
			throw new Error(`Key ${String(keyName)} is not a string`)
		}
		const value = item[valueName]
		obj[key] = value
	}
	return obj
}

const rehypePlugins: U.PluggableList = []

const compileMdx = async <FrontmatterType extends Record<string, unknown>>(
	slug: string,
	githubFiles: Array<GithubFile>,
) => {
	const indexRegex = new RegExp(`${slug}\\/index.mdx?$`)
	const indexFile = githubFiles.find(({ path }) => indexRegex.test(path))
	if (!indexFile) return null

	const rootDir = indexFile.path.replace(/index.mdx?$/, '')
	const relativeFiles: Array<GithubFile> = githubFiles.map(
		({ path, content }) => ({
			path: path.replace(rootDir, './'),
			content,
		}),
	)
	const files = arrayToObj(relativeFiles, {
		keyName: 'path',
		valueName: 'content',
	})
	rehypePrettyCode({})

	try {
		const { code, frontmatter } = await bundleMDX({
			source: indexFile.content,
			files,

			mdxOptions(options) {
				options.remarkPlugins = [...(options.remarkPlugins ?? []), gfm]
				options.rehypePlugins = [
					...(options.rehypePlugins ?? []),
					rehypeSlug,
					[rehypeAutolinkHeadings, { behavior: 'wrap' }],
					[
						rehypePrettyCode,
						{
							theme: { dark: 'night-owl', light: 'github-light' },
							onVisitLine: (node: any) => {
								if (node.children.length === 0) {
									node.children = [{ type: 'text', value: ' ' }]
								}
							},
						},
					],
					...rehypePlugins,
				]
				return options
			},
		})

		return {
			code,
			frontmatter: frontmatter as FrontmatterType,
		}
	} catch (error: unknown) {
		console.error(`Compilation error for slug: `, slug)
		throw error
	}
}

let _queue: PQueue | null = null
const getQueue = async () => {
	if (_queue) return _queue

	_queue = new PQueue({
		concurrency: 1,
		throwOnTimeout: true,
		timeout: 1000 * 30, // 30 seconds
	})

	return _queue
}

async function queuedCompileMdx<
	FrontmatterType extends Record<string, unknown>,
>(...args: Parameters<typeof compileMdx>) {
	const queue = await getQueue()
	const result = await queue.add(() => compileMdx<FrontmatterType>(...args))
	return result
}

export { queuedCompileMdx as compileMdx }
