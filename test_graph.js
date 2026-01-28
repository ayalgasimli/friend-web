import { generateImplicitLinks } from './src/utils/graphUtils.js';
import assert from 'assert';

console.log("Running Graph Utils Test...");

// Mock Data
const nodes = [
    { id: 'A' },
    { id: 'B' },
    { id: 'C' },
    { id: 'D' },
    { id: 'E' }
];

const links = [
    { source: 'A', target: 'B', type: 'friend' }, // A-B (1st)
    { source: 'B', target: 'C', type: 'friend' }, // B-C (1st) -> A-C (2nd)
    { source: 'C', target: 'D', type: 'friend' }, // C-D (1st) -> B-D (2nd), A-D (3rd)
    { source: 'D', target: 'E', type: 'friend' }  // D-E (1st) -> C-E (2nd), B-E (3rd), A-E (4th - explicit cutoff)
];

const result = generateImplicitLinks(nodes, links);

// Helper to find link
const findLink = (s, t) => result.find(l => (l.source === s && l.target === t) || (l.source === t && l.target === s));

// Test 1: Explicit Links Preserved
console.log("Checking explicit links...");
const ab = findLink('A', 'B');
assert.ok(ab, 'A-B should exist');
assert.strictEqual(ab.category, 1, 'A-B should be category 1');

// Test 2: 2nd Degree
console.log("Checking 2nd degree links...");
const ac = findLink('A', 'C');
assert.ok(ac, 'A-C should exist (implicit)');
assert.strictEqual(ac.category, 2, 'A-C should be category 2');
assert.strictEqual(ac.type, 'second_degree');

const bd = findLink('B', 'D');
assert.ok(bd, 'B-D should exist');
assert.strictEqual(bd.category, 2);

// Test 3: 3rd Degree
console.log("Checking 3rd degree links...");
const ad = findLink('A', 'D');
assert.ok(ad, 'A-D should exist (implicit)');
assert.strictEqual(ad.category, 3, 'A-D should be category 3');
assert.strictEqual(ad.type, 'third_degree');

// Test 4: 4th Degree (Should NOT exist)
console.log("Checking 4th degree links (should not exist)...");
const ae = findLink('A', 'E');
assert.strictEqual(ae, undefined, 'A-E should NOT exist (distance 4)');

// Test 5: Priority (Explicit overrides implicit)
console.log("Checking priority...");
// Add direct link A-C (overriding 2nd degree)
const linksWithOverride = [
    ...links,
    { source: 'A', target: 'C', type: 'best_friend' }
];
const resultOverride = generateImplicitLinks(nodes, linksWithOverride);
const acOverride = resultOverride.find(l => (l.source === 'A' && l.target === 'C') || (l.source === 'C' && l.target === 'A'));
assert.ok(acOverride);
assert.strictEqual(acOverride.category, 1, 'A-C should be category 1 because explicit link exists');
assert.strictEqual(acOverride.type, 'best_friend');

console.log("All tests passed!");
