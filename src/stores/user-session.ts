import { defineStore } from 'pinia';
import api, { IUserSessionPostRequest } from 'src/api';

export const useUserSessionStore = defineStore('user-session', {
	state: () => ({
		isAuthorized: false,
		isAuthorizationInfoLoaded: false,
	}),
	actions: {
		async login(data: IUserSessionPostRequest) {
			try {
				await api.userSession.put(data);
				this.isAuthorized = true;
			} catch (error) {
				this.isAuthorized = false;

				throw error;
			} finally {
				this.isAuthorizationInfoLoaded = true;
			}
		},
		async logout() {
			try {
				await api.userSession.delete();
				this.isAuthorized = false;
			} catch (error) {
				throw error;
			}
		},
		async checkAuth() {
			try {
				await api.userSession.get();
				this.isAuthorized = true;
			} catch {
				this.isAuthorized = false;
			} finally {
				this.isAuthorizationInfoLoaded = true;
			}
		},
	},
});
