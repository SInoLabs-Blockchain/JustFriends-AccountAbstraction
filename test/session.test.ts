import "./aa.init";
import { BigNumber, Event, PopulatedTransaction, Wallet } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { EntryPoint, SimpleAccount, SimpleAccountFactory, TestCounter, TestCounter__factory } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { createAccount, deployEntryPoint, fund, getAccountAddress, getAccountInitCode } from "./testutils";
import { fillAndSign } from "./UserOp";
import { Interface } from "ethers/lib/utils";
import { Artifact } from "hardhat/types";
import { Artifacts } from "hardhat/internal/artifacts";
import path from "path";

describe.only("Session key", function () {
  let entryPoint: EntryPoint;
  let account: SimpleAccount;
  let [owner, sessionUser, otherAccount]: SignerWithAddress[] = [];
  let counter: TestCounter;
  let simpleAccountFactory: SimpleAccountFactory;
  let sampleStartFrom: number = 0;
  let sampleValidUntil: number = 212131212;
  let sampleTotalAmount: number = 2134512;
  let count: PopulatedTransaction;
  let currentTime: number;
  let validUntil: number;
  beforeEach(async () => {
    [owner, sessionUser, otherAccount] = await ethers.getSigners();
    entryPoint = await deployEntryPoint();
    counter = await new TestCounter__factory(owner).deploy();
    ({ proxy: account, accountFactory: simpleAccountFactory } = await createAccount(otherAccount, owner.address, entryPoint.address));
    await fund(account);
    count = await counter.populateTransaction.count();
    const block = await ethers.provider.getBlock("latest");
    currentTime = block.timestamp;
    validUntil = currentTime * 2;
  });
  describe("#createSession", () => {
    it("should add session key successfully", async () => {
      const addSessionTx = await account.connect(owner).addSession(sessionUser.address, sampleStartFrom, sampleValidUntil, sampleTotalAmount);
      await expect(addSessionTx).to.be.emit(account, "SessionCreated").withArgs(sessionUser.address, sampleStartFrom, sampleValidUntil, sampleTotalAmount);
      const sessionInContract = await account.getSession(sessionUser.address);
      expect(sessionInContract.startFrom).to.be.equal(sampleStartFrom);
      expect(sessionInContract.validUntil).to.be.equal(sampleValidUntil);
      expect(sessionInContract.totalAmount).to.be.equal(sampleTotalAmount);
      expect(sessionInContract.spentAmount).to.be.equal(0);
    });
  });
  describe("#removeSession", () => {
    beforeEach(async () => {
      await account.connect(owner).addSession(sessionUser.address, sampleStartFrom, sampleValidUntil, sampleTotalAmount);
    });
    it("should add session key successfully", async () => {
      const addSessionTx = await account.connect(owner).removeSession(sessionUser.address);
      await expect(addSessionTx).to.be.emit(account, "SessionRemoved").withArgs(sessionUser.address, sampleStartFrom, sampleValidUntil, sampleTotalAmount, 0);
      const sessionInContract = await account.getSession(sessionUser.address);
      expect(sessionInContract.startFrom).to.be.equal(0);
      expect(sessionInContract.validUntil).to.be.equal(0);
      expect(sessionInContract.totalAmount).to.be.equal(0);
      expect(sessionInContract.spentAmount).to.be.equal(0);
    });
  });
  describe("#session user", () => {
    beforeEach(async () => {
      await account.connect(owner).addSession(sessionUser.address, currentTime, validUntil, sampleTotalAmount);
    });
    it("should success to call from valid session user", async () => {
      const execTx = await account.connect(sessionUser).execute(counter.address, "0", count.data!);
      await expect(execTx).to.be.emit(account, "Invoked").withArgs(counter.address, "0", count.data!);
    });
    it("should fail to call from invalid session user (invalid duration)", async () => {
      await account.connect(owner).addSession(sessionUser.address, validUntil, validUntil + 1, sampleTotalAmount);
      await expect(account.connect(sessionUser).execute(counter.address, "0", count.data!)).to.be.revertedWith(
        "account: not Owner or EntryPoint or Session user"
      );
    });
    it("should fail to call from invalid session user (amount spent > total amount)", async () => {
      await account.connect(owner).addSession(sessionUser.address, currentTime, validUntil + 1, sampleTotalAmount);
      await expect(account.connect(sessionUser).execute(otherAccount.address, sampleTotalAmount + 1, "0x")).to.be.revertedWith(
        "account: not Owner or EntryPoint or Session user"
      );
    });
    it("should fail to call from invalid session user (invalid amount spent)", async () => {
      await account.connect(owner).addSession(sessionUser.address, currentTime, validUntil + 1, sampleTotalAmount);
      await account.connect(sessionUser).execute(otherAccount.address, sampleTotalAmount, "0x");
      await expect(account.connect(sessionUser).execute(otherAccount.address, 1, "0x")).to.be.revertedWith("account: not Owner or EntryPoint or Session user");
    });
  });
  describe("#session user from entrypoint", () => {
    beforeEach(async () => {
      await account.connect(owner).addSession(sessionUser.address, currentTime, validUntil, sampleTotalAmount);
    });
    it("should success to call from valid session user", async () => {
      const accountExecFromEntryPoint = await account.populateTransaction.execute(otherAccount.address, sampleTotalAmount, "0x");
      const op = await fillAndSign(
        {
          sender: account.address,
          callData: accountExecFromEntryPoint.data,
        },
        owner,
        entryPoint
      );
      await entryPoint.handleOps([op], otherAccount.address);
    });
  });
  describe("#create new User by Op", () => {
    it("should success to init new account", async () => {
      const newAccount = await getAccountAddress(owner.address, simpleAccountFactory, 1000);
      await fund(newAccount);

      const op = await fillAndSign(
        {
          sender: newAccount,
          initCode: getAccountInitCode(owner.address, simpleAccountFactory, 1000),
          callData: "0x",
        },
        owner,
        entryPoint
      );
      await entryPoint.handleOps([op], otherAccount.address);
    });
    it.only("should success to init new account and create session", async () => {
      const newAccount = await getAccountAddress(owner.address, simpleAccountFactory, 1000);
      await fund(newAccount);
      // hoac dung (await account.populateTransaction.addSession(sessionUser.address, validUntil, validUntil + 1, sampleTotalAmount)).data; de lay duoc addSessiondata
      const addSessionData = await encodeFunction("SimpleAccount", "addSession", [sessionUser.address, 0, 113399901350, sampleTotalAmount]);

      const op = await fillAndSign(
        {
          sender: newAccount,
          nonce: await entryPoint.getNonce(newAccount, 0),
          initCode: getAccountInitCode(owner.address, simpleAccountFactory, 1000),
          callData: addSessionData,
          callGasLimit: 100000,
          verificationGasLimit: 500000,
          preVerificationGas: 0,
          maxFeePerGas: 0,
          maxPriorityFeePerGas: 0,
          paymasterAndData: "0x",
        },
        owner,
        entryPoint
      );
      console.log("🚀 ~ file: session.test.ts:136 ~ it.only ~ op:", op);
      await entryPoint.handleOps([op], otherAccount.address);
      // await account.connect(owner).addSession(sessionUser.address, currentTime, validUntil, sampleTotalAmount);
      //session user can create tx
      const newAccountContract: SimpleAccount = await ethers.getContractAt("SimpleAccount", newAccount);
      const execTx = await newAccountContract.connect(sessionUser).execute(counter.address, "0", count.data!);
      await expect(execTx).to.be.emit(newAccountContract, "Invoked").withArgs(counter.address, "0", count.data!);
    });
  });
});
export async function encodeFunction(contract: string, func: string, params: any[]): Promise<string> {
  const accountInterface = await getInterface(contract);
  const args = params;
  return accountInterface.encodeFunctionData(func, args);
}
export async function getInterface(name: string): Promise<Interface> {
  const artifact = await getArtifact(name);
  return new ethers.utils.Interface(artifact.abi);
}
export async function getArtifact(name: string): Promise<Artifact> {
  const artifactsPath = !name.includes("/") ? path.resolve("./artifacts") : path.dirname(require.resolve(`${name}.json`));
  const artifacts = new Artifacts(artifactsPath);
  return artifacts.readArtifact(name.split("/").slice(-1)[0]);
}
