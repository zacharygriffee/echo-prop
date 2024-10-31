import { ReplaySubject } from 'rxjs';

function createEchoProp(target, propertyName, initialValue, config = {}) {
    const {
        addAsObservableToTarget = true,
        replayCount = 1,
        validate = null, // Optional validation function
        // For debugging invalidation warnings
        log = false
    } = config;

    const subject = new ReplaySubject(replayCount);
    let lastValue = initialValue; // Track the last value internally

    // Set initial value if provided
    if (initialValue != null) {
        subject.next(initialValue);
    }

    // Define the reactive property on the target object
    Object.defineProperty(target, propertyName, {
        get() {
            return lastValue; // Return the last known value
        },
        set(newValue) {
            // Validate the new value if a validation function is provided
            if (validate && !validate(newValue, lastValue)) {
                log && console.warn(`Validation failed for property '${propertyName}'. Keeping previous value.`);
                return;
            }

            // If validation passes or no validation function is provided, update the value
            lastValue = newValue;
            subject.next(newValue);
        },
        enumerable: true,
        configurable: true
    });

    // Optionally add the observable to the target object
    if (addAsObservableToTarget) {
        target[propertyName + "$"] = subject.asObservable();
    }

    // Return an object to manage reactivity (e.g., subscriptions)
    return {
        get value() {
            return lastValue;
        },
        name: propertyName,
        subscribe: (callback) => subject.subscribe(callback),
        asObservable: () => subject.asObservable(),
        complete: () => subject.complete()
    };
}

function createEchoProps(target, propertyBook, config = {}) {
    return Object.entries(propertyBook).map(([propName, propDefault]) =>
        createEchoProp(target, propName, propDefault, config)
    );
}

// Backwards compat with some tools that already use this library.

function createReactiveProperty(...args) {
    return createEchoProp(...args);
}

function createReactiveProperties(...args) {
    return createEchoProps(...args);
}

export {
    createEchoProp,
    createEchoProps,
    createReactiveProperty,
    createReactiveProperties
}
