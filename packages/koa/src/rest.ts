import { FeathersKoaContext } from './index';

export const methodMap: { [key: string]: any } = {
  POST: 'create',
  PATCH: 'patch',
  PUT: 'update',
  DELETE: 'remove'
};

export const getMethod = (httpMethod: string, id: any)=> {
  if (httpMethod === 'GET') {
    return id === null ? 'find' : 'get';
  }

  return methodMap[httpMethod];
};

export const rest = () => async (ctx: FeathersKoaContext, next: () => Promise<any>) => {
  const { app, request } = ctx;
  const { query, path, method: httpMethod } = request;
  const lookup = app.lookup(path);

  if (lookup !== null) {
    const { service, params: lookupParams = {} } = lookup;
    const { __id = null, ...route } = lookupParams;
    const method = getMethod(httpMethod, __id);
    const args = [];

    // id
    if (method !== 'create' && method !== 'find') {
      args.push(__id);
    }

    // data
    if (method === 'create' || method === 'update' || method === 'patch') {
      args.push(request.body);
    }

    // params
    args.push({
      ...ctx.feathers,
      query,
      route
    });

    const result = await service[method](...args);

    ctx.response.status = method === 'create' ? 201 : 200;
    ctx.body = result;
  }

  return next();
};
