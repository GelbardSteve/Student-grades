
export const Button = ({ onClick, type = 'button', buttonType = 'outline-info', disabled, className, children, isLoading, dataTestSpecifier }) => {  
  return (
    <button disabled={disabled} onClick={onClick} type={type} className={`btn btn-${buttonType} ${className}`} data-test-specifier={dataTestSpecifier}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
