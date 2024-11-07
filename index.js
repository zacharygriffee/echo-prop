import { ReplaySubject } from 'rxjs';

/**
 * Creates a reactive property on a target object, optionally attaching an observable for change detection.
 *
 * @param {Object} target - The target object to which the property will be added.
 * @param {string} propertyName - The name of the property to be created on the target.
 * @param {*} initialValue - The initial value of the property. If `null` or `undefined` and `useExistingValueAsInitial` is `true`, the existing property value will be used.
 * @param {Object} [config={}] - Configuration options for the reactive property.
 * @param {boolean} [config.addAsObservableToTarget=true] - Whether to add an observable property (`propertyName$`) to the target object.
 * @param {number} [config.replayCount=1] - The number of previous values the observable should replay to new subscribers.
 * @param {function} [config.validate=null] - An optional validation function that takes `newValue` and `oldValue` as arguments and returns `true` if the new value is valid.
 * @param {boolean} [config.log=false] - Whether to log validation failures to the console.
 * @param {boolean} [config.useExistingValueAsInitial=true] - Whether to use the existing property value as the initial value if `initialValue` is `null` or `undefined`.
 *
 * @returns {Object} An object managing the reactive property with methods for subscribing and observing changes.
 */
function createEchoProp(target, propertyName, initialValue, config = {}) {
    const {
        addAsObservableToTarget = true,
        replayCount = 1,
        validate = null, // Optional validation function
        log = false, // For debugging invalidation warnings
        useExistingValueAsInitial = true // New config option, default to true
    } = config;

    // Check if there's an existing property and initialValue is null/undefined
    if (useExistingValueAsInitial && initialValue == null && target.hasOwnProperty(propertyName)) {
        initialValue = target[propertyName];
    }

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

/**
 * Creates multiple reactive properties on a target object based on a given property book.
 *
 * @param {Object} target - The target object to which the properties will be added.
 * @param {Object} propertyBook - An object mapping property names to their initial values.
 * @param {Object} [config={}] - Configuration options to pass to each `createEchoProp` call.
 *
 * @returns {Array<Object>} An array of objects managing each reactive property with methods for subscribing and observing changes.
 */
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
