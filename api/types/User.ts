import {type TypeUuid} from './UUID.js';

export type UserRoles = string[];
type Email = string;
type FirstName = string;
type LastName = string;

export type TypeBasicUser = {
	email: Email;
	firstName: FirstName;
	lastName: LastName;
};

export type TypeUser = TypeBasicUser & {
	id: TypeUuid;
	roles?: UserRoles;
	phoneNumber: string;
};

export type TypeUserCreationAttributes = TypeBasicUser & {
	document?: string;
	roles?: UserRoles;
	phoneNumber: string;
};

export type TypeMauticUserCreationAttributes = TypeBasicUser;
