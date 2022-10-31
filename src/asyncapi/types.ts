import { DeepPartial, IBundledHttpService } from '@stoplight/types';

import {
  HttpOperationTransformer,
  HttpServiceTransformer,
  ITransformOperationOpts,
  ITransformServiceOpts,
  TranslateFunction,
} from '../types';
import { AsyncApiDocument } from './asyncApiDocument';

export type AsyncApiTranslateFunction<P extends unknown[], R extends unknown = unknown> = TranslateFunction<
  DeepPartial<AsyncApiDocument>,
  P,
  R
>;

type HttpServiceBundle<T> = (opts: T) => IBundledHttpService;

/**
 * Service
 */
export type AsyncApiTransformServiceOpts = ITransformServiceOpts<DeepPartial<AsyncApiDocument>>;
export type AsyncApiHttpServiceTransformer = HttpServiceTransformer<AsyncApiTransformServiceOpts>;
export type AsyncApiHttpServiceBundle = HttpServiceBundle<AsyncApiTransformServiceOpts>;

/**
 * Operation
 */
export type AsyncApiTransformOperationOpts = ITransformOperationOpts<DeepPartial<AsyncApiDocument>>;
export type AsyncApiHttpOperationTransformer = HttpOperationTransformer<AsyncApiTransformOperationOpts>;
