import React from 'react';
import FavoriteList from "../components/card/FavoriteList"; 

function FavoriteComponent({}) {

  return (
      <FavoriteList favoriteEvents={favoriteEvents} />
  );
}

export default FavoriteComponent;