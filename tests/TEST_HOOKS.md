# Test Hooks

Available runtime hooks are exposed on `window.__gainzTest`.

## Deterministic Control
- `enableDeterministic(seed?)`: enables deterministic clock/RNG mode and optionally sets seed.
- `disableDeterministic()`: returns to real-time clock/RNG behavior.
- `isDeterministic()`: returns current deterministic mode state.
- `setSeed(seed)`: sets deterministic RNG seed.

## Time Control
- `stepTicks(count, msPerTick = 50)`: steps deterministic clock by `count * msPerTick`.
- `fastForward(ms, msPerTick = 50)`: advances deterministic clock by `ms` in fixed chunks.
- `setNow(ms)`: sets deterministic clock to an absolute time (must be >= current).
- `now()`: returns deterministic clock time in milliseconds.

## State Control
- `snapshot()`: deep clones core game state.
- `restore(snapshot)`: restores previously captured state snapshot.

## Economy Debug Surfaces
- `window.__gainzEconomyBudget.layer1`: read-only Layer 1 cross-gym acceleration budget (bodyweight/lifting/cardio/yoga identities and pacing coefficients).

## Recommended Deterministic Scenarios
- Gym interchangeability parity:
  - switch between bodyweight/lifting/cardio/yoga in deterministic mode and verify progression state + automation flags remain valid.
- Automation ladder parity:
  - verify each gym can progress from manual to near-full automation with deterministic check-ins.
- Policy pacing checks:
  - run active and semi-active (`15-30m`) deterministic check-in policies and record first-prestige timing for Layer 0 and early Layer 1.
- Golden checkpoints:
  - run `npm run profile:golden` to validate deterministic Layer 0 checkpoint parity.
  - run `npm run profile:golden:update` only when intentionally updating baseline behavior.
