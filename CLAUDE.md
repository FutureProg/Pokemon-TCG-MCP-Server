# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Server
- **Development mode**: `deno task dev` - Runs with file watching, auto-restart on changes
- **Production mode**: `deno task start` - Runs without file watching

### Required Permissions
The server requires these Deno permissions:
- `--allow-net` - For MCP transport communication
- `--allow-read` - For reading card data JSON files
- `--allow-env` - For environment variables

## Architecture Overview

### MCP Server Structure
This is a Model Context Protocol (MCP) server that provides Pokemon TCG card data and search capabilities. The server exposes card data through:
- **Tools**: For programmatic access to card search and filtering
- **Resources**: For direct access to card datasets
- **Prompts**: For conversational interaction with card data

### Core Components

**main.ts**: Server initialization and transport setup
- Initializes McpServer instance
- Registers card tools and paginated tools
- Sets up StdioServerTransport (HTTP transport commented out)

**src/cardData.ts**: Card data loading
- Loads Pokemon, Trainer, and Energy cards from JSON files in `data/` directory
- Exports typed card arrays for use by tools

**src/tools.ts**: Standard card search tools
- Implements 12+ search tools covering name, type, subtype, attacks, effects
- Each tool has a corresponding prompt for conversational use
- Tools return filtered card data as MCP resources

**src/paginated-tools.ts**: Paginated search tools
- Implements paginated versions of core search functionality
- Supports field filtering (minimal/standard/full) to control response size
- Returns results with pagination metadata

**src/utils.ts**: Utility functions
- `filterCardFields()`: Reduces card data size based on field set selection
- `paginateResults()`: Handles pagination logic and metadata

### Card Data Structure
- Cards are loaded from JSON files containing Standard format cards
- Each card follows the `Card` interface defined in `types.d.ts`
- Cards include Pokemon, Trainer, and Energy types with different field sets
- Key searchable fields: name, types, subtypes, attacks, abilities, rules, effects

### Transport Configuration
The server currently uses StdioServerTransport for CLI/pipe communication. HTTP transport code is present but commented out - uncomment the StreamableHTTPServerTransport setup in main.ts if HTTP access is needed.

### Field Filtering Strategy
The paginated tools implement a three-tier field filtering system:
- **minimal**: Core identification fields only
- **standard**: Essential gameplay fields 
- **full**: All available card data

This prevents response size issues while maintaining flexibility for different use cases.