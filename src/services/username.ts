// src/services/username.ts

const USERNAME_STORAGE_KEY = 'relay_usernames';

interface UserProfile {
  address: string;
  username: string;
  createdAt: number;
}

// Get all stored usernames
const getAllUsernames = (): Record<string, UserProfile> => {
  const stored = localStorage.getItem(USERNAME_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

// Set username for an address
export const setUsername = (address: string, username: string): void => {
  const usernames = getAllUsernames();
  usernames[address] = {
    address,
    username,
    createdAt: Date.now()
  };
  localStorage.setItem(USERNAME_STORAGE_KEY, JSON.stringify(usernames));
};

// Get username for an address
export const getUsername = (address: string): string | null => {
  const usernames = getAllUsernames();
  return usernames[address]?.username || null;
};

// Get address by username
export const getAddressByUsername = (username: string): string | null => {
  const usernames = getAllUsernames();
  for (const [address, profile] of Object.entries(usernames)) {
    if (profile.username.toLowerCase() === username.toLowerCase()) {
      return address;
    }
  }
  return null;
};

// Check if username is taken
export const isUsernameTaken = (username: string, excludeAddress?: string): boolean => {
  const usernames = getAllUsernames();
  for (const [address, profile] of Object.entries(usernames)) {
    if (address !== excludeAddress && profile.username.toLowerCase() === username.toLowerCase()) {
      return true;
    }
  }
  return false;
};

// Get display name (username or shortened address)
export const getDisplayName = (address: string): string => {
  const username = getUsername(address);
  if (username) return username;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
