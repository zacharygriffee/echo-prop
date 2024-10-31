import { createEchoProp, createEchoProps } from './index.js';
import { test } from 'brittle';

test('createEchoProp - should set the initial value and allow reading via direct property access', (t) => {
    const target = {};
    const prop = createEchoProp(target, 'value', 42);

    t.is(target.value, 42);
    t.is(prop.value, 42);
});

test('createEchoProp - should emit initial value and allow updates', (t) => {
    const target = {};
    const prop = createEchoProp(target, 'value', 0);
    const values = [];

    prop.subscribe((newValue) => values.push(newValue));

    // Initial value should be emitted first
    t.is(values.length, 1);
    t.is(values[0], 0);

    // Update values
    target.value = 10;
    target.value = 20;

    t.is(values.length, 3);
    t.is(values[1], 10);
    t.is(values[2], 20);
});

test('createEchoProp - should respect the replay count and only store the latest values', (t) => {
    const target = {};
    const prop = createEchoProp(target, 'value', 1, { replayCount: 2 });
    const values = [];

    target.value = 2;
    target.value = 3;
    target.value = 4;

    prop.subscribe((newValue) => values.push(newValue));

    // Only the last two values should be replayed (3 and 4)
    t.is(values.length, 2);
    t.is(values[0], 3);
    t.is(values[1], 4);
});

test('createEchoProp - should validate new values before updating, and reject invalid values', (t) => {
    const target = {};
    const prop = createEchoProp(target, 'value', 5, {
        validate: (newValue) => newValue >= 5
    });
    const values = [];

    prop.subscribe((newValue) => values.push(newValue));

    // Initial value should be emitted
    t.is(values.length, 1);
    t.is(values[0], 5);

    // Update values
    target.value = 10; // Valid update
    target.value = 2;  // Invalid update (should be ignored)
    target.value = 15; // Valid update

    t.is(values.length, 3);
    t.is(values[1], 10);
    t.is(values[2], 15);
    t.is(target.value, 15);
});

test('createEchoProps - should create multiple reactive properties and emit initial values', (t) => {
    const target = {};
    const props = createEchoProps(target, { score: 0, health: 100 });
    const scoreValues = [];
    const healthValues = [];

    target.score$.subscribe((newValue) => scoreValues.push(newValue));
    target.health$.subscribe((newValue) => healthValues.push(newValue));

    // Initial values should be emitted
    t.is(scoreValues.length, 1);
    t.is(scoreValues[0], 0);
    t.is(healthValues.length, 1);
    t.is(healthValues[0], 100);

    // Update properties
    target.score = 10;
    target.health = 90;

    t.is(scoreValues.length, 2);
    t.is(scoreValues[1], 10);
    t.is(healthValues.length, 2);
    t.is(healthValues[1], 90);
});
