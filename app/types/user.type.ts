import {type TUuid} from './uuid.type.js';

export type TUserRoles = string[];
type TEmail = string;
type TFirstName = string;
type TLastName = string;

export type TBasicUser = {
	email: TEmail;
	firstName: TFirstName;
	lastName: TLastName;
};

export type TUser = TBasicUser & {
	id: TUuid;
	roles?: TUserRoles;
	phoneNumber: string;
	document?: string;
};

export type TUserCreationAttributes = TBasicUser & {
	document?: string;
	roles?: TUserRoles;
	phoneNumber: string;
};

export type TMauticUserCreationAttributes = {
	email: TEmail;
	firstname: TFirstName;
	lastname: TLastName;
};
