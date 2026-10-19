import styled from 'styled-components';

export const StyledWrapper = styled.div`
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    border: none;
`;

export const StyledLi = styled.li`
    cursor: pointer;
`;

export const StyledFormWrapper = styled.div`
   display: flex;
   align-items: stretch;
   min-height: 600px;
`;

export const StyledForm = styled.form`
    flex: 1;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: white;
    margin: 0;
    width: auto;
    max-width: none;
    min-width: auto;

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

        &.toggle-btn {
            background: transparent;
            color: #6c757d;
            border-color: #6c757d;
            margin: 0 4px;

            &:hover {
                background: #6c757d;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
            }

            &.active {
                background: #3498db;
                border-color: #3498db;
                color: #ffffff;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
            }
        }

        &.login-submit-btn {
            background: #3498db;
            border-color: #3498db;
            color: #ffffff;
            width: 100%;
            margin-top: 20px;

            &:hover {
                background: #2980b9;
                border-color: #2980b9;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
            }

            &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none !important;
                box-shadow: none !important;
            }
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
    }

    @media (max-width: 768px) {
        padding: 20px;
        
        button {
            padding: 10px 20px;
            font-size: 12px;
            min-width: 100px;
        }
    }
`;