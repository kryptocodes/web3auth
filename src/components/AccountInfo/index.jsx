import React, { useState } from "react";
import { PageHeader, Button } from "antd";
import "./style.scss";
import { Biconomy } from '@biconomy/mexa'
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { ethers } from "ethers";

import { ABI, DEPLOYED_ADDRESS } from '../../data'
import Web3 from 'web3'

function AccountInfo({handleLogout, privKey, walletInfo,provider}) {
    const [privateKeyHidden, setPkeyVisiblity] = useState(false);


    const mintNft = async () => {
     
        
        const tokenURI = `ipfs://QmbMGBzA2itV8kSMfXALUECNzyExaj9mEsixTKMKcxfraj`
    
        const biconomy = 
        new Biconomy(
          provider,
          {
          apiKey: 'kmWOG5auW.4b175ffc-6bb1-45cc-ae49-135d65b48979',
          debug: true
        })
      
      const metaTxProvider = new ethers.providers.Web3Provider(biconomy)
      biconomy.onEvent(biconomy.READY, async () => {
        const contract = new ethers.Contract(
          DEPLOYED_ADDRESS,
          ABI,
          biconomy.getSignerByAddress('0x41314d27a2aB574156Ba35e80Ab752c2DD305e80')
        )
        let { data } = await contract.populateTransaction.safeMint(
          '0x41314d27a2aB574156Ba35e80Ab752c2DD305e80',
        tokenURI
        )
    
        const txParams = {
          data: data,
          to: DEPLOYED_ADDRESS,
          from: '0x41314d27a2aB574156Ba35e80Ab752c2DD305e80',
        }
        const tx = await metaTxProvider.send('eth_sendTransaction', [txParams])
      
        if(tx){
           
            console.log(`Transaction hash: `, tx)
         
          // const txReceipt = await tx.wait()
          // console.log(`Transaction Receipt: `, txReceipt)
        }
      }).onEvent(biconomy.ERROR, (error, message) => {
        console.log(`Error: `, error)
      })
    }
    
    
 return (
    <div>
        <PageHeader
            className="site-page-header"
            title="Openlogin x Polygon"
            extra={[
            <Button key="1" type="primary" onClick={()=>handleLogout(false)}>
                Logout 
            </Button>,
             <Button key="1" type="primary" onClick={()=>handleLogout(true)}>
                Sleep (Fast Login enabled)
             </Button>,
            ]}
        />
        <div className="container">
            <div style={{ display: "flex", flexDirection: "column", width: "100%", justifyContent: "center", alignItems: "center", margin: 20 }}>
            <div style={{margin:20}}>
                Wallet address: <i>{walletInfo?.address}</i>
            </div>
            <Button type="primary" onClick={()=>mintNft()}>Mint NFT</Button>
            <div style={{margin:20}}>
                Matic ERC20 token Balance: <i>{walletInfo?.balance}</i>
            </div>
            <div style={{margin:20}}>
            {
                !privateKeyHidden ? 
                <div style={{margin:20, maxWidth: 900, wordWrap: "break-word", display:"flex", flexDirection:"column"}}>
                  <span style={{margin: 20}}>{"********************************"}</span>
                  <button onClick={()=>{setPkeyVisiblity(true)}}>Show Private Key</button>
                </div>:
                <div style={{margin:20, maxWidth: 900, wordWrap: "break-word", display:"flex", flexDirection:"column"}}>
                 <span style={{margin: 20}}>{(privKey)}</span>
                  <button onClick={()=>{setPkeyVisiblity(false)}}>Hide Private Key</button>
                </div>
              }
                        </div>
            </div>
        </div>
  </div>
 )
}

export default AccountInfo;