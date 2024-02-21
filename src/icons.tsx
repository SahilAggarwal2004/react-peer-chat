import React from "react";

export type IconProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;

export function BiSolidMessageDetail(props: IconProps) {
  return (
    <span className="rpc-icon-container" {...props}>
      <svg viewBox="0 0 24 24" width="1.25rem" height="1.25rem">
        <path d="M20 2H4c-1.103 0-2 .894-2 1.992v12.016C2 17.106 2.897 18 4 18h3v4l6.351-4H20c1.103 0 2-.894 2-1.992V3.992A1.998 1.998 0 0 0 20 2zm-6 11H7v-2h7v2zm3-4H7V7h10v2z" />
      </svg>
    </span>
  );
}

export function BiSolidMessageX(props: IconProps) {
  return (
    <span className="rpc-icon-container" {...props}>
      <svg viewBox="0 0 24 24" width="1.25rem" height="1.25rem">
        <path d="M20 2H4c-1.103 0-2 .894-2 1.992v12.016C2 17.106 2.897 18 4 18h3v4l6.351-4H20c1.103 0 2-.894 2-1.992V3.992A1.998 1.998 0 0 0 20 2zm-3.293 11.293-1.414 1.414L12 11.414l-3.293 3.293-1.414-1.414L10.586 10 7.293 6.707l1.414-1.414L12 8.586l3.293-3.293 1.414 1.414L13.414 10l3.293 3.293z" />
      </svg>
    </span>
  );
}

export function GrSend(props: IconProps) {
  return (
    <span className="rpc-icon-container" {...props}>
      <svg viewBox="0 0 24 24" width="1.25rem" height="1.25rem" className="rpc-invert">
        <path fill="none" stroke="#000" strokeWidth={2} d="M22,3 L2,11 L20.5,19 L22,3 Z M10,20.5 L13,16 M15.5,9.5 L9,14 L9.85884537,20.0119176 C9.93680292,20.5576204 10.0751625,20.5490248 10.1651297,20.009222 L11,15 L15.5,9.5 Z" />
      </svg>
    </span>
  );
}

export function BsFillMicFill(props: IconProps) {
  return (
    <span className="rpc-icon-container" {...props}>
      <svg viewBox="0 0 16 16" fill="currentColor" width="1.25rem" height="1.25rem">
        <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z" />
        <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z" />
      </svg>
    </span>
  );
}

export function BsFillMicMuteFill(props: IconProps) {
  return (
    <span className="rpc-icon-container" {...props}>
      <svg viewBox="0 0 16 16" fill="currentColor" width="1.25rem" height="1.25rem">
        <path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879L5.158 2.037A3.001 3.001 0 0 1 11 3z" />
        <path d="M9.486 10.607 5 6.12V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z" />
      </svg>
    </span>
  );
}
