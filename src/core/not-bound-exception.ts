import { Binding } from '@src/core/types';

export class NotBoundException extends Error {
  constructor(public readonly binding: Binding<any>) {
    super(`${binding.name} is not bound in the container. Did you forget to bind it?`);
  }
}
