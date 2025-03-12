# Global Types

This folder contains global TypeScript types used throughout the project. These types are shared across multiple modules to ensure consistency and reduce redundancy.

## Introduction

The global types folder is a central repository for all TypeScript type definitions that are used across different parts of the project. By defining types globally, we can maintain a single source of truth and improve code maintainability.

## Folder Structure

```
/Types
    ├── index.ts
    ├── userTypes.ts
    ├── productTypes.ts
    └── ...
```

- `index.ts`: Entry point for exporting all global types.
- `userTypes.ts`: Contains type definitions related to user entities.
- `productTypes.ts`: Contains type definitions related to product entities.
- `...`: Additional type definition files as needed.

## Usage

To use the global types in your module, simply import the required types from the `Types` folder. For example:

```typescript
import { UserType } from '../Types/userTypes';
import { ProductType } from '../Types/productTypes';
```

## Contributing

When adding new types or modifying existing ones, please ensure that:

1. Types are defined in a clear and concise manner.
2. Types are placed in appropriately named files.
3. The `index.ts` file is updated to export any new types.

Feel free to open a pull request or issue if you have any questions or suggestions.
