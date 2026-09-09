/**
 * Centralized Platform & Capability Module for DM ARRANGIA
 */

import { isDesktop, isPWA, isWeb, getOperatingSystem, getPlatformInfo } from './platformDetection';
import { capabilities, getCapabilities } from './capabilities';

export * from './types';
export * from './platformDetection';
export * from './capabilities';

export const platform = {
  isDesktop,
  isPWA,
  isWeb,
  getOperatingSystem,
  getPlatformInfo,
  capabilities,
  getCapabilities,
};

export default platform;
