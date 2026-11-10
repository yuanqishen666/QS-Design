import test from 'node:test';
import assert from 'node:assert/strict';
import * as qs from '../engine/index.mjs';

test('public API exposes the task, isolation, design, verification, store and platform contracts', () => {
  for (const name of ['createTaskCapsule', 'createCandidate', 'compileContextManifest', 'buildWorkerPayload', 'createBusinessModel', 'createContentContract', 'validateContentContract', 'allowedContentDeliveries', 'createSemanticIntent', 'createDirectionSet', 'createArtDirection', 'createCraftReview', 'createInteractionProbe', 'createApproval', 'verifyBundle', 'createStore', 'getAdapter']) {
    assert.equal(typeof qs[name], 'function', `${name} should be public`);
  }
  assert.deepEqual(Object.keys(qs.adapters).sort(), ['alipay', 'android', 'ios', 'web', 'wechat']);
});
