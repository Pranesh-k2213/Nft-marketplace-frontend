import { Form, Button } from "web3uikit"
import { useWeb3Contract } from "react-moralis"
import marketplaceAbi from "../constants/nftMarketplace.json"
import basicNftAbi from "../constants/basicNft.json"
import addressMapping from "../constants/networkMapping.json"
import { ethers } from "ethers"
import { useMoralis } from "react-moralis"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

const SellNft = () => {
  const { chainId, account, isWeb3Enabled } = useMoralis()
  const chainString = chainId ? parseInt(chainId).toString() : "31337"
  const { runContractFunction } = useWeb3Contract()
  const navigate = useNavigate()
  const [proceeds, setProceeds] = useState("")

  const approveAndList = async (form) => {
    console.log("Approving...", addressMapping[chainString].NtfMarketplace)
    const nftAddress = form.data[0].inputResult
    const tokenId = form.data[1].inputResult
    const price = ethers.utils
      .parseUnits(form.data[2].inputResult, "ether")
      .toString()

    const approveParams = {
      abi: basicNftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: addressMapping[chainString].NtfMarketplace,
        tokenId: tokenId,
      },
    }

    await runContractFunction({
      params: approveParams,
      onError: (error) => console.log(error),
      onSuccess: async (tx) => {
        await tx.wait(1)
        handleApproveSuccess(nftAddress, tokenId, price)
      },
    })
  }

  const handleApproveSuccess = async (nftAddress, tokenId, price) => {
    console.log("Listing")

    const listParams = {
      abi: marketplaceAbi,
      contractAddress: addressMapping[chainString].NtfMarketplace,
      functionName: "listItem",
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        price: price,
      },
    }

    await runContractFunction({
      params: listParams,
      onError: (error) => console.log(error),
      onSuccess: handleListSuccess,
    })
  }

  const handleListSuccess = async (tx) => {
    await tx.wait(1)
    console.log("Item Listed")
    navigate("../", { replace: true })
  }

  const setupUI = async () => {
    const proceedsParams = {
      abi: marketplaceAbi,
      contractAddress: addressMapping[chainString].NtfMarketplace,
      functionName: "getProceeds",
      params: {
        seller: account,
      },
    }
    const proccedReturened = await runContractFunction({
      params: proceedsParams,
      onError: (error) => console.log(error),
    })

    setProceeds(ethers.utils.formatUnits(proccedReturened.toString(), "ether"))
  }

  const handleWithdrawSuccess = async (tx) => {
    await tx.wait(1)
    console.log("Proccedings withdrawn successfully")
    navigate("../", { replace: true })
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      setupUI()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  return (
    <div className="form-container">
      <Form
        onSubmit={approveAndList}
        buttonConfig={{
          theme: "primary",
        }}
        data={[
          {
            name: "NFT Address",
            type: "text",
            validation: {
              required: true,
            },
            value: "",
          },
          {
            name: "Token Id",
            type: "number",
            validation: {
              required: true,
            },
            value: "",
          },
          {
            name: "Listing Price",
            type: "number",
            validation: {
              required: true,
            },
            value: "",
          },
        ]}
        title="Sell your NFT"
        id="Main Form"
      />
      <div>You have {proceeds} proceeds</div>

      {
        // eslint-disable-next-line eqeqeq
        proceeds != 0 ? (
          <Button
            theme="primary"
            type="button"
            text="Withdraw"
            onClick={() => {
              runContractFunction({
                params: {
                  abi: marketplaceAbi,
                  contractAddress: addressMapping[chainString].NtfMarketplace,
                  functionName: "withdrawProceeds",
                },
                onError: (error) => console.log(error),
                onSuccess: handleWithdrawSuccess,
              })
            }}
          />
        ) : (
          <div>Nothing to Withdraw</div>
        )
      }
    </div>
  )
}

export default SellNft
