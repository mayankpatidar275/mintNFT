import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Minter from "./artifacts/contracts/Minter.sol/Minter.json";
import './App.css';

function App() {

  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [fileImg, setFileImg] = useState(null);
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const loadProvider = async () => {
      if (provider) {
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });

        window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        let contractAddress = "0x0a1944eD4Aff8f8E1EAc029F5846E6c5dd86730D";

        const contract = new ethers.Contract(
          contractAddress,
          Minter.abi,
          signer
        );

        setContract(contract);
        setProvider(provider);

      } else {
        console.error("Metamask is not installed");
      }
    };
    provider && loadProvider();
  }, []);


  

    const sendJSONtoIPFS = async (ImgHash) => {
        try {
            const resJSON = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
                data: {
                    "name": name,
                    "description": desc,
                    "image": ImgHash
                },
                headers: {
                    'pinata_api_key': `${process.env.REACT_APP_PINATA_API_KEY}`,
                    'pinata_secret_api_key': `${process.env.REACT_APP_PINATA_API_SECRET}`,
                },
            });

            console.log("final ", `ipfs://${resJSON.data.IpfsHash}`)
            const tokenURI = `ipfs://${resJSON.data.IpfsHash}`;
            console.log("Token URI", tokenURI);
            mintNFT(tokenURI, account)   // pass the winner

        } catch (error) {
            console.log("JSON to IPFS: ")
            console.log(error);
        }


    }

    const sendFileToIPFS = async (e) => {

        e.preventDefault();

        if (fileImg) {
            try {

                const formData = new FormData();
                formData.append("file", fileImg);

                const resFile = await axios({
                    method: "post",
                    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    data: formData,
                    headers: {
                        'pinata_api_key': `${process.env.REACT_APP_PINATA_API_KEY}`,
                        'pinata_secret_api_key': `${process.env.REACT_APP_PINATA_API_SECRET}`,
                        "Content-Type": "multipart/form-data"
                    },
                });

                const ImgHash = `ipfs://${resFile.data.IpfsHash}`;
                sendJSONtoIPFS(ImgHash)

            } catch (error) {
                console.log("File to IPFS: ")
                console.log(error)
            }
        }
    }

    const mintNFT = async (tokenURI) => {
        try {
            await contract.NFTminter(tokenURI, account)

            setFileImg("");
            setName("");
            setDesc("");
            setMintSuccess(true);
            setTimeout(() => {
              setMintSuccess(false);
            }, 5000); // 5 seconds
        
            console.log("Your NFT has been minted successfully");
            
        } catch (error) {
            console.log("Error while minting NFT with contract")
            console.log(error);
        }
    }

    useEffect(() => {
        console.log(fileImg)
    }, [fileImg])


    return (
      <div className="container my-5">
        
      <div className="row justify-content-center">
      
        <div className="col-md-8">
          <div className="card">
            <div className="card-header text-center">
              <h2>Mint NFT</h2>
            </div>
            {mintSuccess && <div className="alert alert-success">NFT Minted Successfully!</div>}
            <div className="card-body">
              <form onSubmit={sendFileToIPFS}>
                <div className="form-group">
                  <label htmlFor="fileImg">Upload Image</label>
                  <input 
                    type="file" 
                    className="form-control-file" 
                    id="fileImg" 
                    onChange={(e) => setFileImg(e.target.files[0])} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="name" 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter name" 
                    required 
                    value={name} 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="desc">Description</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="desc" 
                    onChange={(e) => setDesc(e.target.value)} 
                    placeholder="Enter description" 
                    required 
                    value={desc} 
                  />
                </div>
                <button className='btn btn-primary btn-block' type='submit'>Mint NFT</button>
              </form>
            </div>
            
          </div>
        </div>
      </div>
    </div>
    
    )
}

export default App;
