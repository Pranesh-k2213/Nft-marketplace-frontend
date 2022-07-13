import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import nftAbi from "../constants/basicNft.json"
import nftMarketplaceAbi from "../constants/nftMarketplace.json"
import { Card } from "web3uikit"
import { ethers } from "ethers"
import UpdateListModal from "./UpdateListModal"

const truncateStr = (fullStr, strLen) => {
  if (fullStr.length <= strLen) return fullStr

  const separator = "..."
  const seperatorLength = separator.length
  const charsToShow = strLen - seperatorLength
  const frontChars = Math.ceil(charsToShow / 2)
  const backChars = Math.floor(charsToShow / 2)
  return (
    fullStr.substring(0, frontChars) +
    separator +
    fullStr.substring(fullStr.length - backChars)
  )
}

const NftCard = ({
  marketplaceAddress,
  nftAddress,
  price,
  seller,
  tokenId,
}) => {
  const { isWeb3Enabled, account } = useMoralis()
  const [imageURL, setImageURL] = useState("")
  const [description, setdescription] = useState("")
  const [name, setName] = useState("")
  const [showModal, setShowModal] = useState(false)
  const closeModal = () => setShowModal(false)
  const { runContractFunction: getTokenURI } = useWeb3Contract({
    abi: nftAbi,
    contractAddress: nftAddress,
    functionName: "tokenURI",
    params: {
      tokenId: tokenId,
    },
  })

  const { runContractFunction: buyItem } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "buyItem",
    msgValue: price,
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
    },
  })

  const isOwnedByUser = account === seller
  const formattedSellerAddress = isOwnedByUser
    ? "you"
    : truncateStr(seller || "", 15)

  async function updateURI() {
    const tokenURI = (await getTokenURI()).toString()
    if (tokenURI) {
      console.log(tokenURI)
      const tokenURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
      const nftJson = await (await fetch(tokenURL)).json()
      const imageURI = nftJson.image
      const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
      setImageURL(imageURIURL)
      setdescription(nftJson.description)
      setName(nftJson.name)
      console.log(imageURIURL)
    }
  }
  const handleBuyItemSuccess = async (tx) => {
    await tx.wait(1)
    console.log("Item Bought")
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateURI()
    }
  }, [isWeb3Enabled])

  const handleCardClick = () => {
    if (isOwnedByUser) {
      setShowModal(true)
    } else {
      buyItem({
        onError: (error) => {
          console.log(error)
        },
        onSuccess: handleBuyItemSuccess,
      })
    }
  }

  return (
    <div>
      {imageURL ? (
        <div>
          <UpdateListModal
            showModal={showModal}
            closeModal={closeModal}
            imageURL={imageURL}
            tokenId={tokenId}
            price={price}
            marketplaceAddress={marketplaceAddress}
            nftAddress={nftAddress}
          ></UpdateListModal>
          <div className="card-container">
            <Card
              description={description}
              title={name}
              onClick={handleCardClick}
            >
              <div className="card-content">
                <div>Token ID - #{tokenId}</div>
                <div>Owned by {formattedSellerAddress}</div>
                <img src={imageURL} alt="nft" />
                <div>{ethers.utils.formatUnits(price, "ether")} ETH</div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  )
}

export default NftCard
