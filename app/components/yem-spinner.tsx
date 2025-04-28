import { AnimatePresence, motion } from 'motion/react';
import YemReducerLogo from '~/assets/logo/logo-reduzido2-lilas.svg?react';

export function YemSpinner() {
	return (
		<AnimatePresence>
			<motion.div
				animate={{
					opacity: 1,
				}}
				exit={{ opacity: 0 }}
				initial={{ opacity: 0 }}
			>
				<motion.div
					animate={{
						opacity: 1,
						rotate: 360,
						transition: {
							duration: 3,
							ease: 'linear',
							repeat: Number.POSITIVE_INFINITY,
						},
					}}
				>
					<YemReducerLogo className="size-5 m-auto my-3" />
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
