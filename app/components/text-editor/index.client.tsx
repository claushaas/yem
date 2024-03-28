import {
	Suspense, lazy, useEffect, useRef, useState,
} from 'react';
import type Quill from 'quill';
import {YemSpinner} from '../yem-spinner/index.js';

type EditorProperties = {
	setQuill: (quill: Quill) => void;
};

const Editor = lazy(async () => {
	const {default: Quill} = await import('quill');
	return {
		default: function Default({setQuill}: EditorProperties) { // eslint-disable-line func-name-matching, func-names
			const quillReference = useRef(null);

			useEffect(() => {
				if (quillReference.current) {
					const quillInstance = new Quill(quillReference.current, {
						debug: 'info',
						modules: {
							toolbar: true,
						},
						placeholder: 'Compose an epic...',
						theme: 'snow',
					});

					setQuill(quillInstance);
				}
			}, [setQuill]);

			return <div ref={quillReference}/>;
		},
	};
});

export default function TextEditor() {
	const [quill, setQuill] = useState<Quill | null>(null); // eslint-disable-line @typescript-eslint/ban-types
	return (
		<Suspense fallback={<YemSpinner/>}>
			<Editor setQuill={setQuill}/>
		</Suspense>
	);
}
