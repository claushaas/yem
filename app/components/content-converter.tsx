/* eslint-disable @typescript-eslint/naming-convention */
import { type OpIterator } from 'quill/core';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';

export function ContentConverter({
	content,
	className,
}: {
	readonly content: string;
	readonly className?: string;
}) {
	const { ops } = JSON.parse(content) as OpIterator;
	const contentConverter = new QuillDeltaToHtmlConverter(ops, {
		multiLineParagraph: false,
	});

	return (
		// eslint-disable-next-line react/no-danger
		<div
			className={className}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
			dangerouslySetInnerHTML={{ __html: contentConverter.convert() }}
		/>
	);
}
