import styled from 'styled-components';

export const StyleHeader = styled.header`
  display: flex;
  justify-content: space-between;
  margin-bottom: 100px;
  padding: 4px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #cfd8dc;
  color: #fff;
  padding: 10px;
  z-index: 1000;

  button {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
    border: 2px solid;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    overflow: hidden;
    min-width: 120px;
    margin: 0 8px;

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

    &.btn-outline-info {
      background: transparent;
      color: #17a2b8;
      border-color: #17a2b8;

      &:hover {
        background: #17a2b8;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(23, 162, 184, 0.4);
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

    &.active {
      background: #007bff;
      border-color: #007bff;
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }
  }

  @media (max-width: 768px) {
    button {
      padding: 10px 20px;
      font-size: 12px;
      min-width: 100px;
      margin: 4px;
    }
  }
`;

export const StyledFooter = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #cfd8dc;
  color: #fff;
  padding: 15px;
  z-index: 1000;
`;

export const StyledMain = styled.main`
  margin: 5em 0;
`;
