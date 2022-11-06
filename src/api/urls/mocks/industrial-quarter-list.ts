/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	IIndustrialQuarterListGetRequest,
	IIndustrialQuarterListGetResponse,
} from 'src/api';

export default {
	get(
		params: IIndustrialQuarterListGetRequest
	): Promise<IIndustrialQuarterListGetResponse> {
		return new Promise((res) => {
			const total = 100;
			const success = 1;
			res({
				success,
				total,
				items: new Array(params.limit).fill(null).map((el, index) => ({
					id: 1,
					author: 'author name',
					date: 'Fri Nov 04 2022 15:36:26 GMT+0300 (GMT+03:00)',
					area: 123,
					workerCount: 100,
					grade: 1,
				})),
			});
		});
	},
};
