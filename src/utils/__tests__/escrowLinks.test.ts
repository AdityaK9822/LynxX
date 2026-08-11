import { generateEscrowLink, parseEscrowLink } from '../escrowLinks';

describe('generateEscrowLink', () => {
  const contractId = 'CCYIE3WDF5EEC4DL25JR2O4SAV2G3USARIBMCLWPIFQVUOIVDEN5FWI';
  const baseUrl = 'https://lynxx.app';

  it('generates URL with contractId only', () => {
    const url = generateEscrowLink(contractId);
    expect(url).toBe(`${baseUrl}/claim?c=${contractId}`);
  });

  it('generates URL with contractId and amount', () => {
    const amount = 1000;
    const url = generateEscrowLink(contractId, amount);
    expect(url).toBe(`${baseUrl}/claim?c=${contractId}&amt=1000`);
  });

  it('generates URL with different amount values', () => {
    const testAmounts = [0, 1, 500, 10000];
    testAmounts.forEach(amount => {
      const url = generateEscrowLink(contractId, amount);
      if (amount > 0) {
        expect(url).toContain(`&amt=${amount}`);
      } else {
        expect(url).not.toContain('&amt=');
      }
    });
  });

  it('handles contractId with special characters by encoding them', () => {
    const idWithSpecialChars = 'test+id/with?special&chars';
    const url = generateEscrowLink(idWithSpecialChars);
    expect(url).toContain(`?c=${encodeURIComponent(idWithSpecialChars)}`);
  });

  it('throws error when contractId is empty', () => {
    expect(() => generateEscrowLink('')).toThrow('contractId is required and cannot be empty');
  });

  it('throws error when contractId is only whitespace', () => {
    expect(() => generateEscrowLink('   ')).toThrow('contractId is required and cannot be empty');
  });

  it('uses custom base URL from environment variable if set', () => {
    const originalEnv = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = 'https://custom.example.com';
    
    const url = generateEscrowLink(contractId);
    expect(url).toBe('https://custom.example.com/claim?c=' + contractId);
    
    // Restore environment
    process.env.NEXT_PUBLIC_APP_URL = originalEnv;
  });
});

describe('parseEscrowLink', () => {
  const contractId = 'CCYIE3WDF5EEC4DL25JR2O4SAV2G3USARIBMCLWPIFQVUOIVDEN5FWI';
  const baseUrl = 'https://lynxx.app';

  it('parses URL with contractId only', () => {
    const url = `${baseUrl}/claim?c=${contractId}`;
    const result = parseEscrowLink(url);
    expect(result).toEqual({ contractId });
  });

  it('parses URL with contractId and amount', () => {
    const url = `${baseUrl}/claim?c=${contractId}&amt=1000`;
    const result = parseEscrowLink(url);
    expect(result).toEqual({ contractId, amount: 1000 });
  });

  it('parses URL with different amount values', () => {
    const testAmounts = [0, 1, 500, 10000];
    testAmounts.forEach(amount => {
      const url = `${baseUrl}/claim?c=${contractId}&amt=${amount}`;
      const result = parseEscrowLink(url);
      expect(result).toEqual({ contractId, amount });
    });
  });

  it('throws error when URL is invalid', () => {
    expect(() => parseEscrowLink('not-a-url')).toThrow('Failed to parse escrow link');
  });

  it('throws error when URL is missing contractId', () => {
    const url = `${baseUrl}/claim`;
    expect(() => parseEscrowLink(url)).toThrow('Invalid escrow link: missing contractId (c parameter)');
  });

  it('handles URLs with encoded parameters', () => {
    const encodedId = encodeURIComponent('test+id/with?special&chars');
    const url = `${baseUrl}/claim?c=${encodedId}`;
    const result = parseEscrowLink(url);
    expect(result.contractId).toBe('test+id/with?special&chars');
  });

  it('handles URLs with additional query parameters', () => {
    const url = `${baseUrl}/claim?c=${contractId}&extra=param&another=value&amt=500`;
    const result = parseEscrowLink(url);
    expect(result).toEqual({ contractId, amount: 500 });
  });
});
