import { useEffect } from "react"
import { useMoralisQuery } from "react-moralis"
import NftCard from "./NftCard"

function Home() {
  const {
    data: listedNfts,
    isFetching: fetchingListedNfts,
    isLoading,
  } = useMoralisQuery(
    // TableName
    // Function for the query
    "ActiveItem",
    (query) => query.limit(10).descending("tokenId")
  )

  return (
    <div>
      <h1 className="page-title">Recently listed NFTs</h1>
      <div className="cards-container">
        {fetchingListedNfts || isLoading ? (
          <div>fetching</div>
        ) : (
          listedNfts.map((nft) => {
            console.log(nft.attributes)
            const { marketplaceAddress, nftAddress, price, seller, tokenId } =
              nft.attributes
            return (
              <div>
                <NftCard
                  marketplaceAddress={marketplaceAddress}
                  nftAddress={nftAddress}
                  price={price}
                  seller={seller}
                  tokenId={tokenId}
                  key={nftAddress.toString() + tokenId.toString()}
                />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Home
