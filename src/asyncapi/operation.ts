import type { DeepPartial, IHttpOperation } from '@stoplight/types';
import { isBoolean, isPlainObject, isString, pickBy } from 'lodash';

import { getExtensions } from '../oas/accessors';
import { createContext } from '../oas/context';
import { translateToTags } from '../oas/tags';
import { Fragment, TransformerContext, TranslateFunction } from '../types';
import { AsyncApiDocument, ChannelItemObject, OperationObject } from './asyncApiDocument';
import { AsyncApiHttpOperationTransformer } from './types';

export function transformAsyncApiOperations(
  document: DeepPartial<AsyncApiDocument>,
  ctx?: TransformerContext<DeepPartial<AsyncApiDocument>>,
): IHttpOperation[] {
  const documentChannels = document.channels ?? {};
  const channels = isPlainObject(documentChannels) ? Object.keys(documentChannels) : [];

  return channels.flatMap(path => {
    const value = document.channels?.[path];
    if (!isPlainObject(value)) return [];

    const operations = ['publish', 'subscribe'].filter(method => value?.[method]);

    return operations.map(method =>
      transformAsyncApiOperation({
        document,
        path,
        method,
        ctx,
      }),
    );
  });
}

export const transformAsyncApiOperation: AsyncApiHttpOperationTransformer = ({
  document: _document,
  path,
  method,
  ctx = createContext(_document),
}) => {
  const httpOperation = transformAsyncApiOperationBase.call(ctx, path, method);
  const pathObj = ctx.maybeResolveLocalRef(ctx.document.channels![path]) as Fragment;
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const operation = ctx.maybeResolveLocalRef(pathObj[method]) as Fragment;

  return {
    ...httpOperation,

    responses: [],
    request: undefined,
    security: undefined,
    servers: [],
  } as unknown as IHttpOperation;
};

export const transformAsyncApiOperationBase: TranslateFunction<
  DeepPartial<AsyncApiDocument>,
  [path: string, method: string],
  Omit<IHttpOperation, 'responses' | 'request' | 'servers' | 'security' | 'callbacks'>
> = function (path: string, method: string) {
  const pathObj = this.maybeResolveLocalRef(this.document?.channels?.[path]) as ChannelItemObject;
  if (typeof pathObj !== 'object' || pathObj === null) {
    throw new Error(`Could not find ${['channels', path].join('/')} in the provided spec.`);
  }

  const operation = this.maybeResolveLocalRef(pathObj[method]) as OperationObject;
  if (!operation) {
    throw new Error(`Could not find ${['channels', path, method].join('/')} in the provided spec.`);
  }

  const serviceId = (this.ids.service = String((this.document['x-stoplight'] as any)?.id));
  this.ids.path = this.generateId.httpPath({ parentId: serviceId, path });
  const operationId = (this.ids.operation = this.generateId.httpOperation({ parentId: serviceId, method, path }));

  this.context = 'operation';

  return {
    id: operationId,

    method,
    path,

    tags: translateToTags.call(this, operation.tags),
    extensions: getExtensions(operation),

    ...pickBy(
      {
        deprecated: (operation as any).deprecated,
        internal: operation['x-internal'],
      },
      isBoolean,
    ),

    ...pickBy(
      {
        iid: operation.operationId,
        description: operation.description,
        summary: operation.summary,
      },
      isString,
    ),
  };
};
