import { Routes, Route } from "react-router-dom"
import Home from "./components/Home"
import SellNft from "./components/SellNft"
import Header from "./components/Header"
import "./app.css"
import { useMoralis } from "react-moralis"

function App() {
  const { isWeb3Enabled } = useMoralis()
  return (
    <div className="App">
      <Header />
      {isWeb3Enabled ? (
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/sellNft" element={<SellNft />}></Route>
        </Routes>
      ) : (
        <div>Connect Wallet</div>
      )}
    </div>
  )
}

export default App
