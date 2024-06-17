import React,{useState,useEffect} from "react";
import axios from "axios";
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { API_URLS } from "../../api/apiConfig";

const BoothLikeButton = ({boothId, member_id}) =>{
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        const checkIfLiked = async () => {
            if (!member_id) {
                alert("로그인을 해주세요");
                return;
            }
            try {
                const response = await axios.post(API_URLS.BOOTH_LIKED, {
                    boothId: boothId,
                    member_id: member_id
                });
                setLiked(response.data.liked);
            } catch (error) {
                console.error("Error checking like status", error);
            }
        };

        checkIfLiked();
    }, [boothId, member_id]);

    const handleLikeToggle = async () => {
        if (!member_id) {
            alert("로그인을 해주세요");
            return;
        }
        
        try {
            if (liked) {
                await axios.post(API_URLS.BOOTH_UNLIKE, {
                    boothId: boothId,
                    member_id: member_id
                });
            } else {
                await axios.post(API_URLS.BOOTH_LIKE, {
                    boothId: boothId,
                    member_id: member_id
                });
            }
            setLiked(!liked);
        } catch (error) {
            console.error("Error toggling like", error);
        }
    };

    return (
        <div onClick={ handleLikeToggle} className="hover:cursor-pointer">
            {liked ? <FaHeart color="red" size={24} /> : <FaRegHeart color="grey" size={24} />}
        </div>
    );

};
export default BoothLikeButton;