import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Implementation as ServerImplementation } from "@modelcontextprotocol/sdk/types.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { toReqRes, toFetchResponse } from "fetch-to-node";
import { Hono } from "hono";
import { registerPaginatedCardTools } from "./src/paginated-tools.ts";
import { registerCardTools } from "./src/tools.ts";

export const startHttpServer = (serverArgs: ServerImplementation) => {
    const app = new Hono();
  console.log("Starting Hono Server");
  // No middleware - let the transport handle everything  

  // Handle all MCP requests (GET, POST, DELETE) at a single endpoint
  app.on(['GET', 'POST'],'/', async (c) => {
    // Handle the request using the pre-connected transport
    const originalRequest = await c.req.raw;
    const bodyText = await originalRequest.text();
    // Starting MCP Server Instance
    const server = new McpServer(serverArgs);
        // Register all card tools and prompts
    console.log("Registering tools");
    registerCardTools(server);
    registerPaginatedCardTools(server);
    console.log("Create Streamable HTTP Transport");
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined
    });


    // convert to an MCP request
    const headers = new Headers(originalRequest.headers);
    const host = headers.get("Host");

    // Remove the port
    if (host) {
      headers.set("Host", host.split(":")[0]);
    }

    if (!headers.get("Origin")) {
      try {
        const requestUrl = new URL(originalRequest.url);
        headers.set("Origin", requestUrl.origin);
      } catch (error) {
        console.log("No request origin, falling back to the MCP Server");
      }
    }
    headers.set("Content-Type", "application/json");

    console.log("Convert Request");
    const req = new Request(originalRequest.url, {
      method: originalRequest.method,
      headers,
      body: c.req.method === 'POST' ? bodyText : undefined
    });
    const { req: nodeReq, res: nodeRes } = toReqRes(req);
    // nodeRes.on('close', () => {
    //   transport.close();
    //   server.close();
    // })

    console.log("HANDLE IT");

    await transport.handleRequest(nodeReq, nodeRes);

    console.log("DONE");
    console.log(nodeRes)
    return toFetchResponse(nodeRes);
  });

  Deno.serve(app.fetch);
}