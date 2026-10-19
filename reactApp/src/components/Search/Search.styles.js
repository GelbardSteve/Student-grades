import styled from 'styled-components';

export const StyledWrapper = styled.div`
  margin-bottom: 2rem;
  position: relative;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

export const SearchLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  &::before {
    content: '🔍';
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.1rem;
    z-index: 2;
    pointer-events: none;
    transition: all 0.3s ease;
  }
  
  &:focus-within::before {
    transform: translateY(-50%) scale(1.1);
  }
`;

export const StyledInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &::placeholder {
    color: #adb5bd;
    font-style: italic;
  }
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    transform: translateY(-2px);
  }
  
  &:hover:not(:focus) {
    border-color: #ced4da;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  /* Clear button styling */
  &::-webkit-search-cancel-button {
    -webkit-appearance: none;
    appearance: none;
    height: 16px;
    width: 16px;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'><path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/></svg>");
    background-size: contain;
    cursor: pointer;
    margin-right: 0.5rem;
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 1rem 0.875rem 2.75rem;
    font-size: 0.95rem;
  }
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1.1rem;
  pointer-events: none;
  transition: all 0.3s ease;
  z-index: 2;
  
  ${SearchContainer}:focus-within & {
    color: #667eea;
    transform: translateY(-50%) scale(1.1);
  }
`;

export const ClearButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;
  visibility: hidden;
  
  &:hover {
    background-color: #f8f9fa;
    color: #495057;
  }
  
  ${({ hasValue }) => hasValue && `
    opacity: 1;
    visibility: visible;
  `}
`;

export const SearchResults = styled.div`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;