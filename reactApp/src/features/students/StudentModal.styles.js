import styled from 'styled-components';

export const StyledFotter = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-top: 1px solid #e1e5e9;
  
  button {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid;
    min-width: 120px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    overflow: hidden;
    
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }
    
    &:hover:before {
      left: 100%;
    }
    
    &.btn-secondary {
      background: #6c757d;
      border-color: #6c757d;
      color: #ffffff;
      
      &:hover {
        background: #5a6268;
        border-color: #545b62;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
      }
    }
    
    &.btn-primary {
      background: #3498db;
      border-color: #3498db;
      color: #ffffff;
      
      &:hover {
        background: #2980b9;
        border-color: #2980b9;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
      }
    }
    
    &.btn-success {
      background: #28a745;
      border-color: #28a745;
      color: #ffffff;
      
      &:hover {
        background: #218838;
        border-color: #1e7e34;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
      }
    }
    
    &.btn-danger {
      background: #dc3545;
      border-color: #dc3545;
      color: #ffffff;
      
      &:hover {
        background: #c82333;
        border-color: #bd2130;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
      }
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem 1.5rem;
    
    button {
      width: 100%;
    }
  }
`;

export const ModalForm = styled.div`
  padding: 2rem;
  
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
      
      &.error {
        border-color: #dc3545;
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
        
        &:focus {
          border-color: #dc3545;
          box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
        }
      }
      
      &:read-only {
        background: #f8f9fa;
        color: #6c757d;
        cursor: not-allowed;
      }
    }
    
    textarea {
      resize: vertical;
      min-height: 100px;
    }
    
    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 0.25rem;
      font-weight: 500;
    }
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e1e5e9;
    
    button {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid;
      min-width: 120px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      position: relative;
      overflow: hidden;
      
      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s;
      }
      
      &:hover:before {
        left: 100%;
      }
      
      &.btn-secondary {
        background: #6c757d;
        border-color: #6c757d;
        color: #ffffff;
        
        &:hover {
          background: #5a6268;
          border-color: #545b62;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
        }
      }
      
      &.btn-primary {
        background: #3498db;
        border-color: #3498db;
        color: #ffffff;
        
        &:hover {
          background: #2980b9;
          border-color: #2980b9;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
        }
      }
      
      &.btn-success {
        background: #28a745;
        border-color: #28a745;
        color: #ffffff;
        
        &:hover {
          background: #218838;
          border-color: #1e7e34;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
        }
      }
      
      &.btn-danger {
        background: #dc3545;
        border-color: #dc3545;
        color: #ffffff;
        
        &:hover {
          background: #c82333;
          border-color: #bd2130;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
        }
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
      }
    }
    
    @media (max-width: 768px) {
      flex-direction: column;
      
      button {
        width: 100%;
      }
    }
  }
`;
