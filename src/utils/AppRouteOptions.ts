import {
  FastifyBaseLogger,
  FastifyRequest,
  FastifySchema,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteGenericInterface,
  RouteOptions,
  preHandlerAsyncHookHandler,
} from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { IncomingMessage, ServerResponse } from 'node:http';

export type AppRouteOptions = RouteOptions<
  RawServerDefault,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  RouteGenericInterface,
  unknown,
  FastifySchema,
  ZodTypeProvider,
  FastifyBaseLogger
>;

export type AppPreHandlerAsyncHookHandler = preHandlerAsyncHookHandler<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  RouteGenericInterface,
  unknown,
  any,
  ZodTypeProvider
>;

export type AppRequest = FastifyRequest<
  RouteGenericInterface,
  RawServerDefault,
  IncomingMessage,
  {},
  ZodTypeProvider,
  unknown,
  FastifyBaseLogger
>;
