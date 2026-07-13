"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  wrapperStyle?: React.CSSProperties;
};

export default function PasswordInput({ style, wrapperStyle, ...rest }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: "relative", ...wrapperStyle }}>
      <input
        {...rest}
        type={visible ? "text" : "password"}
        style={{ ...style, paddingRight: 40 }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        style={{
          position: "absolute", top: "50%", right: 10, transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer", padding: 4,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--text-muted)",
        }}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
