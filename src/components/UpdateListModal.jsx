import { Modal, Input, useNotification } from "web3uikit"
import { ethers } from "ethers"
import { useState } from "react"
import { useWeb3Contract } from "react-moralis"
import nftMarketplaceAbi from "../constants/nftMarketplace.json"

const UpdateListModal = ({
  showModal,
  closeModal,
  imageURL,
  tokenId,
  price,
  marketplaceAddress,
  nftAddress,
}) => {
  const [updatePriceWith, setUpdatePriceWith] = useState("")
  //const dispatch = useNotification()

  const { runContractFunction: updateListing } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "updateListing",
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
      newPrice: ethers.utils.parseEther(updatePriceWith || "0"),
    },
  })

  const { runContractFunction: cancelListing } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "cancelListing",
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
    },
  })

  const handleUpdateListingSuccess = async (tx) => {
    await tx.wait(1)
    // dispatch({
    //   type: "success",
    //   message: "listing updated",
    //   title: "Listing updated - please refresh (and move blocks)",
    //   position: "topR",
    // })
    console.log("Price Updated")
    closeModal && closeModal()
    setUpdatePriceWith("0")
  }

  const handleCancelListing = () => {
    cancelListing({
      onError: (error) => console.log(error),
      onSuccess: handleCancelSuccess,
    })
  }

  const handleCancelSuccess = async (tx) => {
    tx.wait(1)
    console.log("Listing Cancelled")
    closeModal && closeModal()
  }

  return (
    <div>
      <Modal
        cancelText="Discard Changes"
        title={<span className="modal-title">Edit Listed</span>}
        isVisible={showModal}
        okText="Change Listed Price"
        onCancel={closeModal}
        onCloseButtonPressed={closeModal}
        onOk={() =>
          updateListing({
            onError: (error) => console.log(error),
            onSuccess: handleUpdateListingSuccess,
          })
        }
      >
        <div className="modal-content">
          <div>
            This is your listed NFT you can update its pricing or cancel listing
          </div>
          <div className="modal-image-box">
            <div>#{tokenId}</div>
            <img src={imageURL} alt="listed" />
            <div>{ethers.utils.formatUnits(price, "ether")} ETH</div>
          </div>
          <Input
            label="Update listing price"
            name="New listing price"
            type="number"
            onChange={(event) => {
              setUpdatePriceWith(event.target.value)
            }}
          />
          <div>or</div>
          <button className="cancel-button" onClick={handleCancelListing}>
            <span>Cancel Listing</span>
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default UpdateListModal
