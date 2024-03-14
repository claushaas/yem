import React from 'react';

export enum ButtonPreset {
	Primary = 'primary',
	Secondary = 'secondary',
}

export enum ButtonType {
	Button = 'button',
	Submit = 'submit',
	Reset = 'reset',
}

type ButtonProps = {
	className?: string;
	text?: string;
	disabled?: boolean;
	preset?: ButtonPreset;
	type?: ButtonType;
};

const baseButtonClasses = `
	px-4
	py-1
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
		case ButtonPreset.Primary:
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
		case ButtonPreset.Secondary:
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
};

export const Button = ({
	className,
	disabled = false,
	preset = ButtonPreset.Primary,
	text = 'Clicar Aqui',
	type = ButtonType.Button,
}: ButtonProps) => (
	<button
		className={classNames(preset) + (className ? ` ${className}` : '')}
		disabled={disabled}
		type={type}
	>
		{text}
	</button>
);
