import { loadDatabase, saveDatabase } from './databaseUtils';

export const authenticateUser = async (email, password) => {
  try {
    const database = await loadDatabase('users');
    const user = database.users.find(u => 
      u.email === email && 
      u.password === password && 
      u.isActive === true
    );
    
    if (user) {
      // Update last login
      const updatedUser = {
        ...user,
        lastLogin: new Date().toISOString()
      };
      
      // Update database
      const updatedDatabase = {
        ...database,
        users: database.users.map(u => 
          u.id === user.id ? updatedUser : u
        )
      };
      
      await saveDatabase('users', updatedDatabase);
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    }
    
    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

export const getProfilesForUser = async (userId) => {
  try {
    const database = await loadDatabase('profiles');
    return database.profiles.filter(profile => 
      profile.userId === userId && profile.isActive === true
    );
  } catch (error) {
    console.error('Error loading profiles:', error);
    return [];
  }
};

export const createProfile = async (userId, profileData) => {
  try {
    const database = await loadDatabase('profiles');
    const newProfile = {
      id: `profile_${Date.now()}`,
      userId,
      ...profileData,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    const updatedDatabase = {
      ...database,
      profiles: [...database.profiles, newProfile]
    };
    
    await saveDatabase('profiles', updatedDatabase);
    return newProfile;
  } catch (error) {
    console.error('Error creating profile:', error);
    return null;
  }
};

export const updateProfile = async (profileId, updates) => {
  try {
    const database = await loadDatabase('profiles');
    const updatedDatabase = {
      ...database,
      profiles: database.profiles.map(profile =>
        profile.id === profileId 
          ? { ...profile, ...updates, updatedAt: new Date().toISOString() }
          : profile
      )
    };
    
    await saveDatabase('profiles', updatedDatabase);
    return updatedDatabase.profiles.find(p => p.id === profileId);
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
};

export const deleteProfile = async (profileId) => {
  try {
    const database = await loadDatabase('profiles');
    const updatedDatabase = {
      ...database,
      profiles: database.profiles.map(profile =>
        profile.id === profileId 
          ? { ...profile, isActive: false }
          : profile
      )
    };
    
    await saveDatabase('profiles', updatedDatabase);
    return true;
  } catch (error) {
    console.error('Error deleting profile:', error);
    return false;
  }
}; 