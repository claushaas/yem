import type Quill from 'quill';
import {useEffect, useState} from 'react';
import {ClientOnly} from 'remix-utils/client-only';
import {Editor} from '~/components/text-editor/index.client.js';
import {YemSpinner} from '~/components/yem-spinner/index.js';

export default function TextEditor() {
	const [quill, setQuill] = useState<Quill | null>(null); // eslint-disable-line @typescript-eslint/ban-types

	useEffect(() => {
		if (quill) {
			quill.on('text-change', () => {
				console.log('text-change', quill.getSemanticHTML());
			});
		}
	}, [quill]);

	return (
		<ClientOnly fallback={<YemSpinner/>}>
			{() => <Editor setQuill={setQuill}/>}
		</ClientOnly>
	);
}
