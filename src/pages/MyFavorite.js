import React from 'react';
import BasicLayout from "../layouts/BasicLayout";
import FavoriteList from '../components/card/FavoriteList';

function MyFavorite() {
    
    return (
        <BasicLayout>
            <FavoriteList />
        </BasicLayout>
    );
}

export default MyFavorite;