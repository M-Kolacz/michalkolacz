import nodePath from 'path'
import { throttling } from '@octokit/plugin-throttling'
import { Octokit as createOctokit } from '@octokit/rest'
import { type GithubFile } from '#app/types'

// TODO: add github ref to .env file
const ref = process.env.GITHUB_REF ?? 'master'

const safePath = (s: string) => s.replace(/\\/g, '/')

const Octokit = createOctokit.plugin(throttling)

const octokit = new Octokit({
	// TODO: add github token to .env file
	auth: process.env.BOT_GITHUB_TOKEN,
	throttle: {
		onRateLimit: (retryAfter, options) => {
			const method = 'method' in options ? options.method : 'unknown'
			const url = 'url' in options ? options.url : 'unknown'
			console.warn(
				`Request quota exhausted for request ${method} ${url}. Retrying after ${retryAfter} seconds.`,
			)

			return true
		},
		onSecondaryRateLimit: (_retryAfter, options) => {
			const method = 'method' in options ? options.method : 'METHOD_UNKNOWN'
			const url = 'url' in options ? options.url : 'URL_UNKNOWN'
			// does not retry, only logs a warning
			octokit.log.warn(`Abuse detected for request ${method} ${url}`)
		},
	},
})

export const downloadFileBySha = async (sha: string) => {
	const { data } = await octokit.git.getBlob({
		owner: 'M-Kolacz',
		repo: 'michalkolacz',
		file_sha: sha,
	})

	const encoding = data.encoding as Parameters<typeof Buffer.from>[1]
	return Buffer.from(data.content, encoding).toString()
}

export const downloadFirstMdxFile = async (
	list: Array<{ name: string; type: string; path: string; sha: string }>,
) => {
	const filesOnly = list.filter(({ type }) => type === 'file')
	for (const extension of ['.mdx', '.md']) {
		const file = filesOnly.find(({ name }) => name.endsWith(extension))
		if (file) return downloadFileBySha(file.sha)
	}
	return null
}

const downloadDirectory = async (dir: string): Promise<Array<GithubFile>> => {
	const dirList = await downloadDirList(dir)

	const result = await Promise.all(
		dirList.map(async ({ path: fileDir, type, sha }) => {
			switch (type) {
				case 'file': {
					const content = await downloadFileBySha(sha)
					return { path: safePath(fileDir), content }
				}
				case 'dir': {
					return downloadDirectory(fileDir)
				}
				default: {
					throw new Error(`Unexpected repo file type: ${type}`)
				}
			}
		}),
	)

	return result.flat()
}

export const downloadMdxFileOrDirectory = async (
	relativeMdxFileOrDirectory: string,
): Promise<{ entry: string; files: Array<GithubFile> }> => {
	const mdxFileOrDirectory = `content/${relativeMdxFileOrDirectory}`

	const parentDir = nodePath.dirname(mdxFileOrDirectory)
	const dirList = await downloadDirList(parentDir)

	const basename = nodePath.basename(mdxFileOrDirectory)
	const mdxFileWithoutExtension = nodePath.parse(mdxFileOrDirectory).name
	const potentials = dirList.filter(({ name }) => name.startsWith(basename))
	const exactMatch = potentials.find(
		({ name }) => nodePath.parse(name).name === mdxFileWithoutExtension,
	)
	const dirPotential = potentials.find(({ type }) => type === 'dir')

	const content = await downloadFirstMdxFile(
		exactMatch ? [exactMatch] : potentials,
	)
	let files: Array<GithubFile> = []
	let entry = mdxFileOrDirectory

	if (content) {
		entry = mdxFileOrDirectory.endsWith('.mdx')
			? mdxFileOrDirectory
			: `${mdxFileOrDirectory}.mdx`

		files = [
			{
				path: safePath(nodePath.join(mdxFileOrDirectory, 'index.mdx')),
				content,
			},
		]
	} else if (dirPotential) {
		entry = dirPotential.path
		files = await downloadDirectory(mdxFileOrDirectory)
	}

	return { entry, files }
}

export const downloadDirList = async (path: string) => {
	const repository = await octokit.repos.getContent({
		owner: 'M-Kolacz',
		repo: 'michalkolacz',
		path,
		ref,
	})
	const data = repository.data

	if (!Array.isArray(data)) {
		throw new Error(
			`Tried to download content from ${path}. GitHub did not return an array of files. This should never happen...`,
		)
	}

	return data
}
