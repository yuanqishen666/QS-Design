import web from './web/index.mjs';
import ios from './ios/index.mjs';
import android from './android/index.mjs';
import wechat from './wechat/index.mjs';
import alipay from './alipay/index.mjs';

export const adapters = Object.freeze({ web, ios, android, wechat, alipay });
export const getAdapter = id => adapters[id] ?? null;
