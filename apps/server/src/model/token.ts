/**
 * Temporary JWT Token interfaces
 */

/**
 * Login Token, generated by UAAA for user login
 */
export interface ILoginToken {
  type: 'login'
  userId: string
}

/**
 * Agent Claim Token, generated by agent to claim its identity to targetAgent
 */
export interface IAgentClaimToken {
  type: 'agent-claim'
  targetAgentId: string
}

/**
 * Delegation Claim Token, generated by UAAA for agent to claim its delegation
 */
export interface IDelegationClaimToken {
  type: 'delegation-claim'
  userId: string
  agentId: string
  config: unknown
}
