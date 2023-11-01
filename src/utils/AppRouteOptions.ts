import {
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteGenericInterface,
  preHandlerAsyncHookHandler,
} from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export type AppPreHandlerAsyncHookHandler = preHandlerAsyncHookHandler<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  RouteGenericInterface,
  unknown,
  any,
  ZodTypeProvider
>;
