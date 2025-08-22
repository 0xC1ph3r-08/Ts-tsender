"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit";

import { anvil , zksync , sepolia , mainnet  } from "wagmi/chains";

export default getDefaultConfig({
  appName: "TSender",
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
    chains: [anvil, zksync , sepolia, mainnet],
    ssr:false
})