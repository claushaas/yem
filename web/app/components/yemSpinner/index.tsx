import React from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import YemReducerLogo from '~/assets/logo/logo-reduzido2-lilas.svg?react';

export const YemSpinner = () => (
	<AnimatePresence>
		<motion.div
			initial={{opacity: 0}}
			animate={{
				opacity: 1,
			}}
			exit={{opacity: 0}}
		>
			<motion.div
				animate={{
					opacity: 1,
					rotate: 360,
					transition: {
						duration: 3,
						repeat: Infinity,
						ease: 'linear',
					},
				}}
			>
				<YemReducerLogo className='size-5 m-auto my-3' />
			</motion.div>
		</motion.div>

	</AnimatePresence>
);
