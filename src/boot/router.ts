import { boot } from 'quasar/wrappers';
import { PageName, authPages } from 'src/router';

export default boot(({ router, store }) => {
	router.beforeEach(async (to, from, next) => {
		const { 'user-session': userSessionStoreState } = store.state.value;

		if (
			userSessionStoreState.isAuthorizationInfoLoaded &&
			!userSessionStoreState.isAuthorized &&
			((to.name && !authPages.includes(to.name)) || !to.name)
		) {
			await router.push({ name: PageName.SingIn });
		}

		if (
			userSessionStoreState.isAuthorizationInfoLoaded &&
			userSessionStoreState.isAuthorized &&
			to.name &&
			authPages.includes(to.name)
		) {
			await router.push({ name: PageName.HomePage });
		}

		next();
	});
});
