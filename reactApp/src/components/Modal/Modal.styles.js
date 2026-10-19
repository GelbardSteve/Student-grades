import Modal from 'react-modal';
import styled from 'styled-components';

export const StyledModal = styled(Modal)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid #e1e5e9;
  
  &:focus {
    outline: none;
  }
  
  .modal-content {
    padding: 0;
  }
  
  .modal-header {
    background: #f8f9fa;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e1e5e9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6c757d;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      box-sizing: border-box;
      
      &:hover {
        background: none;
        color: #495057;
      }
      
      &:active {
        background: none;
        transform: scale(0.95);
      }
    }
  }
  
  .modal-body {
    padding: 2rem;
    max-height: 60vh;
    overflow-y: auto;
    
    .form-group {
      margin-bottom: 1.5rem;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #495057;
        font-weight: 500;
        font-size: 14px;
      }
      
      input, select, textarea {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid #ced4da;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.2s ease;
        background: #ffffff;
        
        &:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
        
        &::placeholder {
          color: #adb5bd;
        }
      }
      
      textarea {
        resize: vertical;
        min-height: 100px;
      }
    }
  }
  
  .modal-footer {
    background: #f8f9fa;
    padding: 1.5rem 2rem;
    border-top: 1px solid #e1e5e9;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    
    button {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid;
      
      &.btn-secondary {
        background: #6c757d;
        border-color: #6c757d;
        color: #ffffff;
        
        &:hover {
          background: #5a6268;
          border-color: #545b62;
        }
      }
      
      &.btn-primary {
        background: #3498db;
        border-color: #3498db;
        color: #ffffff;
        
        &:hover {
          background: #2980b9;
          border-color: #2980b9;
        }
      }
      
      &.btn-success {
        background: #28a745;
        border-color: #28a745;
        color: #ffffff;
        
        &:hover {
          background: #218838;
          border-color: #1e7e34;
        }
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
  
  /* Custom scrollbar for modal body */
  .modal-body::-webkit-scrollbar {
    width: 6px;
  }
  
  .modal-body::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .modal-body::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  .modal-body::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    width: 95%;
    margin: 1rem;
    
    .modal-header {
      padding: 1rem 1.5rem;
      
      h2 {
        font-size: 1.25rem;
      }
    }
    
    .modal-body {
      padding: 1.5rem;
    }
    
    .modal-footer {
      padding: 1rem 1.5rem;
      flex-direction: column;
      
      button {
        width: 100%;
      }
    }
  }
`;

export const StyleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;
