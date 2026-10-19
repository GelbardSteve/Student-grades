import {
  SearchContainer,
  SearchIcon,
  SearchLabel,
  SearchResults,
  StyledInput,
  StyledWrapper
} from './Search.styles';

export const SearchInput = ({ value, onSearchChange, isDisabled, totalResults, filteredResults }) => {
  return (
    <StyledWrapper>
      <SearchLabel htmlFor="searchInput">
        Search Students
      </SearchLabel>
      
      <SearchContainer>
        <SearchIcon>🔍</SearchIcon>
        
        <StyledInput
          id="searchInput"
          name="searchInput"
          data-test-specifier='search-input'
          value={value}
          onChange={onSearchChange}
          placeholder="Search by name or student number..."
          type="search"
          disabled={isDisabled}
          autoComplete="off"
        />
      </SearchContainer>
      
      {totalResults !== undefined && filteredResults !== undefined && (
        <SearchResults>
          {value ? (
            `Showing ${filteredResults} of ${totalResults} students`
          ) : (
            `Total: ${totalResults} students`
          )}
        </SearchResults>
      )}
    </StyledWrapper>
  );
};