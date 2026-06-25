import {describe, expect, it} from '@jest/globals';
import {
  createOperationController,
} from '../src/screens/network/operationController';

describe('createOperationController', () => {
  it('invalidates the previous token when an operation restarts', () => {
    const controller = createOperationController();
    const firstToken = controller.start('upload');
    const secondToken = controller.start('upload');

    expect(controller.isCurrent('upload', firstToken)).toBe(false);
    expect(controller.isCurrent('upload', secondToken)).toBe(true);
  });

  it('tracks operation keys independently', () => {
    const controller = createOperationController();
    const requestToken = controller.start('request');
    const graphToken = controller.start('graph');

    controller.cancel('request');

    expect(controller.isCurrent('request', requestToken)).toBe(false);
    expect(controller.isCurrent('graph', graphToken)).toBe(true);
  });

  it('cancels every tracked operation on unmount cleanup', () => {
    const controller = createOperationController();
    const uploadToken = controller.start('upload');
    const downloadToken = controller.start('download');
    const heartbeatToken = controller.start('heartbeat');

    controller.cancelAll(['upload', 'download', 'heartbeat']);

    expect(controller.isCurrent('upload', uploadToken)).toBe(false);
    expect(controller.isCurrent('download', downloadToken)).toBe(false);
    expect(controller.isCurrent('heartbeat', heartbeatToken)).toBe(false);
  });
});
