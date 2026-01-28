import {
  RetailCalendarFactory,
  WeekCalculation,
  WeekGrouping,
  LastDayOfWeek,
  LastMonthOfYear,
} from './src'



// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type WeekGroupingKey = keyof typeof WeekGrouping
type WeekCalculationKey = keyof typeof WeekCalculation
type LastDayOfWeekKey = keyof typeof LastDayOfWeek
type LastMonthOfYearKey = keyof typeof LastMonthOfYear

interface FiscalSettings {
  weekGrouping: WeekGroupingKey
  weekCalculation: WeekCalculationKey
  lastDayOfWeek: LastDayOfWeekKey
  lastMonthOfYear: LastMonthOfYearKey
}

// ============================================================================
// CONFIGURATION - Modify these values to generate different calendars
// ============================================================================
// CURRENT FAMOUS DAVES SETTINGS
// LastDayBeforeEOM	Group544	Sunday	December	14

const START_YEAR = 2014
const END_YEAR = 2026
const PERIOD_ONLY = true  // Set to true to output only period info (no weeks)

const fiscalSettings: FiscalSettings = {
  weekGrouping: 'Group544',
  weekCalculation: 'LastDayBeforeEOM',
  lastDayOfWeek: 'Sunday',
  lastMonthOfYear: 'December',
}

// ============================================================================

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function generateCalendarCSV(
  settings: FiscalSettings,
  startYear: number,
  endYear: number,
  periodOnly: boolean,
): void {
  // Print configuration
  console.log('# Calendar Configuration')
  console.log(`# Year Range: ${startYear} - ${endYear}`)
  console.log(`# Week Grouping: ${settings.weekGrouping}`)
  console.log(`# Week Calculation: ${settings.weekCalculation}`)
  console.log(`# Last Day of Week: ${settings.lastDayOfWeek}`)
  console.log(`# Last Month of Year: ${settings.lastMonthOfYear}`)
  console.log(`# Output Mode: ${periodOnly ? 'Periods Only' : 'Weeks'}`)
  console.log('#')

  // CSV Header
  if (periodOnly) {
    console.log('year,period,period_start_date,period_end_date')
  } else {
    console.log('year,period,week_of_period,week_of_year,week_start_date,week_end_date,period_start_date,period_end_date')
  }

  // Generate for each year in range
  for (let year = startYear; year <= endYear; year++) {
    const calendar = new RetailCalendarFactory(
      {
        weekCalculation: WeekCalculation[settings.weekCalculation],
        weekGrouping: WeekGrouping[settings.weekGrouping],
        lastDayOfWeek: LastDayOfWeek[settings.lastDayOfWeek],
        lastMonthOfYear: LastMonthOfYear[settings.lastMonthOfYear],
      },
      year,
    )

    if (periodOnly) {
      // Output each period/month
      for (const month of calendar.months) {
        const row = [
          year,
          month.monthOfYear,
          formatDate(month.gregorianStartDate),
          formatDate(month.gregorianEndDate),
        ].join(',')

        console.log(row)
      }
    } else {
      // Build a map of month info for quick lookup
      const monthMap = new Map<number, { startDate: Date; endDate: Date }>()
      for (const month of calendar.months) {
        monthMap.set(month.monthOfYear, {
          startDate: month.gregorianStartDate,
          endDate: month.gregorianEndDate,
        })
      }

      // Output each week
      for (const week of calendar.weeks) {
        const monthInfo = monthMap.get(week.monthOfYear)
        const periodStartDate = monthInfo ? formatDate(monthInfo.startDate) : ''
        const periodEndDate = monthInfo ? formatDate(monthInfo.endDate) : ''

        const row = [
          year,
          week.monthOfYear,
          week.weekOfMonth + 1, // Convert from 0-indexed to 1-indexed
          week.weekOfYear + 1,  // Convert from 0-indexed to 1-indexed
          formatDate(week.gregorianStartDate),
          formatDate(week.gregorianEndDate),
          periodStartDate,
          periodEndDate,
        ].join(',')

        console.log(row)
      }
    }
  }
}

// Run the generator
generateCalendarCSV(fiscalSettings, START_YEAR, END_YEAR, PERIOD_ONLY)
