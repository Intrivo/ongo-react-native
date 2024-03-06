# ongo-react-native

On/Go react native sdk

## Installation

```sh
npm install ongo-react-native
```

## Usage

```js
import { useBluetoothConnector } from 'ongo-react-native';

// ...

useBluetoothConnector({ unit: 'kg' }, (weight: number) => {
  // handle weight result
});
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
