import { boot } from 'quasar/wrappers';
import axios from 'axios';

import { PageName } from 'src/router';
import { ICommonResponse, ICommonSuccessResponse, ErrorCode } from 'src/api';

const checkSuccessResponse = (
	response: ICommonResponse
): response is ICommonSuccessResponse => {
	return response.success === 1;
};

const axiosInstance = axios.create({
	timeout: 60000,
});

export default boot(({ router }) => {
	axiosInstance.interceptors.request.use(function (config) {
		if (config.data instanceof FormData) {
			config.headers = {
				'Content-Type': 'multipart/form-data',
				Accept: 'application/json',
			};
			return config;
		} else if (config.data) {
			config.data = {
				data: {
					...config.data,
				},
			};
		}
		return config;
	});

	axiosInstance.interceptors.response.use(
		(res) => {
			const response = res.data as ICommonResponse;
			if (response instanceof Blob) {
				return Promise.resolve({ blob: response });
			}

			if (checkSuccessResponse(response)) {
				return Promise.resolve(response.data);
			} else {
				if (response.error.code === ErrorCode.NotAuthorized) {
					router.push({ name: PageName.SingIn });
				}
				return Promise.reject(response.error);
			}
		},
		() => {
			return Promise.reject({
				code: ErrorCode.Unknown,
			});
		}
	);
});

export { axiosInstance };
