import { Link } from "react-router-dom"
import { ConnectButton } from "web3uikit"

const Header = () => {
  return (
    <div className="nav-container">
      <nav className="header">
        <h1>NFT Market place</h1>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="sellNft">Sell NFT</Link>
          </li>
          <ConnectButton moralisAuth={false} />
        </ul>
      </nav>
    </div>
  )
}

export default Header
