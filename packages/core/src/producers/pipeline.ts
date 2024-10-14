import { OiDataProducer } from "./producer";

/**
 * Pipeline producer: A pipeline writes messages sorted by ID, like Redis streams.
 * However: It has a locking mechanism that ensures sequential processing.
 * 
 */
export class OiPipelineProducer extends OiDataProducer {
}
