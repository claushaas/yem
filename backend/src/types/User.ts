export type UserRoles = string[];

type User = {
	id: string;
	email: string;
	roles: UserRoles;
	firstName: string;
	lastName: string;
	phoneNumber: string;
};

export default User;
