import {EventDef} from './EventDef';

export type ExtractParamsType<T> = T extends EventDef<infer R> ? R : unknown;
