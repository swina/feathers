import Koa from 'koa';
import Debug from 'debug';
import { Application as FeathersApplication, Service } from '@feathersjs/feathers';

const debug = Debug('@feathersjs/koa');

export type Application<T = any> = Koa & FeathersApplication<T>;
export { Koa };

export function koa (feathersApp: FeathersApplication): Application<any> {
  const koaApp = new Koa();

  if (!feathersApp) {
    return koaApp as Application<any>;
  }

  if (typeof feathersApp.setup !== 'function') {
    throw new Error('@feathersjs/koa requires a valid Feathers application instance');
  }

  const { listen: koaListen, use: koaUse } = koaApp;

  Object.assign(koaApp, {
    use (location: string|Koa.Middleware, service: Service<any>) {
      if (typeof location === 'string') {
        return feathersApp.use(location, service);
      }

      return koaUse.call(this, location);
    },

    listen (port?: number, ...rest: any[]) {
      const server = koaListen.call(this, port, ...rest);

      this.setup(server);
      debug('Feathers application listening');

      return server;
    }
  } as Application);

  // Copy all non-existing properties (including non-enumerables)
  // that don't already exist on the Koa app
  Object.getOwnPropertyNames(feathersApp).forEach(prop => {
    const feathersProp = Object.getOwnPropertyDescriptor(feathersApp, prop);
    const koaProp = Object.getOwnPropertyDescriptor(koaApp, prop);

    if (koaProp === undefined && feathersProp !== undefined) {
      Object.defineProperty(koaApp, prop, feathersProp);
    }
  });

  return koaApp as Application;
}
