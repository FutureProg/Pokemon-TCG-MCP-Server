import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const baseUrl = "http://localhost:8000/";
const client = new Client({
    name: 'test-http-client',
    version: '1.0.0'
});
const transport = new StreamableHTTPClientTransport(
    new URL(baseUrl)
);
try {
    console.log("Connect");
    await client.connect(transport);
} catch(error) {
    console.log("Error connecting to transport:", error);
}

console.log("QUERY");
const result = await client.callTool({
    name: "find-card-by-name",
    arguments: {
        name: "Fuecoco"
    }    
});

console.log(result);