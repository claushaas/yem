import type Role from '../types/Role';
import {type UserRoles} from '../types/User';

const testUserRoles = (couseRoles: Role[], userRoles: UserRoles) => couseRoles.some(role => userRoles.includes(role.name));

export default testUserRoles;
