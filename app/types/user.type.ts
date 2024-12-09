export type TUserRoles = string[];

export type TBasicUser = {
	email: string;
	firstName: string;
	lastName: string;
};

export type TUser = TBasicUser & {
	id: string;
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
	email: string;
	firstName: string;
	lastName: string;
};
