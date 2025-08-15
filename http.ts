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
  app.post('/', async (c) => {
    // Handle the request using the pre-connected transport
    const originalRequest = await c.req.raw;
    const bodyText = await originalRequest.text();
    // Starting MCP Server Instance
    const server = new McpServer(serverArgs, {enforceStrictCapabilities: true});
        // Register all card tools and prompts
    registerCardTools(server);
    registerPaginatedCardTools(server);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined
    });


    // convert to an MCP request
    const headers = new Headers(originalRequest.headers);
    // const host = headers.get("Host");

    // // Remove the port
    // if (host) {
    //   headers.set("Host", host.split(":")[0]);
    // }

    // if (!headers.get("Origin")) {
    //   try {
    //     const requestUrl = new URL(originalRequest.url);
    //     headers.set("Origin", requestUrl.origin);
    //   } catch (_error: unknown) {
    //     console.log("No request origin, falling back to the MCP Server");
    //   }
    // }
    headers.set("Content-Type", "application/json");

    console.log("Convert Request");
    const req = new Request(originalRequest.url, {
      method: originalRequest.method,
      headers,
      body: bodyText
    });
    const { req: nodeReq, res: nodeRes } = toReqRes(req);
    nodeRes.on('close', () => {
      console.log("Request closed");
      transport.close();
      server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(nodeReq, nodeRes, bodyText);    
    console.log("Request handled by MCP Server");
    return toFetchResponse(nodeRes);
  });

  app.delete('/', async (c) => {
    let denoReq = new Request(c.req.raw.url, {
      method: 'DELETE',
      headers: new Headers(c.req.raw.headers),
      body: await c.req.raw.text()
    });

    const {res, req} = toReqRes(denoReq);
    res.writeHead(405).end(JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed."
      },
      id: null
    }));

    return toFetchResponse(res);
  });

  Deno.serve(app.fetch);
}