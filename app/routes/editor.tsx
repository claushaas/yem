import {Suspense} from 'react';
import TextEditor from '~/components/text-editor/index.client.js';
import {YemSpinner} from '~/components/yem-spinner/index.js';

export default function Editor() {
	return (
		<Suspense fallback={<YemSpinner/>}>
			<TextEditor/>
		</Suspense>
	);
}
