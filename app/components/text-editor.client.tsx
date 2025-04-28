import Quill from 'quill';
import { useEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css';
import { ClientOnly } from 'remix-utils/client-only';
import { YemSpinner } from './yem-spinner.js';

type EditorProperties = {
	readonly setQuill: (quill: Quill) => void;
	readonly placeholder?: string;
};

export const Editor = ({
	setQuill,
	placeholder = 'Escreva aqui o seu comentário',
}: EditorProperties) => {
	// eslint-disable-line react/function-component-definition
	const quillTextBoxReference = useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const quillTextBox = quillTextBoxReference;
		if (quillTextBox.current) {
			const quillInstance = new Quill(quillTextBox.current, {
				modules: {
					toolbar: {
						controls: [
							['bold', 'italic', 'underline', 'strike'],
							[{ align: [] }],

							[{ list: 'ordered' }, { list: 'bullet' }],
							[{ indent: '-1' }, { indent: '+1' }],

							[{ size: ['small', false, 'large', 'huge'] }],
							[{ header: [1, 2, 3, 4, 5, 6, false] }],
							['link', 'image', 'video'],
							[{ color: [] }, { background: [] }],

							['clean'],
						],
					},
				},
				placeholder,
				theme: 'snow',
			});

			setQuill(quillInstance);
		}

		return () => {
			if (quillTextBox.current) {
				quillTextBox.current.innerHTML = '';
			}
		};
	}, [setQuill]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div>
			<ClientOnly fallback={<YemSpinner />}>
				{() => <div id="editor" ref={quillTextBoxReference} />}
			</ClientOnly>
		</div>
	);
};
