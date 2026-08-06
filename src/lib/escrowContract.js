// ════════════════════════════════════════════════════════════════
//  Escrow Soroban Contract Client
//  Constructs, simulates, signs, and submits Soroban `deposit` and
//  `release` transactions against the Stellar Testnet RPC.
// ════════════════════════════════════════════════════════════════
import {
    rpc,
    Contract,
    Account,
    TransactionBuilder,
    Networks,
    BASE_FEE,
} from "@stellar/stellar-sdk";
import { kit } from "../components/Wallet";
import { isValidStellarAddress } from "./stellar";

export const ESCROW_CONTRACT_ID = "CCIYIE3WDF5EEC4DL25JR2O4SAV2G3USARIBMCLWPIFQVUOIVDEN5FWI";
export const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
const READ_SOURCE = "GBH2MIGQ3TA7WWADXM6UIBJ7I73NRS7BVUX324JFC4VTFZXIPWPZLYSO";

const server = new rpc.Server(SOROBAN_RPC_URL);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class EscrowError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

/** Map simulation or network error to friendly EscrowError */
export function mapEscrowError(e) {
    if (e instanceof EscrowError) return e;
    const msg = String(e?.message || e || "");
    if (/user declined|rejected|cancelled|ModalClosed/i.test(msg)) {
        return new EscrowError("WalletRejected", "Transaction signing was rejected in wallet.");
    }
    if (/not connected|no address/i.test(msg)) {
        return new EscrowError("WalletNotConnected", "Please connect your Stellar wallet first.");
    }
    if (/insufficient|balance/i.test(msg)) {
        return new EscrowError("InsufficientBalance", "Your wallet balance is too low to cover transaction fees.");
    }
    return new EscrowError("SimFailed", msg || "Failed to execute transaction on Soroban contract.");
}

/**
 * Submit a `deposit` transaction to the Escrow Soroban contract.
 * @param {Object} params
 * @param {string} params.senderAddress - Stellar public key of depositor
 * @param {string} [params.contractId] - Escrow smart contract ID
 * @param {function} [params.onStatusUpdate] - Status callback for UI state
 * @returns {Promise<{hash: string, status: string}>}
 */
export async function depositEscrow({ senderAddress, amount, token, contractId = ESCROW_CONTRACT_ID, onStatusUpdate }) {
    if (!senderAddress || !isValidStellarAddress(senderAddress)) {
        throw new EscrowError("InvalidAddress", "A valid Stellar wallet address is required to deposit.");
    }
    if (!contractId || contractId.trim().length === 0) {
        throw new EscrowError("InvalidContract", "Invalid or missing Escrow contract ID.");
    }
    if (!amount || !token) {
        throw new EscrowError("InvalidParams", "Amount and token are required for deposit.");
    }

    try {
        if (onStatusUpdate) onStatusUpdate("preparing");
        const targetContractId = contractId.trim();
        const contract = new Contract(targetContractId);
        const account = await server.getAccount(senderAddress);

        const tx = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        })
            .addOperation(contract.call("deposit", { amount, token }))
            .setTimeout(60)
            .build();

        const prepared = await server.prepareTransaction(tx);

        if (onStatusUpdate) onStatusUpdate("signing");
        const signResult = await kit.signTransaction(prepared.toXDR(), {
            networkPassphrase: Networks.TESTNET,
            address: senderAddress,
        });

        if (!signResult?.signedTxXdr) {
            throw new EscrowError("WalletRejected", "Transaction was not signed.");
        }

        if (onStatusUpdate) onStatusUpdate("submitting");
        const signed = TransactionBuilder.fromXDR(signResult.signedTxXdr, Networks.TESTNET);
        const sent = await server.sendTransaction(signed);

        if (sent.status === "ERROR") {
            throw new EscrowError("SubmitFailed", "Transaction submission rejected by Soroban RPC.");
        }

        if (onStatusUpdate) onStatusUpdate("confirming");
        let result = await server.getTransaction(sent.hash);
        let tries = 0;
        while (result.status === "NOT_FOUND" && tries < 30) {
            await sleep(1000);
            result = await server.getTransaction(sent.hash);
            tries++;
        }

        if (result.status !== "SUCCESS") {
            throw new EscrowError("ExecutionFailed", "Escrow deposit transaction failed on-chain.");
        }

        return { hash: sent.hash, status: "SUCCESS" };
    } catch (e) {
        throw mapEscrowError(e);
    }
}

/**
 * Submit a `release` transaction to the Escrow Soroban contract.
 * @param {Object} params
 * @param {string} params.claimerAddress - Stellar public key of recipient claiming escrow
 * @param {string} [params.contractId] - Escrow smart contract ID
 * @param {function} [params.onStatusUpdate] - Status callback for UI state
 * @returns {Promise<{hash: string, status: string}>}
 */
export async function releaseEscrow({ claimerAddress, args = {}, contractId = ESCROW_CONTRACT_ID, onStatusUpdate }) {
    if (!claimerAddress || !isValidStellarAddress(claimerAddress)) {
        throw new EscrowError("InvalidAddress", "A valid Stellar wallet address is required to claim.");
    }
    if (!contractId || contractId.trim().length === 0) {
        throw new EscrowError("InvalidContract", "Invalid or missing Escrow contract ID.");
    }

    try {
        if (onStatusUpdate) onStatusUpdate("preparing");
        const targetContractId = contractId.trim();
        const contract = new Contract(targetContractId);
        const account = await server.getAccount(claimerAddress);

        const tx = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        })
            .addOperation(contract.call("release", args))
            .setTimeout(60)
            .build();

        const prepared = await server.prepareTransaction(tx);

        if (onStatusUpdate) onStatusUpdate("signing");
        const signResult = await kit.signTransaction(prepared.toXDR(), {
            networkPassphrase: Networks.TESTNET,
            address: claimerAddress,
        });

        if (!signResult?.signedTxXdr) {
            throw new EscrowError("WalletRejected", "Transaction was not signed.");
        }

        if (onStatusUpdate) onStatusUpdate("submitting");
        const signed = TransactionBuilder.fromXDR(signResult.signedTxXdr, Networks.TESTNET);
        const sent = await server.sendTransaction(signed);

        if (sent.status === "ERROR") {
            throw new EscrowError("SubmitFailed", "Transaction submission rejected by Soroban RPC.");
        }

        if (onStatusUpdate) onStatusUpdate("confirming");
        let result = await server.getTransaction(sent.hash);
        let tries = 0;
        while (result.status === "NOT_FOUND" && tries < 30) {
            await sleep(1000);
            result = await server.getTransaction(sent.hash);
            tries++;
        }

        if (result.status !== "SUCCESS") {
            throw new EscrowError("ExecutionFailed", "Escrow release transaction failed on-chain.");
        }

        return { hash: sent.hash, status: "SUCCESS" };
    } catch (e) {
        throw mapEscrowError(e);
    }
}
