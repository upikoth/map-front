import { axiosInstance } from 'src/boot/axios';

export interface IZoneCalcGetRequest {
	geometry?: unknown;
	zuIds?: number[];
	oksIds?: number[];
}

export interface IZoneCalcCommonInfo {
	district: string;
	grade: number;
	hasNewZU: boolean;
	isAffectedBySPR: boolean;
	isAffectedBySZZ: boolean;
	isAffectedByTOKN: boolean;
	oksAccidentRate: number;
	oksArea: number;
	oksAverageAgeYears: number;
	oksCount: number;
	orgCount: number;
	workerCount: number;
	zuArea: number;
	zuCount: number;
}

export interface IZoneCalcGetResponse extends IZoneCalcCommonInfo {
	objects: {
		oks: unknown;
		org: unknown;
		spr: unknown;
		szz: unknown;
		tokn: unknown;
		zu: unknown;
	};
}

export default {
	get(params: IZoneCalcGetRequest): Promise<IZoneCalcGetResponse> {
		return axiosInstance.get('/api/v1/zoneCalc', { params });
	},
};
