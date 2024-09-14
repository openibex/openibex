/**
 * Channel Primitive: A channel writes messages sorted by ID, like Redis streams.
 * However: It does not ensure sequential processing, and every worker gets every entry.
 * 
 */
