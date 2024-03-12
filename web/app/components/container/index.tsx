import React from 'react';

type ContainerProps = {
	children: React.ReactNode;
};

export const Container = ({children}: ContainerProps) => (
	<div className={`
		@container-normal
	`}>
		{children}
	</div>
);
