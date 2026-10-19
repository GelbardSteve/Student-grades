import styled from 'styled-components';

export const StyledWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #e1e5e9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-top: 1rem;
`;

export const StyledShowPage = styled.p`
    margin: 0;
    color: #6c757d;
    font-size: 14px;
    font-weight: 500;
`;

export const StyledNav = styled.nav`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    ul {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
        gap: 0.25rem;
        
        li {
            margin: 0;
            
            button {
                padding: 12px 16px;
                border: 2px solid #dee2e6;
                background: #ffffff;
                color: #495057;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 44px;
                text-align: center;
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
                
                &:hover {
                    background: #f8f9fa;
                    border-color: #adb5bd;
                    color: #212529;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    
                    &:before {
                        left: 100%;
                    }
                }
                
                &:disabled {
                    background: #f8f9fa;
                    color: #adb5bd;
                    cursor: not-allowed;
                    border-color: #e9ecef;
                    transform: none !important;
                    box-shadow: none !important;
                }
                
                &.active {
                    background: #3498db;
                    border-color: #3498db;
                    color: #ffffff;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
                    
                    &:hover {
                        background: #2980b9;
                        border-color: #2980b9;
                    }
                }
            }
        }
    }
    
    @media (max-width: 768px) {
        ul li button {
            padding: 10px 14px;
            font-size: 12px;
            min-width: 40px;
        }
    }
`;

