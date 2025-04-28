import { type GithubFile, type MdxPage } from '../types'
import { cachified, cache } from './cache.server'
import { compileMdx } from './compile-mdx.server'
import { downloadDirList, downloadMdxFileOrDirectory } from './github.server'
import { typedBoolean } from './misc'
import { type Timings } from './timing.server'

type CachifiedOptions = {
	forceFresh?: boolean
	request?: Request
	ttl?: number
	timings?: Timings
}

const defaultTTL = 1000 * 60 * 60 * 24 * 14 // 14 days
const defaultStaleWhileRevalidate = 1000 * 60 * 60 * 24 * 365 * 1000 // 1000 years

const checkCompiledValue = (value: unknown) =>
	typeof value === 'object' &&
	(value === null || ('code' in value && 'frontmatter' in value))

const compileMdxCached = async ({
	contentDir,
	files,
	options,
	slug,
}: {
	contentDir: string
	slug: string
	files: Array<GithubFile>
	options: CachifiedOptions
}) => {
	const key = `${contentDir}:${slug}:compiled`
	const page = await cachified({
		cache,
		ttl: defaultTTL,
		staleWhileRevalidate: defaultStaleWhileRevalidate,
		...options,
		key,
		checkValue: checkCompiledValue,
		getFreshValue: async () => {
			const compiledPage = await compileMdx<MdxPage['frontmatter']>(slug, files)

			if (compiledPage) {
				return {
					...compiledPage,
					slug,
				}
			} else {
				return null
			}
		},
	})

	if (!page) {
		void cache.delete(key)
	}
	return page
}

export const downloadMdxFilesCached = async (
	contentDir: string,
	slug: string,
	options: CachifiedOptions,
) => {
	const { forceFresh, ttl = defaultTTL, request, timings } = options
	const key = `${contentDir}:${slug}:downloaded`
	const downloaded = await cachified({
		cache,
		timings,
		forceFresh,
		request,
		ttl,
		staleWhileRevalidate: defaultStaleWhileRevalidate,
		key,
		checkValue: (value: unknown) => {
			if (typeof value !== 'object') return `value is not an object`
			if (value === null) return `value is null`

			const download = value as Record<string, unknown>
			if (!Array.isArray(download.files)) return `value.files is not an array`
			if (typeof download.entry !== 'string')
				return `value.entry is not a string`

			return true
		},
		getFreshValue: async () =>
			downloadMdxFileOrDirectory(`${contentDir}/${slug}`),
	})

	if (!downloaded.files.length) {
		void cache.delete(key)
	}
	return downloaded
}

export const getMdxPagesInDirectory = async (
	contentDir: string,
	options: CachifiedOptions,
) => {
	const dirList = await getMdxDirList(contentDir, options)

	const pageDatas = await Promise.all(
		dirList.map(async ({ slug }) => {
			return {
				slug,
				...(await downloadMdxFilesCached(contentDir, slug, options)),
			}
		}),
	)

	const pages = await Promise.all(
		pageDatas.map((pageData) =>
			compileMdxCached({ contentDir, ...pageData, options }),
		),
	)
	return pages.filter(typedBoolean)
}

const getDirListKey = (contentDir: string) => `${contentDir}:dir-list`
export const getMdxDirList = async (
	contentDir: string,
	options: CachifiedOptions,
) => {
	const { forceFresh, request, ttl = defaultTTL, timings } = options
	const key = getDirListKey(contentDir)
	return cachified({
		cache,
		timings,
		forceFresh,
		request,
		ttl,
		staleWhileRevalidate: defaultStaleWhileRevalidate,
		key,
		checkValue: (value: unknown) => Array.isArray(value),
		getFreshValue: async () => {
			const fullContentDirPath = `content/${contentDir}`
			const dirList = (await downloadDirList(fullContentDirPath))
				.map(({ name, path }) => ({
					name,
					slug: path
						.replace(/\\/g, '/')
						.replace(`${fullContentDirPath}/`, '')
						.replace(/\.mdx$/, ''),
				}))
				.filter(({ name }) => name !== 'README.md')

			return dirList
		},
	})
}

export const getBlogMdxListItems = async (options: CachifiedOptions) => {
	const { forceFresh, request, ttl = defaultTTL, timings } = options
	const key = 'blog:mdx-list-items'
	return cachified({
		cache,
		timings,
		ttl,
		staleWhileRevalidate: defaultStaleWhileRevalidate,
		forceFresh,
		request,
		key,
		getFreshValue: async () => {
			let pages = await getMdxPagesInDirectory('blog', options)
			pages = pages.sort((a, z) => {
				const aTime = new Date(a.frontmatter.date ?? '').getTime()
				const zTime = new Date(z.frontmatter.date ?? '').getTime()
				return aTime > zTime ? -1 : aTime === zTime ? 0 : 1
			})

			return pages.map(({ code, ...rest }) => rest)
		},
	})
}
