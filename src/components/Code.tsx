import React, { useRef, useEffect } from "react";
import "./Code.css";

export interface CodeProps {
  code: string;
}

const Code = ({ code }: CodeProps) => {
  const preRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    const processed = code
      .replace(/((\$|0x)[0-9a-f]+)/gi, "<span class='Code__hex'>$1</span>")
      .replace(/(\b[0-9]+\b)/gi, "<span class='Code__hex'>$1</span>")
      .replace(/((\/\/|;|Rem).+)/gi, "<span class='Code__comment'>$1</span>")
      .replace(/(.+:\n)/gi, "<span class='Code__label'>$1</span>")
      .replace(/(dc.(w|l)|Data)/gi, "<span class='Code__directive'>$1</span>")
      .replace(
        /(unsigned|short|long)/gi,
        "<span class='Code__keyword'>$1</span>",
      );

    preRef.current!.innerHTML = processed;
  }, [code]);
  return <pre className="Code" ref={preRef} />;
};

export default Code;
