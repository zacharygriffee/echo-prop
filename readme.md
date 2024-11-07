# EchoProp

EchoProp is a lightweight library that enables reactive properties on JavaScript objects using RxJS `ReplaySubject`. It allows you to track and observe property changes with options for validation and configurable replay counts, making state management in reactive programming more straightforward.

## Features
- Adds reactive properties to any object.
- Automatically creates RxJS observables for property changes.
- Supports configurable replay counts for observable history.
- Optional validation for property updates.
- Option to use existing property values as the initial value.
- Configurable logging for validation failures.

## Installation

Install EchoProp using npm:

```bash
npm install echo-prop
```

## Usage

### Single Reactive Property

To create a single reactive property, use the `createEchoProp` function:

```javascript
import { createEchoProp } from 'echo-prop';

// Example target object
const target = {};

// Create a reactive property
const prop = createEchoProp(target, 'value', 10, {
    replayCount: 1, // Keep 1 previous value in history
    validate: (newValue, oldValue) => newValue >= 0, // Validation function
    log: true, // Enable logging for validation failures
    useExistingValueAsInitial: true // Use existing value if initialValue is null (default: true)
});

// Subscribe to changes
prop.subscribe((newValue) => console.log('New value:', newValue));

// Update the property value
target.value = 20; // Outputs: New value: 20

// Access the observable
const valueObservable = target.value$;
```

### Multiple Reactive Properties

To add multiple reactive properties at once, use `createEchoProps`:

```javascript
import { createEchoProps } from 'echo-prop';

const target = {};

// Define initial values for properties
const propertyBook = {
    score: 0,
    health: 100
};

// Create reactive properties
const props = createEchoProps(target, propertyBook, {
    replayCount: 1,
    validate: (newValue, oldValue) => newValue >= 0,
    useExistingValueAsInitial: true // Use existing value if initialValue is null (default: true)
});

// Subscribe to a specific property
target.score$.subscribe((newScore) => console.log('New score:', newScore));

// Update the property
target.score = 5; // Outputs: New score: 5
```

## API

### `createEchoProp(target, propertyName, initialValue, config)`

Creates a reactive property on the `target` object.

- **target** (Object): The object on which to add the property.
- **propertyName** (String): The name of the property.
- **initialValue** (Any): Initial value of the property.
- **config** (Object):
  - `addAsObservableToTarget` (Boolean, default: `true`): Adds the observable to `target` with the name `<propertyName>$`.
  - `replayCount` (Number, default: `1`): Number of previous values the observable will remember.
  - `validate` (Function, default: `null`): Optional validation function with the signature `(newValue, oldValue) => Boolean`.
  - `log` (Boolean, default: `false`): If true, logs a warning when validation fails.
  - `useExistingValueAsInitial` (Boolean, default: `true`): Uses the existing property value as the initial value if `initialValue` is `null` or `undefined`.

Returns an object:
- `value (Any)`: The current value of the property.
- `name (String)`: The name of the property.
- `subscribe(callback)`: Subscribe to property changes.
- `asObservable()`: Access the observable for custom handling.
- `complete()`: Complete the observable.

### `createEchoProps(target, propertyBook, config)`

Creates multiple reactive properties on the `target` object.

- **target** (Object): The object to enhance with reactive properties.
- **propertyBook** (Object): Key-value pairs where each key is a property name and each value is its initial value.
- **config** (Object): Same as in `createEchoProp`.

Returns an array of reactive property objects for custom management.

## License

EchoProp is licensed under the MIT License.
