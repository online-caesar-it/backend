export interface IUser {
	id: number;
	email: string;
	password: string;
	role: string;
}

export type TClientUserUpdate = {
	firstName: string;
	surname: string;
	email: string;
	phone_number: string;
	userId: string;
	telegram: string;
	vkontakte: string;
};
