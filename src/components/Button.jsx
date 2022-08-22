import React from "react";
import "./Button.css";

function Button({
  dark,
  iconLeft,
  iconRight,
  minimal,
  children,
  href,
  ...rest
}) {
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
  if (minimal) {
    classes.push("Button--minimal");
  }

  if (href) {
    return (
      <a className={classes.join(" ")} href={href} {...rest}>
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
