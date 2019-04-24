import { strict as assert } from 'assert';
import feathers, { Application } from '@feathersjs/feathers';
import { koa } from '../src';

describe('@feathersjs/koa', () => {
  it('throws an error when initialized with invalid application', () => {
    try {
      koa({} as Application);
      assert.fail('Should never get here');
    } catch (error) {
      assert.equal(error.message, '@feathersjs/koa requires a valid Feathers application instance');
    }
  });

  it('initializes as a Koa and Feathers application', async () => {
    const app = koa(feathers());
    let isSetup = false;

    app.use('/myservice', {
      async get (id: string) {
        return { id };
      },

      setup() {
        isSetup = true;
      }
    });

    app.use(ctx => {
      ctx.body = {
        message: 'Hello from middleware'
      };
    });

    await new Promise(resolve => {
      app.listen(7865).once('listening', () => resolve());
    });

    assert.ok(isSetup);
  });
});
