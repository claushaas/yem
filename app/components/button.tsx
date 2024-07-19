import {type LegacyRef, forwardRef} from 'react';
import {motion} from 'framer-motion';

export enum ButtonPreset {
	Primary = 'primary',
	Secondary = 'secondary',
}

export enum ButtonType {
	Button = 'button',
	Submit = 'submit',
	Reset = 'reset',
}

type ButtonProperties = {
	readonly className?: string;
	readonly text?: string;
	readonly isDisabled?: boolean;
	readonly preset?: ButtonPreset;
	readonly type?: ButtonType;
	readonly onClick?: () => void; // eslint-disable-line react/require-default-props
};

const baseButtonClasses = `
	px-4
	py-2.5
	rounded-lg
	shadow-sm
	transition-colors
	duration-200
	ease-in-out
	focus:outline-none
	focus:ring-2
	focus:ring-opacity-50
	disabled:bg-gray-5
	disabled:dark:bg-graydark-5
	disabled:cursor-not-allowed
	disabled:hover:bg-gray-5
	disabled:hover:dark:bg-graydark-5
	disabled:active:bg-gray-5
	disabled:active:dark:bg-graydark-5
	disabled:text-gray-7
	disabled:dark:text-graydark-7
	disabled:shadow-none
`;

const classNames = (preset: ButtonPreset) => {
	switch (preset) {
		case ButtonPreset.Primary: {
			return baseButtonClasses + `
				bg-purple-9
				dark:bg-purpledark-9
				text-whitea-11
				hover:bg-purple-10
				hover:dark:bg-purpledark-10
				active:bg-purple-12
				active:dark:bg-purpledark-12
				focus:ring-purple-9
				shadow-purple-12
			`;
		}

		case ButtonPreset.Secondary: {
			return baseButtonClasses + `
				bg-purple-3
				dark:bg-purpledark-3
				text-blacka-7
				dark:text-whitea-7
				hover:bg-purple-4
				hover:dark:bg-purpledark-4
				active:bg-purple-5
				active:dark:bg-purpledark-5
				focus:ring-purple-3
			`;
		}
	}
};

const noop = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function

export const Button = forwardRef(({
	className,
	isDisabled: disabled = false,
	preset = ButtonPreset.Primary,
	text = 'Clicar Aqui',
	type = ButtonType.Button,
	onClick = noop,
}: ButtonProperties, forwardedReference: LegacyRef<HTMLButtonElement>) => (
	<motion.button
		ref={forwardedReference}
		whileHover={{
			scale: 1.05,
			transition: {
				duration: 0.5,
			},
		}}
		className={classNames(preset) + (className ? ` ${className}` : '')}
		disabled={disabled}
		type={type ?? ButtonType.Button}
		onClick={onClick}
	>
		<span className='font-gothamBold leading-none drop-shadow-sm'>{text}</span>
	</motion.button>
));

Button.defaultProps = {
	className: ButtonPreset.Primary,
	isDisabled: false,
	preset: ButtonPreset.Primary,
	text: 'Clicar Aqui',
	type: ButtonType.Button,
};
