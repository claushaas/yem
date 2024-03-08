import type Role from '../types/Role.js';
import {type UserRoles} from '../types/User.js';

const testUserRoles = (couseRoles: Role[], userRoles: UserRoles) => couseRoles.some(role => userRoles.includes(role.name));

export default testUserRoles;
