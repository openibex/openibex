import { OiDataConsumer } from "./consumer";

/**
 * Pipeline consumer: A pipeline writes messages sorted by ID, like Redis streams.
 * However: It has a locking mechanism that ensures sequential processing.
 * 
 */
export class OiPipelineConsumer extends OiDataConsumer {
}
