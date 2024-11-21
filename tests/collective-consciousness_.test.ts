import { describe, it, beforeEach, expect } from 'vitest';

// Simulated contract state
let thoughts: Map<number, { content: string, timestamp: number, category: string }>;
let userThoughts: Map<string, number[]>;
let categoryThoughts: Map<string, number[]>;
let contractOwner: string;
let nextThoughtId: number;

// Simulated contract functions
function submitThought(user: string, content: string, category: string): { success: boolean; result?: number; error?: string } {
  if (content.length === 0) {
    return { success: false, error: "Invalid content" };
  }
  if (category.length === 0) {
    return { success: false, error: "Invalid category" };
  }
  const thoughtId = nextThoughtId++;
  const timestamp = Date.now();
  thoughts.set(thoughtId, { content, timestamp, category });
  
  const userThoughtList = userThoughts.get(user) || [];
  userThoughtList.push(thoughtId);
  userThoughts.set(user, userThoughtList);
  
  const categoryThoughtList = categoryThoughts.get(category) || [];
  categoryThoughtList.push(thoughtId);
  categoryThoughts.set(category, categoryThoughtList);
  
  return { success: true, result: thoughtId };
}

function getThought(thoughtId: number): { content: string, timestamp: number, category: string } | undefined {
  return thoughts.get(thoughtId);
}

function getUserThoughts(user: string): number[] {
  return userThoughts.get(user) || [];
}

function getCategoryThoughts(category: string): number[] {
  return categoryThoughts.get(category) || [];
}

function deleteThought(caller: string, thoughtId: number): { success: boolean; error?: string } {
  if (caller !== contractOwner) {
    return { success: false, error: "Not authorized" };
  }
  if (!thoughts.has(thoughtId)) {
    return { success: false, error: "Thought not found" };
  }
  thoughts.delete(thoughtId);
  return { success: true };
}

describe('Collective Consciousness Contract', () => {
  beforeEach(() => {
    thoughts = new Map();
    userThoughts = new Map();
    categoryThoughts = new Map();
    contractOwner = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    nextThoughtId = 0;
  });
  
  it('should submit a thought', () => {
    const user = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const content = 'This is a test thought';
    const category = 'test';
    const result = submitThought(user, content, category);
    expect(result.success).toBe(true);
    expect(result.result).toBe(0);
    expect(thoughts.size).toBe(1);
    expect(userThoughts.get(user)).toContain(0);
    expect(categoryThoughts.get(category)).toContain(0);
  });
  
  it('should not submit a thought with empty content', () => {
    const user = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const content = '';
    const category = 'test';
    const result = submitThought(user, content, category);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid content");
  });
  
  it('should retrieve a thought', () => {
    const user = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const content = 'This is a test thought';
    const category = 'test';
    const submitResult = submitThought(user, content, category);
    const thought = getThought(submitResult.result!);
    expect(thought).toBeDefined();
    expect(thought!.content).toBe(content);
    expect(thought!.category).toBe(category);
  });
  
  it('should retrieve user thoughts', () => {
    const user = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    submitThought(user, 'Thought 1', 'category1');
    submitThought(user, 'Thought 2', 'category2');
    const userThoughtIds = getUserThoughts(user);
    expect(userThoughtIds).toHaveLength(2);
    expect(userThoughtIds).toContain(0);
    expect(userThoughtIds).toContain(1);
  });
  
  it('should retrieve category thoughts', () => {
    const user1 = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const user2 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    const category = 'shared_category';
    submitThought(user1, 'Thought 1', category);
    submitThought(user2, 'Thought 2', category);
    const categoryThoughtIds = getCategoryThoughts(category);
    expect(categoryThoughtIds).toHaveLength(2);
    expect(categoryThoughtIds).toContain(0);
    expect(categoryThoughtIds).toContain(1);
  });
  
  it('should delete a thought (contract owner only)', () => {
    const user = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const content = 'This is a test thought';
    const category = 'test';
    const submitResult = submitThought(user, content, category);
    const deleteResult = deleteThought(contractOwner, submitResult.result!);
    expect(deleteResult.success).toBe(true);
    expect(thoughts.size).toBe(0);
  });
  
  it('should not allow non-owner to delete a thought', () => {
    const user = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const nonOwner = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    const content = 'This is a test thought';
    const category = 'test';
    const submitResult = submitThought(user, content, category);
    const deleteResult = deleteThought(nonOwner, submitResult.result!);
    expect(deleteResult.success).toBe(false);
    expect(deleteResult.error).toBe("Not authorized");
    expect(thoughts.size).toBe(1);
  });
});

