import React from "react";
import "./Footer.css";

import { FaGithub } from "react-icons/fa";

function Footer() {
  return (
    <div className="Footer">
      <div>
        <strong>Gradient Blaster</strong> &copy; 2022 Graham Bates
      </div>
      <div>
        <FaGithub />
        <a href="https://github.com/grahambates/gradient-blaster">
          Source on Github
        </a>
      </div>
    </div>
  );
}

export default Footer;
