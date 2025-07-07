// Database utilities for handling local JSON files
export const loadDatabase = async (tableName) => {
  try {
    const response = await fetch(`/api/database/${tableName}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${tableName} database`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${tableName} database:`, error);
    // Return empty structure if file doesn't exist
    return getEmptyDatabase(tableName);
  }
};

export const saveDatabase = async (tableName, data) => {
  try {
    const response = await fetch(`/api/database/${tableName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save ${tableName} database`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error saving ${tableName} database:`, error);
    throw error;
  }
};

const getEmptyDatabase = (tableName) => {
  switch (tableName) {
    case 'users':
      return { users: [] };
    case 'profiles':
      return { profiles: [] };
    case 'ratings':
      return { ratings: [] };
    case 'reviews':
      return { reviews: [] };
    case 'invitations':
      return { invitations: [] };
    default:
      return {};
  }
}; 