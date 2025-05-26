# Valtor

[![npm version](https://img.shields.io/npm/v/valtor.svg)](https://www.npmjs.com/package/valtor)

TypeScript library for fluent, chainable validation.

**⚠️ Development Status:** This library is under active development and not production-ready. APIs may change.

## Installation

```bash
npm install valtor
```

## Usage

```ts
import validate from 'valtor';

const NODE_ENV = validate(process.env.NODE_ENV, 'NODE_ENV')
  .isIn(['production', 'development', 'test'])
  .setFallback('development')
  .get();
```

## Contributing

Contributions are welcome! Please submit issues or pull requests on [GitHub](https://github.com/saffr3n/valtor).

## License

[MIT](https://opensource.org/license/MIT)
