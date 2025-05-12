import React, { useRef } from 'react';

export default function FocusInput() {
  const inputRef = useRef(null);
  const submitRef = useRef(null);

  const handleClick = () => {
    inputRef.current.focus(); // Input field me focus aa jayega
  };
  const submitRefs = () => {
    submitRef.current.focus(); // Input field me focus aa jayega
    console.log(submitRef);
    console.log(submitRef.current);
    console.log(submitRef.current.focus());
  };

  return (
    <div>
      <input ref={inputRef} type="text" placeholder="Type something..." />
      <input ref={submitRef} type="text" placeholder="Type something..." />
      <button onClick={handleClick}>Focus Input</button>
      <button onClick={submitRefs}>submitRef</button>
    </div>
  );
}
