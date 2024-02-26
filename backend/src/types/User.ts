export type UserRoles = string[];

type TypeUser = {
	id: string;
	email: string;
	roles: UserRoles;
	firstName: string;
	lastName: string;
	phoneNumber: string;
};

export default TypeUser;
