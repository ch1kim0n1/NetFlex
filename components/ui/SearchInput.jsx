import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { useRouter } from "next/router";
import { CgSearch } from "react-icons/cg";
import SearchAutocomplete from "./SearchAutocomplete";

// Wrap the component with forwardRef to use ref from parent
const SearchInput = forwardRef(({ type }, ref) => {
  const [searchType, setSearchType] = useState("shows");
  const [isAutocompleteFocused, setIsAutocompleteFocused] = useState(false);
  const router = useRouter();
  const autocompleteRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focusInput: () => {
      setIsAutocompleteFocused(true);
    },
  }));

  const handleClose = () => {
    setIsAutocompleteFocused(false);
  };

  return (
    <div className="p-6 bg-netflix-dark border border-netflix-gray rounded-2xl space-y-5 max-w-2xl mx-auto">
      <p className="text-netflix-white text-lg font-semibold">Looking for something?</p>
      
      {/* Search Type Toggle */}
      <div className="flex bg-netflix-gray/30 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setSearchType("shows")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            searchType === "shows"
              ? "bg-netflix-red text-netflix-white"
              : "text-netflix-text-gray hover:text-netflix-white"
          }`}
        >
          TV Shows
        </button>
        <button
          type="button"
          onClick={() => setSearchType("movies")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            searchType === "movies"
              ? "bg-netflix-red text-netflix-white"
              : "text-netflix-text-gray hover:text-netflix-white"
          }`}
        >
          Movies
        </button>
      </div>

      {/* Search Autocomplete */}
      <SearchAutocomplete
        ref={autocompleteRef}
        searchType={searchType}
        onClose={handleClose}
        autoFocus={isAutocompleteFocused}
      />
    </div>
  );
});

export default SearchInput;