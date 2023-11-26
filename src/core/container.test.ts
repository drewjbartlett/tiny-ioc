import { createContainer } from './container';
import { NotBoundException } from './not-bound-exception';
import { Scope } from './types';

class DataSource {
  constructor(public readonly httpClient: HttpClient) {}
}

class HttpClient {
  constructor(public readonly config: { baseURL: string }) {}
}

class SomeFactoryClass {
  constructor(public readonly id: number) {}
}

describe('container', () => {
  let container: ReturnType<typeof createContainer>;

  beforeEach(() => {
    container = createContainer();
  });

  describe('bind', () => {
    it('should bind a dependency in the container for a factory and return a new instance each time', () => {
      let count = 0;

      container.bind(
        SomeFactoryClass,
        () => {
          count++;

          return new SomeFactoryClass(count);
        },
        Scope.Factory,
      );

      expect(container.get(SomeFactoryClass).id).toBe(1);
      expect(container.get(SomeFactoryClass).id).toBe(2);
      expect(container.get(SomeFactoryClass).id).toBe(3);
      expect(container.get(SomeFactoryClass).id).toBe(4);
    });

    it('should bind a dependency in the container for a singleton and resolve the same singleton each time', () => {
      let count = 0;

      container.bind(
        SomeFactoryClass,
        () => {
          count++;

          return new SomeFactoryClass(count);
        },
        Scope.Singleton,
      );

      expect(container.get(SomeFactoryClass).id).toBe(1);
      expect(container.get(SomeFactoryClass).id).toBe(1);
      expect(container.get(SomeFactoryClass).id).toBe(1);
      expect(container.get(SomeFactoryClass).id).toBe(1);
    });

    it('should bind a dependency with external dependencies also in the container for Singletons', () => {
      container.bind(DataSource, () => new DataSource(container.get(HttpClient)), Scope.Singleton);
      container.bind(HttpClient, () => new HttpClient({ baseURL: 'someBaseURL' }), Scope.Singleton);

      const dataSource = container.get(DataSource);

      expect(dataSource.httpClient.config.baseURL).toBe('someBaseURL');
    });

    it('should bind a dependency with external dependencies also in the container for Factory', () => {
      container.bind(DataSource, () => new DataSource(container.get(HttpClient)), Scope.Factory);
      container.bind(HttpClient, () => new HttpClient({ baseURL: 'someBaseURL' }), Scope.Factory);

      const dataSource = container.get(DataSource);

      expect(dataSource.httpClient.config.baseURL).toBe('someBaseURL');
    });
  });

  describe('bindOnce', () => {
    it('should not bind a dependency when one is already bound', () => {
      container.bindOnce(HttpClient, () => new HttpClient({ baseURL: 'baseURL 1' }), Scope.Singleton);
      container.bindOnce(HttpClient, () => new HttpClient({ baseURL: 'baseURL 2' }), Scope.Singleton);

      expect(container.get(HttpClient).config.baseURL).toEqual('baseURL 1');
    });
  });

  describe('bindFactory', () => {
    it('should bind a factory dependency in the container', () => {
      let count = 0;

      container.bindFactory(SomeFactoryClass, () => {
        count++;

        return new SomeFactoryClass(count);
      });

      expect(container.get(SomeFactoryClass).id).toBe(1);
      expect(container.get(SomeFactoryClass).id).toBe(2);
    });
  });

  describe('bindSingleton', () => {
    it('should bind a singleton dependency in the container', () => {
      let count = 0;

      container.bindSingleton(SomeFactoryClass, () => {
        count++;

        return new SomeFactoryClass(count);
      });

      expect(container.get(SomeFactoryClass).id).toBe(1);
      expect(container.get(SomeFactoryClass).id).toBe(1);
    });
  });

  describe('get', () => {
    it('should resolve a dependency from the container', () => {
      container.bind(HttpClient, () => new HttpClient({ baseURL: 'baseURL 1' }), Scope.Singleton);

      expect(container.get(HttpClient)).toBeInstanceOf(HttpClient);
      expect(container.get(HttpClient).config.baseURL).toEqual('baseURL 1');
    });

    it('should throw when there is no binding', () => {
      expect(() => container.get(HttpClient)).toThrow(NotBoundException);
    });
  });

  describe('unbind', () => {
    it('should unbind a dependency from the container', () => {
      container.bindOnce(HttpClient, () => new HttpClient({ baseURL: 'baseURL 1' }), Scope.Singleton);

      expect(container.get(HttpClient).config.baseURL).toEqual('baseURL 1');
      expect(container.bound(HttpClient)).toBe(true);

      container.unbind(HttpClient);

      expect(() => {
        container.get(HttpClient);
      }).toThrow(NotBoundException);

      expect(container.bound(HttpClient)).toBe(false);
    });
  });

  describe('bound', () => {
    it('should determine if a binding exists', () => {
      expect(container.bound(SomeFactoryClass)).toBe(false);

      container.bind(SomeFactoryClass, () => new SomeFactoryClass(1), Scope.Factory);

      expect(container.bound(SomeFactoryClass)).toBe(true);
    });
  });

  describe('swap', () => {
    it('should swap an existing dependency with a new one for a Singleton', () => {
      container.bind(SomeFactoryClass, () => new SomeFactoryClass(1), Scope.Singleton);

      expect(container.get(SomeFactoryClass).id).toBe(1);

      container.swap(SomeFactoryClass, () => new SomeFactoryClass(2));

      expect(container.get(SomeFactoryClass).id).toBe(2);
    });

    it('should swap an existing dependency with a new one for a Factory', () => {
      container.bind(SomeFactoryClass, () => new SomeFactoryClass(1), Scope.Factory);

      expect(container.get(SomeFactoryClass).id).toBe(1);

      container.swap(SomeFactoryClass, () => new SomeFactoryClass(2));

      expect(container.get(SomeFactoryClass).id).toBe(2);
    });

    it('should throw when there is no dependency to swap', () => {
      expect(() => container.swap(SomeFactoryClass, () => new SomeFactoryClass(2))).toThrow(NotBoundException);
    });
  });

  describe('resetSingleton', () => {
    it('should reset a singleton dependency in the container', () => {
      let count = 0;

      container.bind(
        SomeFactoryClass,
        () => {
          count++;

          return new SomeFactoryClass(count);
        },
        Scope.Singleton,
      );

      expect(container.get(SomeFactoryClass).id).toBe(1);
      expect(container.get(SomeFactoryClass).id).toBe(1);

      container.resetSingleton(SomeFactoryClass);

      expect(container.get(SomeFactoryClass).id).toBe(2);

      container.resetSingleton(SomeFactoryClass);

      expect(container.get(SomeFactoryClass).id).toBe(3);
    });
  });
});
