// Utility functions for the Pokemon TCG MCP Server

/**
 * Filters card data to include only essential fields
 * This reduces the size of the response and helps prevent Claude from hitting message size limits
 */
export const filterCardFields = (cards: any[], fieldSet: 'minimal' | 'standard' | 'full' = 'standard'): any[] => {
  if (fieldSet === 'full') {
    return cards; // Return all fields
  }
  
  // Define field sets
  const minimalFields = ['id', 'name', 'supertype', 'subtypes', 'types'];
  const standardFields = [
    ...minimalFields,
    'hp', 'evolvesFrom', 'evolvesTo', 
    'attacks', 'abilities',
    'weaknesses', 'resistances', 'retreatCost',
    'images'
  ];
  
  // Select which fields to keep based on fieldSet parameter
  const fieldsToKeep = fieldSet === 'minimal' ? minimalFields : standardFields;
  
  // Filter the cards
  return cards.map(card => {
    const filteredCard: Record<string, any> = {};
    
    // Only copy fields that are in our fieldsToKeep list
    fieldsToKeep.forEach(field => {
      if (card[field] !== undefined) {
        filteredCard[field] = card[field];
      }
    });
    
    return filteredCard;
  });
};

/**
 * Handles pagination for card results
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export const paginateResults = <T>(results: T[], options: PaginationOptions = {}): {
  results: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalResults: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
} => {
  const page = options.page || 1;
  const pageSize = options.pageSize || 10;
  const totalResults = results.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  
  // Calculate indices
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResults);
  
  // Get page of results
  const paginatedResults = results.slice(startIndex, endIndex);
  
  return {
    results: paginatedResults,
    pagination: {
      page,
      pageSize,
      totalPages,
      totalResults,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    }
  };
};
