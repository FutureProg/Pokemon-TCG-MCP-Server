/**
 * Integration Test Suite for Pokemon TCG MCP Server
 * 
 * Run with: deno test --allow-net --allow-read --allow-env integration.test.ts
 * (the jsr:@std/assert module is unreachable for some reason...)
 */

// Simple assertion helpers
function assertEquals<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertExists<T>(value: T, message?: string): asserts value is NonNullable<T> {
  if (value == null) {
    throw new Error(message || "Value is null or undefined");
  }
}

// Global test client instance
let testClient: MCPTestClient;

interface MCPRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

class MCPTestClient {
  private baseUrl: string;
  private requestId = 1;
  private initialized = false;

  constructor(baseUrl = "http://localhost:8000/mcp") {
    this.baseUrl = baseUrl;
  }

  private async makeRequest(method: string, params?: Record<string, unknown>): Promise<MCPResponse> {
    const request: MCPRequest = {
      jsonrpc: "2.0",
      id: this.requestId++,
      method,
      params
    };

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream"
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    
    // Handle Server-Sent Events format
    if (text.startsWith("event: message\ndata: ")) {
      const jsonStr = text.replace("event: message\ndata: ", "").trim();
      return JSON.parse(jsonStr);
    }
    
    return JSON.parse(text);
  }

  private async initialize(): Promise<void> {
    const response = await this.makeRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    });

    if (response.error) {
      throw new Error(`Initialization failed: ${response.error.message}`);
    }

    this.initialized = true;
  }

  async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  async testToolsList(): Promise<void> {
    console.log("🔧 Testing tools/list...");
    const response = await this.makeRequest("tools/list");
    
    assertExists(response.result, "No result returned");

    const result = response.result as { tools?: { name: string }[] };
    assertExists(result.tools, "No tools array returned");
    assertEquals(Array.isArray(result.tools), true, "Tools should be an array");

    const tools = result.tools!;
    const expectedTools = [
      "find-card-by-name",
      "find-cards-with-self-damage", 
      "find-cards-by-type",
      "find-cards-by-subtype",
      "find-cards-by-attack-energy",
      "find-cards-by-evolutionary-line",
      "find-cards-by-energy-functionality",
      "fuzzy-search-cards",
      "multi-criteria-search-cards",
      "find-cards-by-effect-text",
      "paginated-card-search",
      "paginated-effect-search",
      "paginated-type-search"
    ];

    const toolNames = tools.map(tool => tool.name);
    
    for (const expectedTool of expectedTools) {
      assertEquals(toolNames.includes(expectedTool), true, `Missing expected tool: ${expectedTool}`);
    }

    console.log(`✅ Found ${tools.length} tools (expected ${expectedTools.length})`);
  }

  async testResourcesList(): Promise<void> {
    console.log("📦 Testing resources/list...");
    const response = await this.makeRequest("resources/list");
    
    assertExists(response.result, "No result returned");

    const result = response.result as { resources?: unknown[] };
    assertExists(result.resources, "No resources array returned");
    assertEquals(Array.isArray(result.resources), true, "Resources should be an array");

    const resources = result.resources!;
    console.log(`✅ Found ${resources.length} resources`);
  }

  async testFindCardByName(): Promise<void> {
    console.log("🔍 Testing find-card-by-name...");
    const response = await this.makeRequest("tools/call", {
      name: "find-card-by-name",
      arguments: { name: "Pikachu" }
    });

    assertExists(response.result, "No result returned");

    const result = response.result as { content?: { resource?: { text?: string } }[] };
    assertExists(result.content, "No content in response");
    assertEquals(Array.isArray(result.content), true, "Content should be an array");
    assertExists(result.content![0]?.resource?.text, "No text in resource");

    const cards = JSON.parse(result.content![0]!.resource!.text!);
    assertEquals(Array.isArray(cards), true, "Cards should be an array");
    assertEquals(cards.length > 0, true, "Should find at least one Pikachu card");

    // Verify card structure
    const firstCard = cards[0] as Record<string, unknown>;
    const requiredFields = ["id", "name", "supertype", "types"];
    for (const field of requiredFields) {
      assertEquals(field in firstCard, true, `Missing required field: ${field}`);
    }

    console.log(`✅ Found ${cards.length} Pikachu cards`);
  }

  async testFindCardsByType(): Promise<void> {
    console.log("⚡ Testing find-cards-by-type...");
    const response = await this.makeRequest("tools/call", {
      name: "find-cards-by-type",
      arguments: { type: "Lightning" }
    });

    assertExists(response.result, "No result returned");

    const result = response.result as { content?: { resource?: { text?: string } }[] };
    assertExists(result.content, "No content in response");
    assertEquals(Array.isArray(result.content), true, "Content should be an array");
    assertExists(result.content![0]?.resource?.text, "No text in resource");

    const cards = JSON.parse(result.content![0]!.resource!.text!);
    assertEquals(Array.isArray(cards), true, "Cards should be an array");
    assertEquals(cards.length > 0, true, "Should find Lightning type cards");

    // Verify all cards are Lightning type
    for (const card of cards.slice(0, 5)) { // Check first 5 cards
      const cardData = card as { name?: string; types?: string[] };
      assertExists(cardData.types, `Card ${cardData.name} missing types`);
      assertEquals(cardData.types!.includes("Lightning"), true, `Card ${cardData.name} is not Lightning type`);
    }

    console.log(`✅ Found ${cards.length} Lightning type cards`);
  }

  async testFuzzySearch(): Promise<void> {
    console.log("🔍 Testing fuzzy-search-cards...");
    const response = await this.makeRequest("tools/call", {
      name: "fuzzy-search-cards",
      arguments: { query: "thunder", limit: 5 }
    });

    assertExists(response.result, "No result returned");

    const result = response.result as { content?: { resource?: { text?: string } }[] };
    assertExists(result.content, "No content in response");
    assertEquals(Array.isArray(result.content), true, "Content should be an array");
    assertExists(result.content![0]?.resource?.text, "No text in resource");

    const cards = JSON.parse(result.content![0]!.resource!.text!);
    assertEquals(Array.isArray(cards), true, "Cards should be an array");
    assertEquals(cards.length <= 5, true, `Expected max 5 cards, got ${cards.length}`);

    console.log(`✅ Fuzzy search returned ${cards.length} cards for "thunder"`);
  }

  async testPaginatedSearch(): Promise<void> {
    console.log("📄 Testing paginated-card-search...");
    const response = await this.makeRequest("tools/call", {
      name: "paginated-card-search",
      arguments: { 
        query: "Fire", 
        page: 1, 
        pageSize: 10,
        fieldSet: "minimal"
      }
    });

    assertExists(response.result, "No result returned");

    const result = response.result as { content?: { resource?: { text?: string } }[] };
    assertExists(result.content, "No content in response");
    assertEquals(Array.isArray(result.content), true, "Content should be an array");
    assertExists(result.content![0]?.resource?.text, "No text in resource");

    const data = JSON.parse(result.content![0]!.resource!.text!) as { 
      cards?: unknown[]; 
      pagination?: { page?: number; total?: number } 
    };
    
    assertExists(data.cards, "No cards array in response");
    assertEquals(Array.isArray(data.cards), true, "Cards should be an array");
    assertExists(data.pagination, "No pagination info in response");
    assertEquals(data.cards!.length <= 10, true, `Expected max 10 cards, got ${data.cards!.length}`);

    console.log(`✅ Paginated search returned ${data.cards!.length} cards`);
    console.log(`   Pagination: page ${data.pagination!.page}, total ${data.pagination!.total}`);
  }

  async testSelfDamageCards(): Promise<void> {
    console.log("💥 Testing find-cards-with-self-damage...");
    const response = await this.makeRequest("tools/call", {
      name: "find-cards-with-self-damage",
      arguments: {}
    });

    assertExists(response.result, "No result returned");

    const result = response.result as { content?: { resource?: { text?: string } }[] };
    assertExists(result.content, "No content in response");
    assertEquals(Array.isArray(result.content), true, "Content should be an array");
    assertExists(result.content![0]?.resource?.text, "No text in resource");

    const cards = JSON.parse(result.content![0]!.resource!.text!);
    assertEquals(Array.isArray(cards), true, "Cards should be an array");

    // Verify cards have self-damage attacks if any cards found
    if (cards.length > 0) {
      const firstCard = cards[0] as { attacks?: unknown[] };
      assertExists(firstCard.attacks, "Card missing attacks array");
      assertEquals(Array.isArray(firstCard.attacks), true, "Attacks should be an array");
    }

    console.log(`✅ Found ${cards.length} cards with self-damage`);
  }

  async testErrorHandling(): Promise<void> {
    console.log("🚫 Testing error handling...");
    // Test invalid tool name
    const response = await this.makeRequest("tools/call", {
      name: "non-existent-tool",
      arguments: {}
    });

    assertExists(response.error, "Expected error for invalid tool name");
    console.log(`✅ Error handling works: ${response.error!.message}`);
  }
}

