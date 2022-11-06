import { RouteRecordRaw, RouteRecordName } from 'vue-router';

export enum PageName {
	SingIn = 'SIGN_IN',
	SignUp = 'SIGN_UP',
	HomePage = 'HOME_PAGE',
	UserList = 'USER_LIST',
	User = 'USER',
	UserCreate = 'USER_CREATE',
	UserEdit = 'USER_EDIT',
	IndustrialQuarter = 'INDUSTRIAL_QUARTER',
	IndustrialQuarterEdit = 'INDUSTRIAL_QUARTER_EDIT',
}

export const authPages: RouteRecordName[] = [PageName.SignUp, PageName.SingIn];

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		children: [
			{
				path: '',
				component: () => import('layouts/AuthorizedMainLayout.vue'),
				redirect: () => ({ name: PageName.HomePage }),
				children: [
					{
						path: 'home',
						name: PageName.HomePage,
						component: () => import('pages/HomePage.vue'),
					},
					{
						path: 'user-list',
						name: PageName.UserList,
						component: () => import('src/pages/user/UserListPage.vue'),
					},
					{
						path: 'user',
						name: PageName.User,
						component: () => import('src/pages/user/UserPage.vue'),
					},
					{
						path: 'user/create',
						name: PageName.UserCreate,
						component: () => import('src/pages/user/UserCreatePage.vue'),
					},
					{
						path: 'user/edit/:id',
						name: PageName.UserEdit,
						component: () => import('src/pages/user/UserEditPage.vue'),
					},
					{
						path: 'industrial-quarter-list',
						name: PageName.IndustrialQuarter,
						component: () =>
							import(
								'src/pages/industrial-quarter/IndustrialQuarterListPage.vue'
							),
					},
					{
						path: 'industrial-quarter/edit/:id',
						name: PageName.IndustrialQuarterEdit,
						component: () =>
							import(
								'src/pages/industrial-quarter/IndustrialQuarterEditPage.vue'
							),
					},
				],
			},
			{
				path: 'auth',
				component: () => import('layouts/UnauthorizedLayout.vue'),
				children: [
					{
						path: 'sign-in',
						name: PageName.SingIn,
						component: () => import('pages/auth/SignInPage.vue'),
					},
					{
						path: 'sign-up',
						name: PageName.SignUp,
						component: () => import('pages/auth/SignUpPage.vue'),
					},
				],
			},
		],
	},
	{
		path: '/:catchAll(.*)*',
		component: () => import('pages/NotFountPage.vue'),
	},
];

export default routes;
