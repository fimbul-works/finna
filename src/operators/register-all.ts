import type { OperatorFactory, OperatorName } from "../types.js";
import { createAllPredicate } from "./array/all.js";
import { createNonePredicate } from "./array/none.js";
import { createSizePredicate } from "./array/size.js";
import { createSomePredicate } from "./array/some.js";
import { createGtPredicate } from "./comparison/gt.js";
import { createGtePredicate } from "./comparison/gte.js";
import { createLtPredicate } from "./comparison/lt.js";
import { createLtePredicate } from "./comparison/lte.js";
import { createDateOfMonthPredicate } from "./date/date-of-month.js";
import { createHourPredicate } from "./date/hour.js";
import { createMinutePredicate } from "./date/minute.js";
import { createMonthPredicate } from "./date/month.js";
import { createMsPredicate } from "./date/ms.js";
import { createSecondPredicate } from "./date/second.js";
import { createUtcPredicate } from "./date/utc.js";
import { createWeekdayPredicate } from "./date/weekday.js";
import { createYearPredicate } from "./date/year.js";
import { createExistsPredicate } from "./element/exists.js";
import { createTypePredicate } from "./element/type.js";
import { createEqPredicate } from "./equality/eq.js";
import { createInPredicate } from "./equality/in.js";
import { createNePredicate } from "./equality/ne.js";
import { createNinPredicate } from "./equality/nin.js";
import { registerOperators } from "./operator-registry.js";
import { createEndsWithPredicate } from "./string/endsWith.js";
import { createIncludesPredicate } from "./string/includes.js";
import { createRegexPredicate } from "./string/regex.js";
import { createStartsWithPredicate } from "./string/startsWith.js";

/**
 * Registers every built-in filter operator atomically.
 *
 * @returns An idempotent cleanup function removing only operators installed by this call.
 * @throws {Error} If a built-in name already has a different factory installed.
 */
export function registerAllOperators(): () => void {
  return registerOperators(
    new Map<OperatorName, OperatorFactory>([
      ["$eq", createEqPredicate],
      ["$ne", createNePredicate],
      ["$in", createInPredicate],
      ["$nin", createNinPredicate],
      ["$gt", createGtPredicate],
      ["$gte", createGtePredicate],
      ["$lt", createLtPredicate],
      ["$lte", createLtePredicate],
      ["$exists", createExistsPredicate],
      ["$type", createTypePredicate],
      ["$regex", createRegexPredicate],
      ["$startsWith", createStartsWithPredicate],
      ["$endsWith", createEndsWithPredicate],
      ["$includes", createIncludesPredicate],
      ["$year", createYearPredicate],
      ["$month", createMonthPredicate],
      ["$date", createDateOfMonthPredicate],
      ["$weekday", createWeekdayPredicate],
      ["$hour", createHourPredicate],
      ["$minute", createMinutePredicate],
      ["$second", createSecondPredicate],
      ["$ms", createMsPredicate],
      ["$utc", createUtcPredicate],
      ["$all", createAllPredicate],
      ["$some", createSomePredicate],
      ["$none", createNonePredicate],
      ["$size", createSizePredicate],
    ]),
  );
}
