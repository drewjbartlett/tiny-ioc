/* eslint-disable @typescript-eslint/ban-types */
import { createContainer } from '@src/core/container';

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

export type Binding<T> = Function & {
  prototype: T;
};

export type Container = ReturnType<typeof createContainer>;

export type FactoryFunction<T> = (container: Container) => T;

export enum Scope {
  Factory = 'Factory',
  Singleton = 'Singleton',
}
