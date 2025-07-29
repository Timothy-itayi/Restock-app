/**
 * Shared validation utilities for authentication and user input
 */

/**
 * Validates email signup input
 * @param {Object} userInput - The user input object
 * @param {string} userInput.storeName - Store name
 * @param {string} userInput.name - User name
 * @param {string} userInput.password - Password
 * @param {string} userInput.email - Email address
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export function validateEmailSignup(userInput) {
  const errors = [];
  
  if (!userInput.storeName?.trim()) {
    errors.push('Store name is required');
  }
  
  if (!userInput.name?.trim()) {
    errors.push('First name is required for email signup');
  }
  
  if (!userInput.password?.trim()) {
    errors.push('Password is required');
  }
  
  if (userInput.password && userInput.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!userInput.email?.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(userInput.email)) {
    errors.push('Please enter a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates store name
 * @param {string} storeName - Store name to validate
 * @returns {Object} Validation result
 */
export function validateStoreName(storeName) {
  const errors = [];
  
  if (!storeName?.trim()) {
    errors.push('Store name is required');
  } else if (storeName.trim().length < 2) {
    errors.push('Store name must be at least 2 characters');
  } else if (storeName.trim().length > 50) {
    errors.push('Store name must be less than 50 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates user name
 * @param {string} name - User name to validate
 * @returns {Object} Validation result
 */
export function validateUserName(name) {
  const errors = [];
  
  if (!name?.trim()) {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (name.trim().length > 100) {
    errors.push('Name must be less than 100 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export function validatePassword(password) {
  const errors = [];
  
  if (!password?.trim()) {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Processes name for email signup vs other flows
 * @param {string} name - Name to process
 * @param {boolean} isEmailSignup - Whether this is for email signup
 * @returns {string} Processed name
 */
export function processNameForEmailSignup(name, isEmailSignup) {
  if (isEmailSignup) {
    // For email signup, use the manually entered name
    return name?.trim() || '';
  } else {
    // For other flows, use extracted name or fallback
    return name || '';
  }
}

/**
 * Extracts name from user object with fallback logic
 * @param {Object} user - User object from Clerk
 * @returns {string} Extracted name
 */
export function extractNameFromUser(user) {
  if (!user) return '';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  } else if (user.firstName) {
    return user.firstName;
  } else if (user.lastName) {
    return user.lastName;
  } else if (user.fullName) {
    return user.fullName;
  } else if (user.username) {
    return user.username;
  }
  
  return '';
}

/**
 * Validates complete user profile data
 * @param {Object} profile - User profile object
 * @returns {Object} Validation result
 */
export function validateUserProfile(profile) {
  const errors = [];
  
  if (!profile?.id) {
    errors.push('User ID is required');
  }
  
  if (!profile?.email) {
    errors.push('Email is required');
  } else if (!isValidEmail(profile.email)) {
    errors.push('Valid email is required');
  }
  
  if (!profile?.store_name) {
    errors.push('Store name is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 