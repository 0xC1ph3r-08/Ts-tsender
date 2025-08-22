"use client"

import { useState , useMemo } from 'react';
import InputField from './ui/InputField';
import { chainsToTSender , tsenderAbi , erc20Abi } from '@/constants';
import { useChainId , useConfig , useAccount , useWriteContract} from 'wagmi';
import { readContract  , waitForTransactionReceipt } from '@wagmi/core';
import { calculateTotal } from '@/utils/calculateTotal/calculateTotal';

export default function AirdropForm() {
    const [tokenAddress , setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amounts, setAmounts] = useState("");
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();
    const total: number = useMemo(() => calculateTotal(amounts), [amounts])
    const {data: hash , isPending , writeContractAsync} = useWriteContract()

    async function getApprovedAmount(tSenderAddress: string | null) : Promise<number>{
        if(!tSenderAddress) return 0;

        // read from the chain to see if we have approved enough tokens
        const response = await readContract(config , {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: 'allowance',
            args: [account.address, tSenderAddress as `0x${string}`]
        })
        // token.allowance(account.address, tSenderAddress)
        return response as number;

    }

    async function handleSubmit() {
        // 1a. If already appproved , move to step2
        // 1b. Approve our tsender contract to spend our token
        // 2. Call the airdrop function on tsender contract
        // 3. Wait for the transaction to be mined

        const tsenderAddress = chainsToTSender[chainId]["tsender"];
        const approvedAmount = await getApprovedAmount(tsenderAddress);
        
        if(approvedAmount < total){
            const approvalHash = await writeContractAsync({
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: 'approve',
                args: [tsenderAddress as `0x${string}`, BigInt(total)],
            })

            const approvalReceipt = await waitForTransactionReceipt(config, {
                hash: approvalHash,
            })

            console.log("Approval confirmed:", approvalReceipt)  

            await writeContractAsync({
                abi: tsenderAbi,
                address: tsenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            })

        }else{
            await writeContractAsync({
                abi: tsenderAbi,
                address: tsenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),],
            },)
        }
    }
    return(
        <div>
            <InputField 
                label="Token Address"
                placeholder="0x..."
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)} 
            />
            <InputField 
                label="Recipients"
                placeholder="0x1, 0x2, 0x3..."
                value={recipients}
                large = {true}
                onChange={(e) => setRecipients(e.target.value)}
            />
            <InputField 
                label="Amount"
                placeholder="100 , 200 , 300..."
                value={amounts}
                type="number"
                onChange={(e) => setAmounts(e.target.value)}
                large={true}
            />
            <button
                  onClick={handleSubmit}
                    className="px-6 py-2 bg-gradient-to-r from-green-400 to-emerald-600 
                    text-white font-semibold rounded-2xl shadow-md 
                     hover:from-green-500 hover:to-emerald-700 
                     active:scale-95 transition duration-300 ease-in-out"
                    >
                        Send Tokens
            </button>
        </div>
    )
}