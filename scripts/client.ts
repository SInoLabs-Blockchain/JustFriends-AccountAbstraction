// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat

import { ethers } from "hardhat";
import { fillAndSign } from "../test/UserOp";
import { getAccountAddress, getAccountInitCode } from "../test/testutils";

// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const [owner, sessionUser, otherAccount, , opOwner] = await hre.ethers.getSigners();
  console.log("🚀 ~ file: client.ts:14 ~ main ~ owner:", owner.address);

  const entryPoint = await hre.ethers.getContractAt("EntryPoint", "0x7E4F0bfB77eba984Fb3F81910F555F429671225c");
  const simpleAccountFactory = await hre.ethers.getContractAt("SimpleAccountFactory", "0x8CDd3fee93Ad5FE5D9d6DBFdeB96f9B169b810e0");
  const salt = 2;
  const newAccount = await getAccountAddress(owner.address, simpleAccountFactory, salt);

  // const acc = await ethers.getContractAt('SimpleAccount', '0xcB5C398C9216fdCd6F924A7802C4e5a662DC048e')
  console.log("🚀 ~ file: client.ts:19 ~ main ~ newAccount:", newAccount);
  const account = await hre.ethers.getContractAt("SimpleAccount", "0x9A2716D96Ee992142CF6d3443A5635e91C0FB12B");

  const ep = await account.entryPoint();
  console.log("🚀 ~ file: client.ts:27 ~ main ~ ep:", ep);
  const sessionUserInfor = await account.getSession("0x18E78AFAA2f43ED659c529BDBE19264769d53E5b");
  console.log("🚀 ~ file: client.ts:26 ~ main ~ sessionUser:", sessionUserInfor);
  return;
  const myOp = await fillAndSign(
    {
      sender: "0xA307F13Da759f1D1416eA67D2f76FcbEa2a82A22",
      // initCode: getAccountInitCode(owner.address, simpleAccountFactory, salt),

      maxPriorityFeePerGas: 0,
      maxFeePerGas: 0,
      callData:
        "0x39765da500000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000002091f0",
      // callData: "0x",
    },
    opOwner,
    entryPoint
  );
  const ssTx = await entryPoint.handleOps([myOp], otherAccount.address);
  console.log("🚀 ~ file: client.ts:45 ~ main ~ ssTx:", ssTx);

  return;
  const block = await hre.ethers.provider.getBlock("latest");
  const currentTime = block.timestamp;
  const validUntil = currentTime * 2;
  const sampleTotalAmount: number = 2134512;
  const calldataAddSession = await account.populateTransaction.addSession(
    "0xeA5e7A77b2519CA3EC9feD084efFA7a74AdDa75b",
    currentTime,
    validUntil + 1,
    sampleTotalAmount
  );
  const calldataRemoveSession = await account.populateTransaction.removeSession("0xeA5e7A77b2519CA3EC9feD084efFA7a74AdDa75b");
  const calldataSend = await account.populateTransaction.execute("0x8fC09aFEA0C8781E113cE979DBfc118e58f6A06C", "100000000", "0x");
  const op = await fillAndSign(
    {
      sender: newAccount,
      // initCode: getAccountInitCode(owner.address, simpleAccountFactory, salt),

      maxPriorityFeePerGas: 0,
      maxFeePerGas: 0,
      callData: calldataSend.data,
      // callData: "0x",
    },
    owner,
    entryPoint
  );
  const initTx = await entryPoint.handleOps([op], otherAccount.address);
  const receipt = await initTx.wait();
  console.log("🚀 ~ file: client.ts:33 ~ main ~ initTx:", receipt);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
