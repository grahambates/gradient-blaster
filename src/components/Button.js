import React from "react";
import "./Button.css";

function Button({ dark, iconLeft, iconRight, small, children, href, ...rest }) {
  const classes = ["Button"];
  if (dark) {
    classes.push("Button--dark");
  }
  if (iconLeft) {
    classes.push("Button--iconLeft");
  }
  if (iconRight) {
    classes.push("Button--iconRight");
  }
  if (small) {
    classes.push("Button--small");
  }

  if (href) {
    return (
      <a className={classes.join(" ")} {...rest}>
        {iconLeft}
        {children}
        {iconRight}
      </a>
    );
  }
  return (
    <button className={classes.join(" ")} {...rest}>
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}

export default Button;
