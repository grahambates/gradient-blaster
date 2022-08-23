import React from "react";
import "./Button.css";

export type ButtonProps = {
  dark?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  minimal?: boolean;
  href?: string;
} & (
  | React.ButtonHTMLAttributes<HTMLButtonElement>
  | React.AnchorHTMLAttributes<HTMLAnchorElement>
);

function Button({
  dark,
  iconLeft,
  iconRight,
  minimal,
  children,
  href,
  ...rest
}: ButtonProps) {
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
      <a
        className={classes.join(" ")}
        href={href}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {iconLeft}
        {children}
        {iconRight}
      </a>
    );
  }
  return (
    <button
      className={classes.join(" ")}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}

export default Button;
