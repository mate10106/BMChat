import React from "react";
import Userinfo from "./userInfo/Userinfo";
import Chatlist from "./chatlist/Chatlist";

const List = () => {
  return (
    <div className="block w-full h-full mt-2 lg:w-auto">
      <div className="w-full h-full lg:w-auto">
        <Userinfo />
        <Chatlist />
      </div>
    </div>
  );
};

export default List;