// Server health check utility
async function checkServerHealth(): Promise<void> {
  console.log("🏥 Checking server health...");
  const response = await fetch("http://localhost:8000/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 0,
      method: "tools/list"
    })
  });

  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`);
  }

  console.log("✅ Server is healthy and responding\n");
}

// Initialize test client before tests
Deno.test({
  name: "Server Health Check",
  async fn() {
    await checkServerHealth();
    testClient = new MCPTestClient();
    await testClient.ensureInitialized();
  },
});

// Individual test cases
Deno.test({
  name: "Tools List",
  async fn() {
    await testClient.testToolsList();
  },
});

Deno.test({
  name: "Resources List", 
  async fn() {
    await testClient.testResourcesList();
  },
});

Deno.test({
  name: "Find Card by Name",
  async fn() {
    await testClient.testFindCardByName();
  },
});

Deno.test({
  name: "Find Cards by Type",
  async fn() {
    await testClient.testFindCardsByType();
  },
});

Deno.test({
  name: "Fuzzy Search",
  async fn() {
    await testClient.testFuzzySearch();
  },
});

Deno.test({
  name: "Paginated Search",
  async fn() {
    await testClient.testPaginatedSearch();
  },
});

Deno.test({
  name: "Self Damage Cards",
  async fn() {
    await testClient.testSelfDamageCards();
  },
});

Deno.test({
  name: "Error Handling",
  async fn() {
    await testClient.testErrorHandling();
  },
});
