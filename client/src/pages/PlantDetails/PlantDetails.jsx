import Container from "../../components/Shared/Container";
import { Helmet } from "react-helmet-async";
import Heading from "../../components/Shared/Heading";
import Button from "../../components/Shared/Button/Button";
import PurchaseModal from "../../components/Modal/PurchaseModal";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const PlantDetails = () => {
  // const [plants, setPlants] = useState([]);

  const { id } = useParams();

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const { data } = await axios.get(
  //       `${import.meta.env.VITE_API_URL}/details/${id}`
  //     );
  //     setPlants(data);
  //   };
  //   fetchData();
  // }, []);

  const { data: plants = [] } = useQuery({
    queryKey: ["plants", id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/details/${id}`
      );
      return response.data;
    },
  });
  const { name, category, description, image, seller, quantity, price } =
    plants;
    // console.log(plants)

  let [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <Container>
      <Helmet>
        <title>Money Plant</title>
      </Helmet>
      <div className="mx-auto flex flex-col lg:flex-row justify-between w-full gap-12">
        {/* Header */}
        <div className="flex flex-col gap-6 flex-1">
          <div>
            <div className="w-full overflow-hidden rounded-xl">
              <img className="object-cover w-full" src={image} />
            </div>
          </div>
        </div>
        <div className="md:gap-10 flex-1">
          {/* Plant Info */}
          <Heading title={name} subtitle={`Category: ${category}`} />
          <hr className="my-6" />
          <div
            className="
          text-lg font-light text-neutral-500"
          >
            {description}
          </div>
          <hr className="my-6" />

          <div
            className="
                text-xl 
                font-semibold 
                flex 
                flex-row 
                items-center
                gap-2
              "
          >
            <div>Seller: {seller?.name}</div>

            <img
              className="rounded-full"
              height="30"
              width="30"
              alt="Avatar"
              referrerPolicy="no-referrer"
              src={seller?.image}
            />
          </div>
          <hr className="my-6" />
          <div>
            <p
              className="
                gap-4 
                font-light
                text-neutral-500
              "
            >
              Quantity: {quantity} Units Left Only!
            </p>
          </div>
          <hr className="my-6" />
          <div className="flex justify-between">
            <p className="font-bold text-3xl text-gray-500">Price: {price}$</p>
            <div>
              <Button label="Purchase" />
            </div>
          </div>
          <hr className="my-6" />

          <PurchaseModal closeModal={closeModal} isOpen={isOpen} />
        </div>
      </div>
    </Container>
  );
};

export default PlantDetails;
