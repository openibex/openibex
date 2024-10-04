import { OiDataLogProducer } from "./datalog";

/**
 * A DataSeries producer produces a DataLog but serves an extra function: It can
 * collect records and combine them into one log entry.
 * This is a way to implement time series.
 */
export class OiDataSeriesProducer extends OiDataLogProducer {
}
