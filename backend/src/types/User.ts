import {type TypeUuid} from './UUID';

export type UserRoles = string[];
type Email = string;
type FirstName = string;
type LastName = string;

type TypeUser = {
	id: TypeUuid;
	email: Email;
	roles?: UserRoles;
	firstName: FirstName;
	lastName: LastName;
	phoneNumber: string;
};

export type TypeUserCreationAttributes = TypeUser & {document: string};
export type TypeMauticUserCreationAttributes = {
	email: Email;
	firstName: FirstName;
	lastName: LastName;
};

export default TypeUser;
