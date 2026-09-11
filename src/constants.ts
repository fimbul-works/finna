/* Query prefix */
export const QUERY_PREFIX = "$";
export const QUERY_FIELD = QUERY_PREFIX + "field";

/* Comparison Query Operators */
export const QUERY_EQ = QUERY_PREFIX + "eq";
export const QUERY_NOT_EQ = QUERY_PREFIX + "ne";
export const QUERY_IN = QUERY_PREFIX + "in";
export const QUERY_NOT_IN = QUERY_PREFIX + "nin";
export const QUERY_GT = QUERY_PREFIX + "gt";
export const QUERY_GTE = QUERY_PREFIX + "gte";
export const QUERY_LT = QUERY_PREFIX + "lt";
export const QUERY_LTE = QUERY_PREFIX + "lte";

/* Logical Query Operators */
export const QUERY_AND = QUERY_PREFIX + "and";
export const QUERY_OR = QUERY_PREFIX + "or";
export const QUERY_NOT = QUERY_PREFIX + "not";
export const QUERY_NOR = QUERY_PREFIX + "nor";

/* Type Query Operators */
export const QUERY_EXISTS = QUERY_PREFIX + "exists";
export const QUERY_TYPE = QUERY_PREFIX + "type";

/* String Query Operators */
export const QUERY_REGEX = QUERY_PREFIX + "regex";
export const QUERY_STARTS_WITH = QUERY_PREFIX + "startsWith";
export const QUERY_ENDS_WITH = QUERY_PREFIX + "endsWith";
export const QUERY_INCLUDES = QUERY_PREFIX + "includes";

/* Array Query Operators */
export const QUERY_ALL = QUERY_PREFIX + "all";
export const QUERY_SOME = QUERY_PREFIX + "some";
export const QUERY_NONE = QUERY_PREFIX + "none";
export const QUERY_SIZE = QUERY_PREFIX + "size";

/* Date Query Operators */
export const QUERY_YEAR = QUERY_PREFIX + "year";
export const QUERY_MONTH = QUERY_PREFIX + "month";
export const QUERY_DATE = QUERY_PREFIX + "date";
export const QUERY_WEEKDAY = QUERY_PREFIX + "weekday";
export const QUERY_HOUR = QUERY_PREFIX + "hour";
export const QUERY_MINUTE = QUERY_PREFIX + "minute";
export const QUERY_SECOND = QUERY_PREFIX + "second";
export const QUERY_MS = QUERY_PREFIX + "ms";
export const QUERY_UTC = QUERY_PREFIX + "utc";
