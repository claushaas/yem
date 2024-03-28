import {
	useEffect, useRef, useState,
} from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.core.css';

type EditorProperties = {
	readonly setQuill: (quill: Quill) => void;
};

const Editor = ({setQuill}: EditorProperties) => { // eslint-disable-line react/function-component-definition
	const quillTextBox = useRef(null);

	useEffect(() => {
		if (quillTextBox.current) {
			const quillInstance = new Quill(quillTextBox.current, {
				// Debug: 'info',
				placeholder: 'Compose an epic...',
				modules: {
					toolbar: {
						controls: [
							['bold', 'italic', 'underline', 'strike'],
							[{align: []}],

							[{list: 'ordered'}, {list: 'bullet'}],
							[{indent: '-1'}, {indent: '+1'}],

							[{size: ['small', false, 'large', 'huge']}],
							[{header: [1, 2, 3, 4, 5, 6, false]}],
							['link', 'image', 'video'],
							[{color: []}, {background: []}],

							['clean'],
						],
					},
				},
				theme: 'snow',
			});

			setQuill(quillInstance);
		}
	}, [setQuill]);

	return (
		<div>
			<div ref={quillTextBox} id='editor'/>
		</div>
	);
};

export default function TextEditor() {
	const [quill, setQuill] = useState<Quill | null>(null); // eslint-disable-line @typescript-eslint/ban-types

	useEffect(() => {
		if (quill) {
			quill.on('text-change', () => {
				console.log('text-change', quill.getSemanticHTML());
			});
		}
	}, [quill]);

	if (!document) {
		return null;
	}

	return (
		<Editor setQuill={setQuill}/>
	);
}
