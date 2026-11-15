import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// WebGL for the 3D scenes in headless Chrome.
Config.setChromiumOpenGlRenderer('angle');
Config.setEntryPoint('framework/src/index.ts');
