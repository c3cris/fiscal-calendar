# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**retail-calendar** is a TypeScript library for generating configurable retail/fiscal calendars. It creates merchandising calendars with Gregorian date boundaries, supporting various week distribution patterns (NRF 4-5-4, 4-4-5, 5-4-4, 4x13) and multiple week calculation strategies.

## Commands

```bash
# Install dependencies
npm install

# Build TypeScript to dist/
npm run build

# Run all tests with coverage
npm test

# Run a single test file
npx jest __tests__/retail_calendar.test.ts

# Run tests matching a pattern
npx jest -t "53 week"

# Lint code
npm run lint

# Auto-fix linting issues
npm run lint-fix

# Format code with Prettier
npm run format
```

## Architecture

### Strategy Pattern for Week Calculation

The library uses the Strategy pattern to determine fiscal year boundaries. Six strategies implement the `LastDayStrategy` interface:

| Strategy | Description |
|----------|-------------|
| `LastDayNearestEOMStrategy` | Closest day of week to end of month (NRF standard) |
| `LastDayBeforeEOMStrategy` | Last day of week before end of month |
| `LastDayBeforeEOMExceptLeapYearStrategy` | Before EOM, except shifts for leap years |
| `FirstBOWOfFirstMonth` | Beginning of week of first month |
| `PenultimateDayOfWeekNearestEOMStrategy` | Penultimate day of week nearest EOM |
| `CustomLeapYearStrategy` | User-defined leap year rules |

### Core Components

```
RetailCalendarFactory (src/retail_calendar.ts)
├── Creates calendar from RetailCalendarOptions + year
├── Memoized via buildRetailCalendarFactory for performance
└── Returns: { months, weeks, days, numberOfWeeks, year }

CalendarMonth (src/calendar_month.ts)
├── Represents a fiscal month with gregorian boundaries
└── Contains array of CalendarWeek

CalendarWeek (src/calendar_week.ts)
├── Represents a retail week (1-52 or 1-53)
└── Includes quarter, month, and gregorian dates

date_utils.ts
└── Timezone-safe date manipulation utilities

gregorian_helpers.ts
└── Maps gregorian dates to retail calendar weeks
└── Exports weekOfGregorianDate() for lookup
```

### Configuration Types (src/types.ts)

- **WeekGrouping**: `Group454`, `Group445`, `Group544`, `Group4x13`
- **LastDayOfWeek**: Monday(1) through Sunday(7)
- **LastMonthOfYear**: Which month ends the fiscal year
- **WeekCalculation**: Which strategy calculates year boundaries
- **addLeapWeekToMonth**: Zero-indexed month to absorb 53rd week (or -1 for independent leap week)

### Memoization

Calendar instances are cached in `src/utils/memoization.ts`. Adding new fields to `RetailCalendarOptions` requires updating `stringifyCalendarOptions` to maintain cache key accuracy.

## Public API

```typescript
import {
  RetailCalendarFactory,
  weekOfGregorianDate,
  WeekCalculation,
  WeekGrouping,
  LastDayOfWeek,
  LastMonthOfYear,
  NRFCalendarOptions,  // Pre-configured NRF 4-5-4 options
} from 'retail-calendar'
```

## Test Data

Test fixtures in `__tests__/data/` contain expected calendar outputs for validation. Custom Jest matcher `toBeTheSameWeekAs` in `__tests__/matchers/` compares week objects.
