/**
 * Generates a deep link URL for claiming an escrow contract
 * 
 * @param contractId - The unique identifier of the escrow contract
 * @param amount - Optional amount to pre-fill in the claim form
 * @returns Full URL string for the claim page
 * 
 * @example
 * generateEscrowLink('CCYIE3WDF5EEC4DL25JR2O4SAV2G3USARIBMCLWPIFQVUOIVDEN5FWI')
 * // => 'https://lynxx.app/claim?c=CCYIE3WDF5EEC4DL25JR2O4SAV2G3USARIBMCLWPIFQVUOIVDEN5FWI'
 * 
 * generateEscrowLink('CCYIE3WDF5EEC4DL25JR2O4SAV2G3USARIBMCLWPIFQVUOIVDEN5FWI', 1000)
 * // => 'https://lynxx.app/claim?c=CCYIE3WDF5EEC4DL25JR2O4SAV2G3USARIBMCLWPIFQVUOIVDEN5FWI&amt=1000'
 */
export function generateEscrowLink(contractId: string, amount?: number): string {
  // Validate contractId
  if (!contractId || contractId.trim() === '') {
    throw new Error('contractId is required and cannot be empty');
  }

  // Base URL - using environment variable if available, otherwise default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lynxx.app';
  
  // Build the URL
  let url = `${baseUrl}/claim?c=${encodeURIComponent(contractId)}`;
  
  // Add amount if provided
  if (amount !== undefined && amount > 0) {
    url += `&amt=${encodeURIComponent(amount)}`;
  }
  
  return url;
}

/**
 * Parses an escrow link and extracts the contract ID and amount
 * 
 * @param url - The full escrow link URL
 * @returns Object containing contractId and optional amount
 * 
 * @example
 * parseEscrowLink('https://lynxx.app/claim?c=CCYIE3WDF5EEC4DL25JR2O4SAV2G3USARIBMCLWPIFQVUOIVDEN5FWI&amt=1000')
 * // => { contractId: 'CCYIE3WDF5EEC4DL25JR2O4SAV2G3USARIBMCLWPIFQVUOIVDEN5FWI', amount: 1000 }
 */
export function parseEscrowLink(url: string): { contractId: string; amount?: number } {
  try {
    const urlObj = new URL(url);
    
    // Get contractId from 'c' parameter
    const contractId = urlObj.searchParams.get('c');
    if (!contractId) {
      throw new Error('Invalid escrow link: missing contractId (c parameter)');
    }
    
    // Get amount from 'amt' parameter if present
    const amountParam = urlObj.searchParams.get('amt');
    const amount = amountParam ? Number(amountParam) : undefined;
    
    return { contractId, amount };
  } catch (error) {
    throw new Error(`Failed to parse escrow link: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}
