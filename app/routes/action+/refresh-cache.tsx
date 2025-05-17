import { data } from 'react-router'
import { type Route } from '../+types/me'

export async function action({ request }: Route.ActionArgs) {
	if (request.body) {
		console.log('Request body:', request.body)
	}
	console.log('Refreshing cache')

	return data('Hi')
}
