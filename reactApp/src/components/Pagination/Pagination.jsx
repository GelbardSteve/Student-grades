import { Button } from '../Button/Button';
import { StyledNav } from './Pagination.styles';

export const Pagination = ({ numberOfRows, onPageChange, currentPage, totalItems }) => {
  // Calculate total pages based on totalItems
  const totalPages = Math.ceil(totalItems / numberOfRows);
  
  // Generate array of page numbers
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <StyledNav aria-label="Page navigation">
      <ul className="pagination">
        {pages.map((page) => (
          <li key={page}>
            <Button
              onClick={() => {
                onPageChange(page)
              }}
              className={`mr-1 ${page === currentPage ? 'page-item active' : 'page-item'}`}
            >
              {page}
            </Button>
          </li>
        ))}
      </ul>    
    </StyledNav>
  );
};