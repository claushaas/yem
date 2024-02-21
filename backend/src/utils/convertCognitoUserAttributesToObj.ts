import {type TypeCognitoUserAttributes} from '../types/CognitoUserAttributes';

const convertCognitoUserAttributesToObj = (attributes: TypeCognitoUserAttributes) => attributes.reduce<Record<string, string>>((acc, {Name, Value}) => {
	acc[Name] = Value;
	return acc;
}, {});

export default convertCognitoUserAttributesToObj;

