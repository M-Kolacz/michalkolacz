export type GithubFile = { path: string; content: string }

export type MdxPage = {
	code: string
	slug: string
	frontmatter: {
		title?: string
		date?: string
		description?: string
	}
}
