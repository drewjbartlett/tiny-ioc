# Tiny IOC

`tiny-ioc` is a lightweight (less than 1kB) dependency injection / IOC container for TypeScript.


[![Core CI](https://github.com/drewjbartlett/tiny-ioc/actions/workflows/core.yml/badge.svg)](https://github.com/drewjbartlett/tiny-ioc/actions/workflows/core.yml) 


### Features

- ✅ 100% TypeScript
- ✅ lightweight - < 1kB

### Installation

```bash
npm i @drewjbartlett/tiny-ioc --save
```

### Usage

Create a `container.ts` file that creates, registers, and then exports the container.

```ts
// container.ts
import { createContainer, Scope } from '@drewjbartlett/tiny-ioc';

const container = createContainer();

container.bind(MyClass, () => new MyClass(), Scope.Singleton);

container.registerFactory(DataSource, () => new DataSource(container.get(HttpClient)));
container.registerSingleton(HttpClient, () => new HttpClient());

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

- `bind` - Bind a dependency with a given scope.

```ts

```

- `bindSingleton` - Bind a dependency to the container as a singleton.

```ts

```

- `bindFactory` - Bind a dependency to the container as a factory. Each time the dependency is resolved the container will call the factory function.

```ts

```


- `bindOnce` - Only bind the given value if there is not already a binding.

```ts

```

- `get` - Attempt to resolve a given binding. Will throw if there is no binding found.

```ts

```

- `resetSingleton` - Reset a singleton value. If a value has been previously resolved and is registered as a singleton, this will keep the binding but reset the singleton value until the next resolve.

```ts

```

- `bound` - Determine if a binding exists or not.

```ts

```

- `unbind` - Remove the given binding from the container entirely.

```ts

```

- `swap` - Swap the old binding's value with the new value. This is useful when testing.

```ts

```

### Using in tests

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

```ts
// unit-test.test.ts

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

  await myRequest(); // this calls .get() on DummyHttpClient
})
```