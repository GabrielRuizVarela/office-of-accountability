/**
 * Connector factory + barrel exports — M10 Source Connectors (Phase 4).
 */

import type { ConnectorKind } from '../types'
import type { Connector } from './types'
import { RestApiConnector } from './rest-api'
import { FileUploadConnector } from './file-upload'
import { CustomScriptConnector } from './custom-script'

export function createConnector(kind: ConnectorKind): Connector {
  switch (kind) {
    case 'rest_api':
      return new RestApiConnector()
    case 'file_upload':
      return new FileUploadConnector()
    case 'custom_script':
      return new CustomScriptConnector()
  }
}

// Re-export types and schemas for consumers
export type { Connector, ConnectorResult } from './types'
export { restApiConfigSchema, fileUploadConfigSchema, customScriptConfigSchema } from './types'
export type { RestApiConfig, FileUploadConfig, CustomScriptConfig } from './types'
export { RestApiConnector } from './rest-api'
export { FileUploadConnector } from './file-upload'
export { CustomScriptConnector } from './custom-script'
