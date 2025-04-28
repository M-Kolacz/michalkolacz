import remarkEmbedder, { type TransformerInfo } from '@remark-embedder/core'
import { bundleMDX } from 'mdx-bundler'
import PQueue from 'p-queue'
import remarkAutolinkHeadings from 'remark-autolink-headings'
import gfm from 'remark-gfm'
import remarkSlug from 'remark-slug'
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

function handleEmbedderError({ url }: { url: string }) {
	return `<p>Error embedding <a href="${url}">${url}</a></p>.`
}

function makeEmbed(html: string, type: string, heightRatio = '56.25%') {
	return `
  <div class="embed" data-embed-type="${type}">
    <div style="padding-bottom: ${heightRatio}">
      ${html}
    </div>
  </div>
`
}

type GottenHTML = string | null
function handleEmbedderHtml(html: GottenHTML, info: TransformerInfo) {
	if (!html) return null

	const url = new URL(info.url)
	// matches youtu.be and youtube.com
	if (/youtu\.?be/.test(url.hostname)) {
		// this allows us to set youtube embeds to 100% width and the
		// height will be relative to that width with a good aspect ratio
		return makeEmbed(html, 'youtube')
	}
	if (url.hostname.includes('codesandbox.io')) {
		return makeEmbed(html, 'codesandbox', '80%')
	}
	return html
}

// const remarkPlugins: U.PluggableList = [
// 	[
// 		remarkEmbedder,
// 		{
// 			handleError: handleEmbedderError,
// 			handleHTML: handleEmbedderHtml,
// 			// TODO: check how transformers work
// 			transformers: [twitterTransformer, eggheadTransformer, oembedTransformer],
// 		},
// 	],
// ]

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

	try {
		const { frontmatter, code } = await bundleMDX({
			source: indexFile.content,
			files,
			mdxOptions(options) {
				options.remarkPlugins = [
					...(options.remarkPlugins ?? []),
					remarkSlug,
					[remarkAutolinkHeadings, { behavior: 'wrap' }],
					gfm,
					// ...remarkPlugins,
				]
				options.rehypePlugins = [
					...(options.rehypePlugins ?? []),
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
