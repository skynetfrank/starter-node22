function MessageBox({ variant = "info", children, onClose }) {
  // Añade la clase 'closable' si se proporciona la función onClose
  const finalClassName = `message-box ${variant} ${onClose ? "closable" : ""}`;
  return (
    <div className={finalClassName} onClick={onClose}>
      {children}
    </div>
  );
}

export default MessageBox;
