import React from "react";

interface SuccessMessageProps {
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

const SuccessMessage = ({ message, className, children }: SuccessMessageProps) => {
  if (!message && !children) return null;
  return (
    <div className={`rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ${className ?? ""}`}>
      {message ? <p>{message}</p> : children}
    </div>
  );
};

export default SuccessMessage;
