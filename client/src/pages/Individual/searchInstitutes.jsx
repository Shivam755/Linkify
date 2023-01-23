import React from "react";
import SearchComp from "../../components/search";
import Title from "../../components/title";

const SearchInstitutes = () => {
  return (
    <div>
      <Title title="Find Institutes" />
      <SearchComp type={"Institute"} />
    </div>
  );
};

export default SearchInstitutes;
