/* eslint-disable @typescript-eslint/no-unused-vars */
import { IUserListGetRequest, UserRole, IUserListGetResponse } from 'src/api';

export default {
	get(params: IUserListGetRequest): Promise<IUserListGetResponse> {
		return new Promise((res) => {
			const total = 100;
			res({
				total,
				items: new Array(params.limit).fill(null).map((el, index) => ({
					id: index.toString(),
					email: 'ikpolux@mail.ru',
					role: UserRole.SuperAdmin,
					firstName: 'Иван',
					secondName: 'Дёмин',
					patronymic: 'Николаевич',
				})),
			});
		});
	},
};
