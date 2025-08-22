"use client"

import { useAccount } from "wagmi"
import HomeContent from "@/components/HomeContent";

export default function Home() {
  const { isConnected } = useAccount();
  return (
    <div>
      {!isConnected ? (
        <div>
          please Connect a wallet
        </div>
      ) : (
        <div> 
          <HomeContent />
        </div>
      )}
    </div>
  );
}
