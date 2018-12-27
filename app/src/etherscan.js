import React from "react";

function EtherScanAddressLink(props) {
  const { address, myAddress } = props;
  const link = `https://etherscan.io/address/${address}`;
  return (
    <a href={link}>
      {address.substring(0, 10)} {myAddress == address ? " (you) " : " "}
    </a>
  );
}

export default EtherScanAddressLink;
