import { BsFingerprint } from "react-icons/bs";
import { GrUserAdmin } from "react-icons/gr";
import MenuItem from "./MenuItem";
import { useState } from "react";
import BecomeSellerModal from "../../../Modal/BecomeSellerModal";
import useAuth from "../../../../hooks/useAuth";
import axios from "axios";
const CustomerMenu = () => {
  const {user} = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };
  const requestHandler =async () => {
      try {
        const {data} = await axios.patch( `${import.meta.env.VITE_API_URL}/user/${user?.email}`,
          )

          console.log(data)
      } catch (error) {
        console.log(error)
      }finally{
        closeModal()
      }

  };

  return (
    <>
      <MenuItem icon={BsFingerprint} label="My Orders" address="my-orders" />

      <div
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 mt-5  transition-colors duration-300 transform text-gray-600  hover:bg-gray-300   hover:text-gray-700 cursor-pointer"
      >
        <GrUserAdmin className="w-5 h-5" />

        <span className="mx-4 font-medium">Become A Seller</span>
      </div>

      <BecomeSellerModal requestHandler={requestHandler} closeModal={closeModal} isOpen={isOpen} />
    </>
  );
};

export default CustomerMenu;
