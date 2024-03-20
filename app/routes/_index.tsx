import type {MetaFunction} from '@remix-run/node';
import React from 'react';
import {Image} from '@unpic/react';
import {buildImgSrc} from '~/utils/buildImgSrc';

export const meta: MetaFunction = () => [
	{title: 'Yoga em Movimento'},
	{name: 'description', content: 'Seja muito bem-vindo à Yoga em Movimento!'},
];

const Index = () => (
	<>
		<div className='flex max-w-[90%] mx-auto py-12 items-start gap-14 justify-center'>
			<div className='sm:max-w-[50%]'>
				<h1 className='text-3xl xs:text-5xl xl:text-7xl text-left mb-4 text-purple-12 dark:text-purpledark-12'>
					Transforme sua vida com a prática do Yoga, onde quer que esteja.
				</h1>
				<h2 className='text-xl xs:text-2xl md:text-3xl lg:text-4xl text-purple-11 dark:text-purpledark-11'>
					Bem-vindo ao Yoga em Movimento.
				</h2>
			</div>
			<div>
				<Image
					className='max-sm:hidden'
					src={buildImgSrc('0bccd83e-9399-4753-5093-468094deed00')}
					cdn='cloudflare_images'
					layout='constrained'
					width={400}
					height={400}
					alt='Mulher praticando Yoga'
				/>
			</div>
		</div>
	</>
);

export default Index;
