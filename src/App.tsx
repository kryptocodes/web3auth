import "./App.css";
import { Web3Auth } from "@web3auth/web3auth";
import { ADAPTER_EVENTS, CHAIN_NAMESPACES } from "@web3auth/base";
import { LOGIN_MODAL_EVENTS } from "@web3auth/ui";
import { useEffect, useState } from "react";
import { SafeEventEmitterProvider } from "@web3auth/base";

import Web3 from "web3";
import { errors, ethers } from 'ethers'
import { Biconomy } from '@biconomy/mexa'
import { ABI, DEPLOYED_ADDRESS } from "./data";
import openlogin from "openlogin";

function App() {
  const [user, setUser] = useState(null);
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [loaded, setLoaded] = useState(false);


  const [accounts, setAccounts] = useState<string>('');

  let web3
  useEffect(() => {
    console.log("useEffect");

    const subscribeAuthEvents = (web3auth: Web3Auth) => {
      web3auth.on(ADAPTER_EVENTS.CONNECTED, (data) => {
        console.log("Yeah!, you are successfully logged in", data);
        setUser(data);
      });

      web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
        console.log("connecting");
      });

      web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
        console.log("disconnected");
        setUser(null);
      });

      web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
        console.log("some error or user have cancelled login request", error);
      });

      web3auth.on(LOGIN_MODAL_EVENTS.MODAL_VISIBILITY, (isVisible) => {
        console.log("modal visibility", isVisible);
      });
    };

    const polygonMumbaiConfig = {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      rpcTarget: "https://rpc-mumbai.maticvigil.com",
      blockExplorer: "https://mumbai-explorer.matic.today",
      chainId: "0x13881",
      displayName: "Polygon Mumbai Testnet",
      ticker: "matic",
      tickerName: "matic",
    };

    const web3auth = new Web3Auth({
      chainConfig: polygonMumbaiConfig,
      clientId: "BGC1coVXrFJH8nE9cDou4PngZlPsfzXg91QenzdKSPI6aPd5yK8jlP3sR0kYOvccoqU_1N5bMKQ2tKhgMPrXm9Q",
    });

    setWeb3auth(web3auth);

    // ⭐️ initialize modal on page mount.
    const initializeModal = async () => {
      console.log("initializeModal");
      subscribeAuthEvents(web3auth);
      await web3auth.initModal();
      setLoaded(true);
    };

    initializeModal();
  }, []);

  


  const login = async () => {
    if (!web3auth) return;
    const provider = await web3auth.connect();
    console.log("provider", provider);
    //@ts-ignore
    web3 = new Web3(provider);
    const address = (await web3.eth.getAccounts())[0];
    setAccounts(address);
    console.log("address", address);
    console.log("web3", web3);
    const originalMessage = "YOUR_MESSAGE";
    //@ts-ignore
    const signedMessage = await web3.eth.personal.sign(originalMessage, '0x41314d27a2aB574156Ba35e80Ab752c2DD305e80');
    console.log("signedMessage", signedMessage);
    // TODO: add this provider to web3/ethers
  };
  const logout = async () => {
    if (!web3auth) return;
    await web3auth.logout();
  };
  const getUserInfo = async () => {
    if (!web3auth) return;
    const userInfo = await web3auth.getUserInfo();
    console.log(userInfo);
  };

  const mintNft = async () => {
    const provider = await web3auth.connect();
    console.log("provider", provider);
    //@ts-ignore
    const Provider = new Web3(provider);
    
    const tokenURI = `ipfs://QmbMGBzA2itV8kSMfXALUECNzyExaj9mEsixTKMKcxfraj`

    const biconomy = 
    new Biconomy(
      Provider,
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


 

  const renderUnauthenticated = () => {
    return (
      <div className="App">
        <button className="app-link" onClick={login}>
          LOGIN
        </button>
      </div>
    );
  };



  const renderAuthenticated = () => {
    return (
      <div className="App">
        <button className="app-link" onClick={logout}>
          LOG OUT
        </button>
        <p>{accounts}</p>
        <button className="app-link" onClick={mintNft}>
          Mint
        </button>
      </div>
    );
  };

  return loaded ? (user ? renderAuthenticated() : renderUnauthenticated()): <h1>Loading....</h1>;
}

export default App;
