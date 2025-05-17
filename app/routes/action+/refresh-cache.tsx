import { data } from 'react-router'
import { type Route } from '../+types/me'

export async function action({ request }: Route.ActionArgs) {
	const body = await request.json()

	console.log('Refreshing cache', body)

	return data(body)
}
