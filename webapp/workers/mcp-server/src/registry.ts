/**
 * Tool and resource registry for the MCP server.
 *
 * Tools are registered with their MCP definition (name, description, inputSchema)
 * and a handler function. The registry maps tool names to handlers and provides
 * the tools/list response. Tools are filtered by API key scopes.
 */

import type {
  AuthContext,
  Env,
  MCPResourceContents,
  MCPResourceTemplate,
  MCPToolDefinition,
  MCPToolResult,
  ResourceHandler,
  ToolHandler,
} from './types'
import { hasScope } from './auth'

// ---------------------------------------------------------------------------
// Tool registration
// ---------------------------------------------------------------------------

interface RegisteredTool {
  definition: MCPToolDefinition
  handler: ToolHandler
  /** Required scope to call this tool (e.g., "investigation:read") */
  scope: string
}

const tools = new Map<string, RegisteredTool>()

/**
 * Register a tool with the MCP server.
 */
export function registerTool(
  definition: MCPToolDefinition,
  handler: ToolHandler,
  scope: string,
): void {
  tools.set(definition.name, { definition, handler, scope })
}

/**
 * List all tool definitions visible to the given auth context.
 */
export function listTools(auth: AuthContext): MCPToolDefinition[] {
  const visible: MCPToolDefinition[] = []
  for (const [, tool] of tools) {
    if (hasScope(auth, tool.scope)) {
      visible.push(tool.definition)
    }
  }
  return visible
}

/**
 * Call a tool by name with the given arguments.
 * Returns the tool result or an error if the tool doesn't exist or access is denied.
 */
export async function callTool(
  name: string,
  args: Record<string, unknown>,
  auth: AuthContext,
  env: Env,
): Promise<MCPToolResult> {
  const tool = tools.get(name)

  if (!tool) {
    return {
      content: [{ type: 'text', text: `Unknown tool: ${name}` }],
      isError: true,
    }
  }

  if (!hasScope(auth, tool.scope)) {
    return {
      content: [{ type: 'text', text: `Access denied: missing scope '${tool.scope}' for tool '${name}'` }],
      isError: true,
    }
  }

  try {
    return await tool.handler(args, auth, env)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      content: [{ type: 'text', text: `Tool error: ${message}` }],
      isError: true,
    }
  }
}

// ---------------------------------------------------------------------------
// Resource registration
// ---------------------------------------------------------------------------

interface RegisteredResource {
  template: MCPResourceTemplate
  handler: ResourceHandler
  scope: string
}

const resources = new Map<string, RegisteredResource>()

/**
 * Register a resource template with the MCP server.
 */
export function registerResource(
  template: MCPResourceTemplate,
  handler: ResourceHandler,
  scope: string,
): void {
  resources.set(template.uriTemplate, { template, handler, scope })
}

/**
 * List all resource templates visible to the given auth context.
 */
export function listResourceTemplates(auth: AuthContext): MCPResourceTemplate[] {
  const visible: MCPResourceTemplate[] = []
  for (const [, resource] of resources) {
    if (hasScope(auth, resource.scope)) {
      visible.push(resource.template)
    }
  }
  return visible
}

/**
 * Read a resource by URI.
 * Matches the URI against registered templates and invokes the handler.
 */
export async function readResource(
  uri: string,
  auth: AuthContext,
  env: Env,
): Promise<MCPResourceContents | { error: string }> {
  // Match URI against registered templates
  for (const [, resource] of resources) {
    if (matchUriTemplate(resource.template.uriTemplate, uri)) {
      if (!hasScope(auth, resource.scope)) {
        return { error: `Access denied for resource: ${uri}` }
      }
      try {
        return await resource.handler(uri, auth, env)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return { error: `Resource error: ${message}` }
      }
    }
  }
  return { error: `Unknown resource: ${uri}` }
}

/**
 * Simple URI template matching.
 * Supports {param} placeholders in templates like "investigation://{id}/summary".
 */
function matchUriTemplate(template: string, uri: string): boolean {
  const regex = template.replace(/\{[^}]+\}/g, '[^/]+')
  return new RegExp(`^${regex}$`).test(uri)
}

/**
 * Get the total number of registered tools (for health checks).
 */
export function getToolCount(): number {
  return tools.size
}

/**
 * Get the total number of registered resource templates.
 */
export function getResourceCount(): number {
  return resources.size
}
