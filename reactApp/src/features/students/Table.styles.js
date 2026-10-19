import styled from 'styled-components';

export const TableWrapper = styled.div`
    margin: 2rem;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 2rem;
    border: 1px solid #e1e5e9;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: var(--table-height, calc(100vh - 200px)); /* Customizable height with fallback */

    .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 2px solid #f1f3f4;
        flex-shrink: 0; /* Don't shrink the header */

        h2 {
            margin: 0;
            color: #2c3e50;
            font-weight: 600;
            font-size: 1.75rem;
            letter-spacing: -0.025em;
        }

        button {
            background: #3498db;
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);

            &:hover {
                background: #2980b9;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
            }

            &:active {
                transform: translateY(0);
            }
        }
    }

    .table-controls {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        
        @media (max-width: 768px) {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
        }
    }

    .table-responsive {
        border: 1px solid #e1e5e9;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        background: white;
        flex: 1; /* Take remaining space */
        overflow-y: auto; /* Allow table to scroll if needed */
        margin-bottom: 1rem; /* Reduced margin since we have flex layout */

        .table-controls {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding: 1rem;
            background: #f8f9fa;
            border-bottom: 1px solid #e1e5e9;

            .height-control {
                display: flex;
                align-items: center;
                gap: 0.5rem;

                label {
                    font-size: 14px;
                    font-weight: 500;
                    color: #495057;
                    margin: 0;
                }

                select {
                    padding: 8px 12px;
                    border: 1px solid #ced4da;
                    border-radius: 6px;
                    font-size: 14px;
                    background: #ffffff;
                    color: #495057;
                    cursor: pointer;
                    transition: all 0.2s ease;

                    &:focus {
                        outline: none;
                        border-color: #3498db;
                        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
                    }

                    &:hover {
                        border-color: #adb5bd;
                    }
                }
            }
        }

        table {
            margin-bottom: 0;
            width: 100%;

            thead {
                background: #f8f9fa;
                z-index: 10;

                th {
                    border: none;
                    padding: 16px 20px;
                    font-weight: 600;
                    text-align: left;
                    color: #495057;
                    cursor: pointer;
                    user-select: none;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    transition: all 0.2s ease;
                    border-bottom: 2px solid #dee2e6;

                    &:hover {
                        background: #e9ecef;
                        color: #212529;
                    }
                }
            }

            tbody {
                tr {
                    border-bottom: 1px solid #f8f9fa;
                    transition: all 0.2s ease;

                    &:hover {
                        background: #f8f9fa;
                    }

                    &:nth-child(even) {
                        background: rgba(248, 249, 250, 0.5);
                    }

                    &:nth-child(even):hover {
                        background: #f8f9fa;
                    }

                    td {
                        padding: 16px 20px;
                        text-align: left;
                        vertical-align: middle;
                        border: none;
                        color: #333;
                        font-weight: 400;
                        font-size: 14px;
                        line-height: 1.5;

                        &:first-child {
                            font-weight: 500;
                            color: #2c3e50;
                        }

                        &:nth-child(2) {
                            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                            color: #3498db;
                            font-weight: 500;
                        }
                    }
                }
            }
        }
    }

    .btn {
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

        &.btn-outline-secondary {
            background: transparent;
            color: #6c757d;
            border-color: #6c757d;

            &:hover {
                background: #6c757d;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
            }
        }

        &.btn-outline-danger {
            background: transparent;
            color: #dc3545;
            border-color: #dc3545;

            &:hover {
                background: #dc3545;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
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

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
            box-shadow: none !important;
        }
    }

    /* Loading state */
    .loading-row {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
    }

    @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }

    /* Empty state */
    .empty-state {
        text-align: center;
        padding: 3rem;
        color: #6c757d;

        .empty-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        .empty-text {
            font-size: 1.1rem;
            font-weight: 500;
        }
    }

    /* Responsive design */
    @media (max-width: 1024px) {
        margin: 1.5rem;
        padding: 1.5rem;
        height: var(--table-height, calc(100vh - 150px));

        .table-header {
            h2 {
                font-size: 1.5rem;
            }
        }

        .table-responsive {
            .table-controls {
                padding: 0.75rem;
                
                .height-control {
                    label {
                        font-size: 13px;
                    }
                    
                    select {
                        padding: 6px 10px;
                        font-size: 13px;
                    }
                }
            }
            
            table {
                thead th, tbody td {
                    padding: 12px 16px;
                    font-size: 13px;
                }
            }
        }
    }

    @media (max-width: 768px) {
        margin: 1rem;
        padding: 1rem;
        height: var(--table-height, calc(100vh - 120px));

        .table-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;

            h2 {
                font-size: 1.3rem;
            }

            button {
                width: 100%;
                max-width: 200px;
            }
        }

        .table-responsive {
            .table-controls {
                padding: 0.5rem;
                justify-content: center;
                
                .height-control {
                    label {
                        font-size: 12px;
                    }
                    
                    select {
                        padding: 5px 8px;
                        font-size: 12px;
                    }
                }
            }
            
            font-size: 12px;
            border-radius: 8px;

            table {
                thead th, tbody td {
                    padding: 10px 12px;
                    font-size: 12px;
                }

                thead th {
                    font-size: 11px;
                    letter-spacing: 0.3px;
                }
            }
        }

        .btn {
            padding: 10px 20px;
            font-size: 12px;
            min-width: 100px;
        }
    }

    @media (max-width: 480px) {
        margin: 0.5rem;
        padding: 0.75rem;
        border-radius: 8px;
        height: var(--table-height, calc(100vh - 100px));

        .table-header {
            h2 {
                font-size: 1.2rem;
            }
        }

        .table-responsive {
            .table-controls {
                padding: 0.5rem;
                
                .height-control {
                    flex-direction: column;
                    gap: 0.25rem;
                    
                    label {
                        font-size: 11px;
                    }
                    
                    select {
                        padding: 4px 6px;
                        font-size: 11px;
                    }
                }
            }
            
            table {
                thead th, tbody td {
                    padding: 8px 10px;
                    font-size: 11px;
                }
            }
        }
    }

    /* Pagination container styles */
    .pagination-container {
        flex-shrink: 0; /* Don't shrink pagination */
        margin-top: auto; /* Push to bottom */
        padding-top: 1rem;
        border-top: 1px solid #e1e5e9;
    }
`;

export const TableActionWrapper = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #dee2e6;
`;