import React from 'react';
import {Link, Outlet} from '@remix-run/react';

export default function Ui() {
	return (
		<div>
			<h1>UI</h1>
			<Link to='/ui/button'>Button</Link>
			<Outlet />
		</div>
	);
}
