import { describe, it, expect, vi, beforeEach } from "vitest";

const authModal = vi.fn();
const signTransaction = vi.fn();
const init = vi.fn();

vi.mock("@creit.tech/stellar-wallets-kit", () => ({
  StellarWalletsKit: { init, authModal, signTransaction },
  Networks: {
    TESTNET: "Test SDF Network ; September 2015",
    PUBLIC: "Public Global Stellar Network ; September 2015",
  },
}));

vi.mock("@creit.tech/stellar-wallets-kit/modules/utils", () => ({
  defaultModules: () => [],
}));

const { LynxxWalletProvider } = await import("./provider");

describe("LynxxWalletProvider", () => {
  beforeEach(() => {
    authModal.mockReset();
    signTransaction.mockReset();
  });

  it("connects and stores the address", async () => {
    authModal.mockResolvedValue({ address: "GABC" });
    const provider = new LynxxWalletProvider();

    const address = await provider.connect();

    expect(address).toBe("GABC");
    expect(provider.getAddress()).toBe("GABC");
    expect(provider.isConnected()).toBe(true);
  });

  it("throws a ModalClosed error when the wallet modal is dismissed", async () => {
    authModal.mockRejectedValue(new Error("closed"));
    const provider = new LynxxWalletProvider();

    await expect(provider.connect()).rejects.toMatchObject({
      code: "ModalClosed",
    });
  });

  it("throws a NotConnected error when signing before connecting", async () => {
    const provider = new LynxxWalletProvider();

    await expect(provider.signTransaction("xdr")).rejects.toMatchObject({
      code: "NotConnected",
    });
  });

  it("signs a transaction once connected", async () => {
    authModal.mockResolvedValue({ address: "GABC" });
    signTransaction.mockResolvedValue({ signedTxXdr: "signed-xdr" });
    const provider = new LynxxWalletProvider();
    await provider.connect();

    const signed = await provider.signTransaction("unsigned-xdr");

    expect(signed).toBe("signed-xdr");
    expect(signTransaction).toHaveBeenCalledWith("unsigned-xdr", {
      networkPassphrase: "Test SDF Network ; September 2015",
      address: "GABC",
    });
  });

  it("throws a SigningRejected error when the wallet rejects signing", async () => {
    authModal.mockResolvedValue({ address: "GABC" });
    signTransaction.mockRejectedValue(new Error("rejected"));
    const provider = new LynxxWalletProvider();
    await provider.connect();

    await expect(provider.signTransaction("unsigned-xdr")).rejects.toMatchObject({
      code: "SigningRejected",
    });
  });

  it("clears state on disconnect", async () => {
    authModal.mockResolvedValue({ address: "GABC" });
    const provider = new LynxxWalletProvider();
    await provider.connect();

    provider.disconnect();

    expect(provider.getAddress()).toBeNull();
    expect(provider.isConnected()).toBe(false);
  });
});
