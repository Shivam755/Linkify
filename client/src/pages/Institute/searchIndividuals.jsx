import React from "react";
import SearchComp from "../../components/search";
import Title from "../../components/title";

const SearchIndividuals = () => {
  return (
    <div>
      <Title title="Find Individuals" />
      <SearchComp type={"Individual"} />
    </div>
  );
};

export default SearchIndividuals;
