import { NotBoundException } from '@src/core/not-bound-exception';
import { Binding, FactoryFunction, Scope } from '@src/core/types';

/**
 * Create a container instance.
 */
export function createContainer() {
  const bindingConfigs = new Map<Binding<any>, { value: FactoryFunction<any>; scope: Scope }>();
  const resolveBindings = new Map<Binding<any>, any>();

  /**
   * Bind a value with a given scope.
   */
  function bind<T>(binding: Binding<T>, value: FactoryFunction<T>, scope: Scope): void {
    bindingConfigs.set(binding, { scope, value });
  }

  /**
   * Create a singleton in the container. After the first resolve, this returns the same value each time.
   */
  function bindSingleton<T>(binding: Binding<T>, factory: FactoryFunction<T>) {
    bind(binding, factory, Scope.Singleton);
  }

  /**
   * Bind a value to a factory. This will call the function every time and not store
   * the value in memory as a singleton.
   */
  function bindFactory<T>(binding: Binding<T>, factory: FactoryFunction<T>) {
    bind(binding, factory, Scope.Factory);
  }

  function bindOnce<T>(binding: Binding<T>, value: FactoryFunction<T>, scope: Scope): void {
    if (bound(binding)) {
      return;
    }

    bind(binding, value, scope);
  }

  /**
   * Reset a singleton value. If a value has been previously resolved and is
   * registered as a singleton, this will keep the binding but reset the singleton value
   * until the next resolve.
   */
  function resetSingleton<T>(binding: Binding<T>) {
    if (resolveBindings.has(binding)) {
      resolveBindings.delete(binding);
    }
  }

  /**
   * Determine if a function is bound or not.
   */
  function bound<T>(binding: Binding<T>): boolean {
    return bindingConfigs.has(binding);
  }

  /**
   * Remove the given binding from the container entirely.
   */
  function unbind<T>(binding: Binding<T>) {
    if (bound(binding)) {
      bindingConfigs.delete(binding);
      resolveBindings.delete(binding);
    }
  }

  /**
   * Swap the old binding's value with the new value.
   * This is useful for testing.
   */
  function swap<T>(oldBinding: Binding<T>, newBinding: FactoryFunction<T>) {
    if (!bound(oldBinding)) {
      throw new NotBoundException(oldBinding);
    }

    const bindingConfig = bindingConfigs.get(oldBinding)!;

    unbind(oldBinding);
    bind(oldBinding, newBinding, bindingConfig.scope);
  }

  /**
   * Attempt to resolve a given binding. Will throw if there is no binding found.
   */
  function get<T>(binding: Binding<T>): T {
    if (!bindingConfigs.has(binding)) {
      throw new NotBoundException(binding);
    }

    const bindingConfig = bindingConfigs.get(binding)!;
    const resolvedBinding = resolveBindings.get(binding);

    if (resolvedBinding) {
      return resolvedBinding;
    }

    if (bindingConfig.scope === Scope.Factory) {
      return bindingConfig.value(container);
    }

    const resolved = bindingConfig.value(container);

    resolveBindings.set(binding, resolved);

    return resolved;
  }

  const container = {
    bind,
    bindOnce,
    bindFactory,
    bindSingleton,
    resetSingleton,
    unbind,
    get,
    swap,
    bound,
  };

  return container;
}
