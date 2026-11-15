// Public API for custom compositions: import components, scenes and helpers
// from here when a trailer needs something the spec cannot express.
export * from './components';
export * from './scenes';
export * from './three';
export * from './motion';
export * from './theme';
export type * from './spec';
export {DEFAULT_DURATION, FORMATS, sceneSeconds, timeline} from './spec';
export {Trailer, calculateTrailerMetadata} from './Trailer';
