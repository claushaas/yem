import {type TypeUuid} from './UUID';

export type UserRoles = string[];

type TypeUser = {
	id: TypeUuid;
	email: string;
	roles?: UserRoles;
	firstName: string;
	lastName: string;
	phoneNumber: string;
};

export type TypeUserCreationAttributes = TypeUser & {document: string};

export default TypeUser;
