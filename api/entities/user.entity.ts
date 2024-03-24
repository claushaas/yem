import Joi from 'joi';
import {
	type TUserCreationAttributes, type TMauticUserCreationAttributes, type TBasicUser,
} from '../types/user.type.js';
import {CustomError} from '../utils/custom-error.js';
import {convertStringToStartCase} from '../utils/convert-string-to-start-case.js';
import {logger} from '../utils/logger.js';

const basicUserSchema = Joi.object({
	email: Joi.string().email().required(),
	firstName: Joi.string().required(),
	lastName: Joi.string().required(),
});

const mauticUserSchema = basicUserSchema;

const userCreationSchema = Joi.object({
	phoneNumber: Joi.string().required(),
	email: Joi.string().email().required(),
	firstName: Joi.string().required(),
	lastName: Joi.string().required(),
	roles: Joi.array().items(Joi.string()),
	document: Joi.string(),
});

class BasicUser {
	protected readonly _email: string;
	protected readonly _firstName: string;
	protected readonly _lastName: string;

	constructor(user: TBasicUser) {
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
	constructor(user: TMauticUserCreationAttributes) {
		super(user);

		const {error} = mauticUserSchema.validate(user);

		if (error) {
			throw new CustomError('UNPROCESSABLE_ENTITY', `Invalid user data: ${error.message}`);
		}
	}
}

export class UserForCreation {
	protected readonly _email: string;
	protected readonly _firstName: string;
	protected readonly _lastName: string;
	protected readonly _roles?: string[];
	protected readonly _phoneNumber: string;
	protected readonly _document?: string;

	constructor(user: TUserCreationAttributes) {
		const {error} = userCreationSchema.validate(user);

		if (error) {
			logger.logError(`Error: ${JSON.stringify(error)}`);
			throw new CustomError('UNPROCESSABLE_ENTITY', `Invalid user data: ${error.message}`);
		}

		this._roles = user.roles ?? [];
		this._phoneNumber = user.phoneNumber.replaceAll(/\s+/g, '');
		this._document = user.document ?? '';
		this._email = user.email.toLowerCase();
		this._firstName = convertStringToStartCase(user.firstName);
		this._lastName = convertStringToStartCase(user.lastName);
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
