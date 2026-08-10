import { describe, it, expect, vi, beforeEach } from "vitest";
import { Account, TransactionBuilder, Networks, Contract } from "@stellar/stellar-sdk";
import { 
  DEFAULT_ESCROW_CONTRACT_ID, 
  SOROBAN_RPC_URL, 
  HORIZON_URL,
  submitEscrowDeposit,
  submitEscrowRelease,
  servers
} from "../lib/escrowContract";

const TEST_PUBLIC_KEY = "GDDYMQKZNWBIMY67MCNRPBBZQAHSQABQTK42UXY7RRKHUGINXFMREFJI";

// Generate a valid XDR for tests
function getValidTxXdr() {
  const dummyAcc = new Account(TEST_PUBLIC_KEY, "100");
  const contract = new Contract(DEFAULT_ESCROW_CONTRACT_ID);
  const tx = new TransactionBuilder(dummyAcc, {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call("deposit"))
    .setTimeout(30)
    .build();
  return tx.toXDR();
}

// Mock Wallet module
vi.mock("../components/Wallet", () => ({
  kit: {
    signTransaction: vi.fn().mockImplementation(async (xdr) => ({ signedTxXdr: xdr })),
  },
  connectWallet: vi.fn().mockImplementation(async () => TEST_PUBLIC_KEY),
}));

describe("escrowContract Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("exports correct default contract ID and URLs", () => {
    expect(DEFAULT_ESCROW_CONTRACT_ID).toBe("CCIYIE3WDF5EEC4DL25JR2O4SAV2G3USARIBMCLWPIFQVUOIVDEN5FWI");
    expect(SOROBAN_RPC_URL).toBe("https://soroban-testnet.stellar.org");
    expect(HORIZON_URL).toBe("https://horizon-testnet.stellar.org");
  });

  it("throws error when deposit is invoked with unfunded account", async () => {
    const mockHorizon = {
      loadAccount: vi.fn().mockRejectedValue(new Error("Account not found")),
    };
    vi.spyOn(servers, "getHorizonServer").mockReturnValue(mockHorizon);

    await expect(
      submitEscrowDeposit({
        senderAddress: TEST_PUBLIC_KEY,
        amount: 10,
      })
    ).rejects.toThrow(/is not funded on Stellar Testnet/);
  });

  it("submits deposit transaction successfully when account is funded", async () => {
    const mockHorizon = {
      loadAccount: vi.fn().mockResolvedValue(new Account(TEST_PUBLIC_KEY, "100")),
      submitTransaction: vi.fn().mockResolvedValue({ hash: "0x_mock_horizon_hash" }),
    };
    const mockRpc = {
      simulateTransaction: vi.fn().mockResolvedValue({ error: "none" }),
      sendTransaction: vi.fn().mockResolvedValue({ status: "SUCCESS", hash: "0x_mock_soroban_tx_hash" }),
      getTransaction: vi.fn().mockResolvedValue({ status: "SUCCESS" }),
    };

    vi.spyOn(servers, "getHorizonServer").mockReturnValue(mockHorizon);
    vi.spyOn(servers, "getRpcServer").mockReturnValue(mockRpc);

    const states = [];
    const res = await submitEscrowDeposit({
      senderAddress: TEST_PUBLIC_KEY,
      amount: 25,
      token: "USDC",
      onStateChange: (st) => states.push(st.step),
    });

    expect(res.success).toBe(true);
    expect(res.contractId).toBe(DEFAULT_ESCROW_CONTRACT_ID);
    expect(states).toContain("simulating");
    expect(states).toContain("signing");
    expect(states).toContain("submitting");
    expect(states).toContain("success");
  });

  it("submits release transaction successfully", async () => {
    const mockHorizon = {
      loadAccount: vi.fn().mockResolvedValue(new Account(TEST_PUBLIC_KEY, "100")),
      submitTransaction: vi.fn().mockResolvedValue({ hash: "0x_mock_horizon_hash" }),
    };
    const mockRpc = {
      simulateTransaction: vi.fn().mockResolvedValue({ error: "none" }),
      sendTransaction: vi.fn().mockResolvedValue({ status: "SUCCESS", hash: "0x_mock_soroban_tx_hash" }),
      getTransaction: vi.fn().mockResolvedValue({ status: "SUCCESS" }),
    };

    vi.spyOn(servers, "getHorizonServer").mockReturnValue(mockHorizon);
    vi.spyOn(servers, "getRpcServer").mockReturnValue(mockRpc);

    const states = [];
    const res = await submitEscrowRelease({
      recipientAddress: TEST_PUBLIC_KEY,
      contractId: DEFAULT_ESCROW_CONTRACT_ID,
      onStateChange: (st) => states.push(st.step),
    });

    expect(res.success).toBe(true);
    expect(res.recipientAddress).toBe(TEST_PUBLIC_KEY);
    expect(states).toContain("simulating");
    expect(states).toContain("signing");
    expect(states).toContain("submitting");
    expect(states).toContain("success");
  });
});
