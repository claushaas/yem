import {
	type TypeUserCreationAttributes, type TypeMauticUserCreationAttributes, type TypeBasicUser,
} from '../types/User';
import Joi from 'joi';
import CustomError from '../utils/CustomError.js';
import {convertStringToStartCase} from '../utils/convertStringToStartCase.js';

const basicUserSchema = Joi.object({
	email: Joi.string().email().required(),
	firstName: Joi.string().required(),
	lastName: Joi.string().required(),
});

const userSchema = basicUserSchema.keys({
	id: Joi.string().uuid().required(),
	roles: Joi.array().items(Joi.string()),
	phoneNumber: Joi.string().required(),
});

const mauticUserSchema = basicUserSchema;

const userCreationSchema = userSchema.keys({
	id: Joi.string().uuid(),
	password: Joi.string().required().min(6),
	document: Joi.string(),
});

class BasicUser {
	protected readonly _email: string;
	protected readonly _firstName: string;
	protected readonly _lastName: string;

	constructor(user: TypeBasicUser) {
		const {error} = basicUserSchema.validate(user);

		if (error) {
			throw new CustomError('UNPROCESSABLE_ENTITY', `Invalid user data: ${error.message}`);
		}

		this._email = user.email.toLowerCase();
		this._firstName = convertStringToStartCase(user.firstName);
		this._lastName = convertStringToStartCase(user.lastName);
	}

	get email() {
		return this._email;
	}

	get firstName() {
		return this._firstName;
	}

	get lastName() {
		return this._lastName;
	}
}

export class MauticUserForCreation extends BasicUser {
	constructor(user: TypeMauticUserCreationAttributes) {
		super(user);

		const {error} = mauticUserSchema.validate(user);

		if (error) {
			throw new CustomError('UNPROCESSABLE_ENTITY', `Invalid user data: ${error.message}`);
		}
	}
}

export class UserForCreation extends BasicUser {
	protected readonly _id?: string;
	protected readonly _roles?: string[];
	protected readonly _phoneNumber: string;
	protected readonly _document?: string;

	constructor(user: TypeUserCreationAttributes) {
		super(user);

		const {error} = userCreationSchema.validate(user);

		if (error) {
			throw new CustomError('UNPROCESSABLE_ENTITY', `Invalid user data: ${error.message}`);
		}

		this._id = user.id ?? '';
		this._roles = user.roles ?? [];
		this._phoneNumber = user.phoneNumber;
		this._document = user.document ?? '';
	}

	get id() {
		return this._id;
	}

	get roles() {
		return this._roles;
	}

	get phoneNumber() {
		return this._phoneNumber;
	}

	get document() {
		return this._document;
	}
}
