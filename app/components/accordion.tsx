import React, {type ForwardedRef} from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Separator from '@radix-ui/react-separator';

type AccordionItemProperties = {
	readonly children: React.ReactNode;
	readonly className?: string; // eslint-disable-line react/require-default-props
	readonly value: string;
};

export const AccordionItem = React.forwardRef(({children, className = '', value, ...properties}: AccordionItemProperties, forwardedReference: ForwardedRef<HTMLDivElement>) => (
	<Accordion.Item
		className={`bg-mauve-4 dark:bg-mauvedark-3 first:rounded-t-xl last:rounded-b-xl pt-3 px-3 last:pb-3	${className}`}
		{...properties}
		ref={forwardedReference}
		value={value}
	>
		{children}
		<Separator.Root
			decorative
			className='bg-mauve-11 dark:bg-mauvedark-11 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-px mt-3'
			orientation='horizontal'/>
	</Accordion.Item>
));
