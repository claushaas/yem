import {
	useEffect, useRef,
} from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
// Import 'quill/dist/quill.core.css';

type EditorProperties = {
	readonly setQuill: (quill: Quill) => void;
	readonly placeholder?: string;
};

export const Editor = ({setQuill, placeholder = 'Escreva aqui o seu comentário'}: EditorProperties) => { // eslint-disable-line react/function-component-definition
	const quillTextBox = useRef(null);

	useEffect(() => {
		if (quillTextBox.current) {
			const quillInstance = new Quill(quillTextBox.current, {
				placeholder,
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
	}, [setQuill]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div>
			<div ref={quillTextBox} id='editor'/>
		</div>
	);
};
