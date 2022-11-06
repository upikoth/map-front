import { defineStore } from 'pinia';
import api, { IUserGetResponse, UserRole } from 'src/api';

export const useUserStore = defineStore('user', {
	state: () => ({
		user: {
			id: '',
			role: UserRole.User,
			email: '',
			firstName: '',
			secondName: '',
		} as IUserGetResponse,
		isUserInitialLoaded: false,
	}),
	actions: {
		async getUser(): Promise<void> {
			try {
				const user = await api.user.get();
				this.user = user;
			} catch (error) {
				throw error;
			} finally {
				this.isUserInitialLoaded = true;
			}
		},
	},
	getters: {
		isUser: (state) => state.user.role === UserRole.User,
		isAdmin: (state) => state.user.role === UserRole.Admin,
		isSuperAdmin: (state) => state.user.role === UserRole.SuperAdmin,
		isAdminOrGreater: (state) =>
			[UserRole.Admin, UserRole.SuperAdmin].includes(state.user.role),
	},
});
