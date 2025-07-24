import React from "react";
import logo from "../assets/companylogos/5dvdc.svg";

const FooterSmall = () => {
  return (
    <footer className="flex items-center justify-between bg-white text-black py-2 px-4 border-t border-gray-300">
        <p className="text-sm">&copy; 2025 5D VDC Services LLP. All rights reserved.</p>
        <img src={logo} className="h-8" alt="Footer Logo" />
    </footer>
  );
};

export default FooterSmall;
