/**
 * run_tests.js
 * Unit test suite for LOOP client utilities:
 * 1. dateParser: canonical parser table tests (X1, T3.3)
 * 2. normalizeCategory & getCategoryMeta: vocabulary contract & alias normalization (X2, X5)
 * 
 * Uses TypeScript transpileModule to run directly against source files in src/utils/.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

function loadTsModule(relativePath) {
  const fullPath = path.resolve(__dirname, '..', relativePath);
  const code = fs.readFileSync(fullPath, 'utf8');
  const compiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });

  const m = { exports: {} };
  const customRequire = (specifier) => {
    // Mock phosphor-react-native icons for Node runtime
    if (specifier === 'phosphor-react-native') {
      const MockIcon = () => null;
      return new Proxy({}, { get: () => MockIcon });
    }
    if (specifier.startsWith('.')) {
      const resolvedDir = path.dirname(fullPath);
      let target = path.resolve(resolvedDir, specifier);
      if (fs.existsSync(target + '.ts')) target += '.ts';
      else if (fs.existsSync(target + '.js')) target += '.js';
      return loadTsModule(path.relative(path.resolve(__dirname, '..'), target));
    }
    return require(specifier);
  };

  const fn = new Function('exports', 'module', 'require', '__dirname', '__filename', compiled.outputText);
  fn(m.exports, m, customRequire, path.dirname(fullPath), fullPath);
  return m.exports;
}

let passed = 0;
let failed = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

function suite(name, fn) {
  console.log(`\n--- [TEST SUITE: ${name}] ---`);
  fn();
}

// -------------------------------------------------------------
// 1. DATE PARSER SUITE (X1, T3.3)
// -------------------------------------------------------------
const { parseDateAndTimeString } = loadTsModule('src/utils/dateParser.ts');

suite('dateParser — Canonical Date & Time Parsing', () => {
  it('parses "5 September 2026", "7:30 PM"', () => {
    const res = parseDateAndTimeString('5 September 2026', '7:30 PM');
    assert(res !== null, 'Expected non-null result');
    assert.strictEqual(res.hasTime, true);
    assert.strictEqual(res.date.getFullYear(), 2026);
    assert.strictEqual(res.date.getMonth(), 8); // Sep is 8
    assert.strictEqual(res.date.getDate(), 5);
  });

  it('parses "02 Sep", "5:00 PM"', () => {
    const res = parseDateAndTimeString('02 Sep', '5:00 PM');
    assert(res !== null, 'Expected non-null result');
    assert.strictEqual(res.hasTime, true);
    assert.strictEqual(res.date.getMonth(), 8);
    assert.strictEqual(res.date.getDate(), 2);
  });

  it('parses "16 August", "10:00 AM"', () => {
    const res = parseDateAndTimeString('16 August', '10:00 AM');
    assert(res !== null, 'Expected non-null result');
    assert.strictEqual(res.hasTime, true);
    assert.strictEqual(res.date.getMonth(), 7); // Aug is 7
    assert.strictEqual(res.date.getDate(), 16);
  });

  it('parses ISO format "2026-04-21", "2:00 PM"', () => {
    const res = parseDateAndTimeString('2026-04-21', '2:00 PM');
    assert(res !== null, 'Expected non-null result');
    assert.strictEqual(res.hasTime, true);
    assert.strictEqual(res.date.getFullYear(), 2026);
    assert.strictEqual(res.date.getMonth(), 3); // Apr is 3
    assert.strictEqual(res.date.getDate(), 21);
  });

  it('returns valid date with hasTime=false for timeless event (F5/all-day calendar)', () => {
    const res = parseDateAndTimeString('5 September 2026', '');
    assert(res !== null, 'Expected non-null result');
    assert.strictEqual(res.hasTime, false);
    assert.strictEqual(res.date.getDate(), 5);
  });

  it('strips ordinal suffixes e.g. "1st Oct 2026", "22nd March 2026"', () => {
    const res1 = parseDateAndTimeString('1st Oct 2026', '6:00 PM');
    assert(res1 !== null);
    assert.strictEqual(res1.date.getDate(), 1);
    assert.strictEqual(res1.date.getMonth(), 9);

    const res2 = parseDateAndTimeString('22nd March 2026', '11:00 AM');
    assert(res2 !== null);
    assert.strictEqual(res2.date.getDate(), 22);
    assert.strictEqual(res2.date.getMonth(), 2);
  });

  it('returns null for filler/unparseable dates', () => {
    for (const bad of ['Not specified', 'not available', 'TBD', 'tba', '', null, undefined, 'unknown', 'n/a']) {
      const res = parseDateAndTimeString(bad, '6:00 PM');
      assert.strictEqual(res, null, `Expected null for '${bad}'`);
    }
  });
});

// -------------------------------------------------------------
// 2. CATEGORY NORMALIZATION SUITE (X2, X5)
// -------------------------------------------------------------
const { normalizeCategory, getCategoryMeta } = loadTsModule('src/utils/categoryMeta.ts');
const { CANONICAL_CATEGORIES } = loadTsModule('src/data/categories.ts');

suite('categoryMeta — Canonical Vocabulary & Alias Normalization', () => {
  it('preserves all 8 canonical categories exactly', () => {
    for (const cat of CANONICAL_CATEGORIES) {
      assert.strictEqual(normalizeCategory(cat), cat, `Failed to preserve '${cat}'`);
    }
  });

  it('normalizes legacy aliases to canonical categories', () => {
    const expectations = {
      'Workshops & Talks': 'Talks & Workshops',
      'Academic & Career': 'Talks & Workshops',
      'Workshops': 'Talks & Workshops',
      'Competitions & Fests': 'Competitions & Quizzes',
      'Competitions': 'Competitions & Quizzes',
      'Health & Social': 'Social & Wellness',
      'Social & Volunteering': 'Social & Wellness',
      'Wellness': 'Social & Wellness',
      'Cultural': 'Cultural & Arts',
      'Arts': 'Cultural & Arts',
      'Tech': 'Tech & Innovation',
      'Technical': 'Tech & Innovation',
      'Sports': 'Sports & Fitness',
      'Fests': 'Fests & Major Events',
    };

    for (const [input, expected] of Object.entries(expectations)) {
      assert.strictEqual(normalizeCategory(input), expected, `Failed to normalize '${input}'`);
    }
  });

  it('returns null for invalid or empty category', () => {
    for (const invalid of [null, undefined, '', '   ', 'RandomUnknownCategory']) {
      assert.strictEqual(normalizeCategory(invalid), null, `Expected null for '${invalid}'`);
    }
  });

  it('getCategoryMeta returns valid default metadata for null or unmapped category', () => {
    const metaNull = getCategoryMeta(null);
    assert(metaNull !== null && typeof metaNull === 'object');
    assert.strictEqual(metaNull.label, 'Campus Event');
    assert.strictEqual(metaNull.tag, 'EVENT');

    const metaUnknown = getCategoryMeta('NonExistent');
    assert(metaUnknown !== null && typeof metaUnknown === 'object');
    assert.strictEqual(metaUnknown.label, 'Campus Event');
  });

  it('getCategoryMeta returns valid metadata with non-empty color for all canonical categories', () => {
    for (const cat of CANONICAL_CATEGORIES) {
      const meta = getCategoryMeta(cat);
      assert(meta !== null && typeof meta === 'object');
      assert(meta.color && meta.color.length > 0, `Missing color for ${cat}`);
      assert(meta.tag && meta.tag.length > 0, `Missing tag for ${cat}`);
    }
  });
});

console.log('\n' + '='.repeat(45));
console.log(`UNIT TEST SUMMARY: ${passed} passed, ${failed} failed`);
console.log('='.repeat(45));

if (failed > 0) {
  process.exit(1);
}
