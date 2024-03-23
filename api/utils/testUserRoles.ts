import {type TRole} from '../types/Role.js';
import {type TUserRoles} from '../types/User.js';

const testUserRoles = (couseRoles: TRole[], userRoles: TUserRoles) => couseRoles.some(role => userRoles.includes(role.name));

export default testUserRoles;
