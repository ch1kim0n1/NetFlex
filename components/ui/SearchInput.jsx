import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { useRouter } from "next/router";
import { CgSearch } from "react-icons/cg";

// Wrap the component with forwardRef to use ref from parent
const SearchInput = forwardRef(({ type }, ref) => {
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("shows");
  const router = useRouter();
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focusInput: () => {
      inputRef.current.focus();
    },
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search) return;
    router.push(`/${searchType}/search/${search}`);
  };

  return (
    <div className="p-6 bg-netflix-dark border border-netflix-gray rounded-2xl space-y-5 max-w-md mx-auto">
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

      <form onSubmit={handleSubmit} className="sm:w-[350px] rounded-md transition-all h-12 flex items-center space-x-2 bg-netflix-gray/20 border border-netflix-gray/30">
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-netflix-white placeholder:text-netflix-text-gray bg-transparent w-full outline-none pl-4 h-full"
          placeholder={`Search ${searchType === "shows" ? "TV shows" : "movies"}...`}
        />
        <button
          type="submit"
          className="text-netflix-text-gray hover:text-netflix-white text-2xl transition-all pr-4"
        >
          <CgSearch />
        </button>
      </form>
    </div>
  );
});

export default SearchInput;