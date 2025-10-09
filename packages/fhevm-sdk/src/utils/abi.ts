/**
 * ABI utilities for contract interaction
 */

import { Contract, Interface, JsonRpcSigner } from 'ethers';

/**
 * Create a contract instance
 */
export function createContract(
  address: string,
  abi: any[],
  signerOrProvider: JsonRpcSigner
): Contract {
  return new Contract(address, abi, signerOrProvider);
}

/**
 * Parse contract ABI to extract function signatures
 */
export function parseABI(abi: any[]): {
  functions: string[];
  events: string[];
} {
  const iface = new Interface(abi);

  const functions = Object.keys(iface.functions);
  const events = Object.keys(iface.events);

  return { functions, events };
}

/**
 * Get function selector (4-byte signature)
 */
export function getFunctionSelector(abi: any[], functionName: string): string {
  const iface = new Interface(abi);
  const fragment = iface.getFunction(functionName);

  if (!fragment) {
    throw new Error(`Function ${functionName} not found in ABI`);
  }

  return iface.getFunction(functionName)!.selector;
}

/**
 * Encode function call data
 */
export function encodeFunctionData(
  abi: any[],
  functionName: string,
  args: any[]
): string {
  const iface = new Interface(abi);
  return iface.encodeFunctionData(functionName, args);
}

/**
 * Decode function result
 */
export function decodeFunctionResult(
  abi: any[],
  functionName: string,
  data: string
): any {
  const iface = new Interface(abi);
  return iface.decodeFunctionResult(functionName, data);
}

/**
 * Parse event logs
 */
export function parseEventLogs(
  abi: any[],
  logs: any[]
): Array<{ eventName: string; args: any }> {
  const iface = new Interface(abi);
  const parsed: Array<{ eventName: string; args: any }> = [];

  for (const log of logs) {
    try {
      const parsedLog = iface.parseLog(log);
      if (parsedLog) {
        parsed.push({
          eventName: parsedLog.name,
          args: parsedLog.args,
        });
      }
    } catch (error) {
      // Skip logs that don't match this ABI
      continue;
    }
  }

  return parsed;
}
