import { UserRole } from 'src/api';

export const userRoleOptions = [
	{
		label: 'Пользователь',
		value: UserRole.User,
	},
	{
		label: 'Администратор',
		value: UserRole.Admin,
	},
	{
		label: 'СуперАдмин',
		value: UserRole.SuperAdmin,
	},
];

export const userRoleLabelByRole = {
	[UserRole.User]: 'Пользователь',
	[UserRole.Admin]: 'Администратор',
	[UserRole.SuperAdmin]: 'СуперАдмин',
};
