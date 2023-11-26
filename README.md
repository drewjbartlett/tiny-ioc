# Tiny IOC

`tiny-ioc` is a lightweight (less than 1kB) dependency injection / IOC container for TypeScript.


[![Core CI](https://github.com/drewjbartlett/tiny-ioc/actions/workflows/core.yml/badge.svg)](https://github.com/drewjbartlett/tiny-ioc/actions/workflows/core.yml) 


### Features

- ✅ 100% TypeScript
- ✅ lightweight - < 1kB
- ✅ bind & unbind dependencies
- ✅ bind singletons and reset if necessary
- ✅ bind factories
- ✅ support for swapping dependencies
- ✅ makes testing a breeze

### Installation

```bash
npm i @drewjbartlett/tiny-ioc --save
```

### Usage

Create a `container.ts` file that creates, binds, and then exports the container.

```ts
// container.ts
import { createContainer, Scope } from '@drewjbartlett/tiny-ioc';

const container = createContainer();

container.bind(MyClass, () => new MyClass(), Scope.Singleton);

container.bindFactory(DataSource, () => new DataSource(container.get(HttpClient)));
container.bindSingleton(HttpClient, () => new HttpClient());

export { container }
```

```ts
// some-other-file.ts

import { container } from 'path/to/container';
import { DataSource } from 'path/to/data-source';

export async function makeRequest() {
  try {
    const dataSource = container.get(DataSource);

    return await dataSource.get('/foo/bar');
  } catch (e) {
    //
  }
}
```

### API

#### `bind<T>(binding: Binding<T>, value: FactoryFunction<T>, scope: Scope): void` 

Bind a dependency with a given scope.

```ts
import { createContainer, Scope } from '@drewjbartlett/tiny-ioc';

const container = createContainer();

container.bind(SomeClass, () => new SomeClass(container.get(AnotherClass)), Scope.Singleton);
container.bind(AnotherClass, () => new AnotherClass(), Scope.Factory);

```

#### `bindSingleton<T>(binding: Binding<T>, factory: FactoryFunction<T>): void`
  
Bind a dependency to the container as a singleton.

```ts
class Total {
  constructor(public readonly count: number) {}
}

let count = 0;

container.bindSingleton(
  Total,
  () => {
    count++;

    return new Total(count);
  },
);

container.get(Total).count; // 1
container.get(Total).count; // 1
container.get(Total).count; // 1
container.get(Total).count; // 1

```

#### `bindFactory<T>(binding: Binding<T>, factory: FactoryFunction<T>): void`

Bind a dependency to the container as a factory. Each time the dependency is resolved the container will call the factory function.

```ts
class Total {
  constructor(public readonly count: number) {}
}

let count = 0;

container.bindFactory(
  Total,
  () => {
    count++;

    return new Total(count);
  },
);

container.get(Total).count; // 1
container.get(Total).count; // 2
container.get(Total).count; // 3
container.get(Total).count; // 4
```


#### `bindOnce<T>(binding: Binding<T>, value: FactoryFunction<T>, scope: Scope): void`

Only bind the given value if there is not already a binding.

```ts
container.bindOnce(HttpClient, () => new HttpClient({ baseURL: 'baseURL 1' }), Scope.Singleton);
container.bindOnce(HttpClient, () => new HttpClient({ baseURL: 'baseURL 2' }), Scope.Singleton);

container.get(HttpClient).baseURL // 'baseURL 1'
```

#### `get<T>(binding: Binding<T>): T`

Attempt to resolve a given binding. Will throw a `NotBoundException` if there is no binding found.

```ts
container.get(SomeDependency);
```

#### `resetSingleton<T>(binding: Binding<T>): void`

Reset a singleton value. 
  
If a value has been previously resolved and is bound as a singleton, this will keep the binding but reset the singleton value until the next resolve. Take the example below. Each time the singleton dependency is built the count will increase. Since it's a singleton `count` will always be 1. After resetting the singleton the new value is 2 since the factory function is called again.

```ts
let count = 0;

container.bindSingleton(
  Total,
  () => {
    count++;

    return new Total(count);
  },
);

container.get(Total).count // 1
container.get(Total).count // 1

container.resetSingleton(Total);

container.get(Total).count // 2
```

#### `bound<T>(binding: Binding<T>): boolean` 

Determine if a binding exists or not.


```ts
container.bound(HttpClient); // false

container.bindFactory(HttpClient, () => new HttpClient());

container.bound(HttpClient); // true
```

- `unbind` - Remove the given binding from the container entirely.

```ts
container.bindFactory(HttpClient, () => new HttpClient());

container.get(HttpClient); // HttpClient

container.unbind(HttpClient); 

container.get(HttpClient); // throws NotBoundException
```

#### `swap<T>(oldBinding: Binding<T>, newBinding: FactoryFunction<T>): void` 
  
Swap the old binding's value with the new value. This is useful when testing.

There may be times where swapping a dependency is necessary. Especially when testing. `swap` allows for swapping out a dependency by a given class name.

```ts
class Tesla extends Car {

}

class Rivian extends Car {

}

container.bindFactory(Car, () => new Tesla());

container.get(Car); // Tesla

container.swap(Car, () => new Rivian());

container.get(Car); // Rivian
```

### Using in tests

Unit testing is made very simple when using `tiny-ioc`. You can simply swap out the real dependency for any mock dependency and the tests will reference your mock instead of the real thing.

```ts
// make-request.ts

import { container } from 'path/to/container';
import { HttpClient } from 'path/to/data-source';

export async function makeRequest() {
  try {
    const dataSource = container.get(HttpClient);

    return await dataSource.get('/foo/bar');
  } catch (e) {
    //
  }
}
```

```ts
// make-request.test.ts

import { container } from 'path/to/container';
import { HttpClient } from 'path/to/http-client';
import { makeRequest } from 'path/top/make-request';

class DummyHttpClient {
  get(url: string) {
    return dummyData;
  }
}

it('should make the request', () => {
  container.swap(HttpClient, () => new DummyHttpClient());

  await myRequest(); // calls .get() on DummyHttpClient instead of HttpClient
})
```