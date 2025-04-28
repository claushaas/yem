/* eslint-disable @typescript-eslint/ban-types */
import type Quill from 'quill';
import { type Delta } from 'quill/core';
import { useEffect, useState } from 'react';

export const useTextEditor = (
	initialContent?: string | null,
): [string, React.Dispatch<React.SetStateAction<Quill | null>>] => {
	const [quill, setQuill] = useState<Quill | null>(null);
	const [content, setContent] = useState<string>(initialContent ?? '');

	useEffect(() => {
		if (quill) {
			quill.on('text-change', () => {
				setContent(JSON.stringify(quill.getContents()));
			});
		}
	}, [quill]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (initialContent && quill) {
			quill.setContents(JSON.parse(initialContent) as Delta);
		}
	}, [quill]);

	return [content, setQuill];
};
