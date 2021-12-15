import React from "react";
import { Link } from "react-router-dom";

function NavHeader() {
  return (
    <div className="border-b p-6">
      <p className="text-4xl font-bold">Rastor NFT Market</p>
      <Link to="/" className="mr-6 text-pink-500">
        Home
      </Link>
      <Link to="/create-item" className="mr-6 text-pink-500">
        Create
      </Link>
      <Link to="/my-assets" className="mr-6 text-pink-500">
        Assets
      </Link>
      <Link to="/creator-dashboard" className="mr-6 text-pink-500">
        Dashboard
      </Link>
    </div>
  );
}

export default NavHeader;
