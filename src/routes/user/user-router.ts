import { entities } from '../../enums/entities/entities';
import { get, put } from '..';
import { FastifyInstance } from 'fastify';
import { userHandlers } from '../../handlers/user/user-handler';
import { authMiddleWare } from '../../middleware/auth';

export const userRouter = (routers: FastifyInstance) => {
	const path = `/${entities.USER}`;
	const routes = {
		getSelf: () =>
			get({
				path: `${path}/getSelf`,
				handler: userHandlers.getSelfHandler,
				routers,
				options: { preHandler: authMiddleWare.jwtCheck },
			}),
		getAll: () =>
			get({
				path: `${path}/getAll`,
				handler: userHandlers.getAllHandler,
				routers,
			}),
		edit: () =>
			put({
				path: `${path}/update`,
				handler: userHandlers.updateUserHandler,
				routers,
			}),
	};

	return {
		...routes,
		init: () => {
			Object.values(routes).forEach(route => route());
		},
	};
};
