import {
  type RawReplyDefaultExpression,
  type RawRequestDefaultExpression,
  type RawServerDefault,
  type RouteGenericInterface,
  type preHandlerAsyncHookHandler,
} from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';

export type AppPreHandlerAsyncHookHandler = preHandlerAsyncHookHandler<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  RouteGenericInterface,
  unknown,
  any,
  ZodTypeProvider
>;
