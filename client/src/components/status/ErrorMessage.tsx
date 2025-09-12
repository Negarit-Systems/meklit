
import React from "react";

interface ErrorMessageProps {
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

const ErrorMessage = ({ message, className, children }: ErrorMessageProps) => {
  if (!message && !children) return null;
  return (
    <div className={`rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 ${className ?? ""}`}>
      {message ? <p>{message}</p> : children}
    </div>
  );
};

export default ErrorMessage;
